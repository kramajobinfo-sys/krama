<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    // Fallback models when an admin hasn't pinned one. Gemini Flash has a free tier;
    // Claude Haiku is paid but has no rate-limit cliff — see the provider switch below.
    private const DEFAULT_GEMINI_MODEL    = 'gemini-2.0-flash';
    private const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-4-5';

    // POST /api/chat — public support-assistant proxy to the configured LLM
    // (Google Gemini or Anthropic Claude, selected by the `provider` chat setting).
    // The API key lives server-side (chat settings) and never reaches the browser.
    public function send(Request $request)
    {
        $data = $request->validate([
            'message'           => 'required|string|max:4000',
            'history'           => 'nullable|array|max:20',
            'history.*.role'    => 'required_with:history|in:user,assistant',
            'history.*.content' => 'required_with:history|string|max:4000',
        ]);

        $cfg = Setting::where('group', 'chat')->pluck('value', 'key')->toArray();

        $enabled = ! empty($cfg['enabled']) && $cfg['enabled'] !== '0';

        // Resolve the provider. Default is Gemini (free tier), but if the selected
        // provider has no key while the other one does, fall back to the configured
        // one — so changing the default (or deploying before a Gemini key is pasted)
        // never silently drops a working assistant into canned-reply mode.
        $geminiKey = trim($cfg['gemini_api_key'] ?? '');
        $claudeKey = trim($cfg['apiKey'] ?? '');
        $provider  = strtolower(trim($cfg['provider'] ?? '')) ?: 'gemini';

        if ($provider === 'gemini' && $geminiKey === '' && $claudeKey !== '') {
            $provider = 'anthropic';
        } elseif ($provider === 'anthropic' && $claudeKey === '' && $geminiKey !== '') {
            $provider = 'gemini';
        }

        $apiKey = $provider === 'gemini' ? $geminiKey : $claudeKey;

        // Graceful fallback when the assistant isn't configured yet.
        if (! $enabled || $apiKey === '') {
            return response()->json([
                'reply' => "Thanks for your message! Our live assistant isn't available right now — please browse Find jobs, or contact us and a Krama specialist will follow up.",
                'configured' => false,
            ]);
        }

        // M-S1: global daily budget so this public, unauthenticated proxy can't be driven
        // into unbounded paid completions by distributed clients (the per-IP throttle alone
        // doesn't cap aggregate spend). Fails CLOSED — over budget → canned reply, no API call.
        // Admin-tunable via chat settings; sensible defaults for an SME support widget.
        $today       = now()->format('Y-m-d');
        $reqKey      = "chat.daily.requests.$today";
        $tokKey      = "chat.daily.tokens.$today";
        $maxRequests = (int) ($cfg['daily_request_limit'] ?? 2000);
        $maxTokens   = (int) ($cfg['daily_token_limit'] ?? 500000);

        if ((int) Cache::get($reqKey, 0) >= $maxRequests || (int) Cache::get($tokKey, 0) >= $maxTokens) {
            return response()->json([
                'reply'        => "Our assistant is taking a short break due to high demand — please try again later, or browse Find jobs in the meantime.",
                'configured'   => true,
                'rate_limited' => true,
            ]);
        }

        $model = $provider === 'gemini'
            ? (trim($cfg['gemini_model'] ?? '') ?: self::DEFAULT_GEMINI_MODEL)
            : (trim($cfg['model'] ?? '') ?: self::DEFAULT_ANTHROPIC_MODEL);

        // Build the system prompt: a Krama-aware base plus any admin-provided instructions.
        $base = "You are the Krama assistant, a helpful support agent for Krama — an online job board and recruitment platform in Cambodia. "
              . "Krama connects candidates (who search and apply for jobs, save jobs, build a résumé, and follow companies) with employers "
              . "(who post jobs, review applicants through a hiring pipeline, and manage a company profile). "
              . "Answer questions about finding and applying to jobs, managing applications, employer job posting, subscriptions, and account setup. "
              . "Be concise, friendly, and practical. If you don't know something specific to a user's account, suggest where in the site to look "
              . "or to contact support. Do not invent policies, prices, or features you're unsure about.";
        $custom = trim($cfg['system_prompt'] ?? '');
        $system = $custom !== '' ? ($base . "\n\n" . $custom) : $base;

        // Assemble the conversation: prior history (already role-tagged) + the new user turn.
        $messages = [];
        foreach ($data['history'] ?? [] as $turn) {
            $messages[] = ['role' => $turn['role'], 'content' => $turn['content']];
        }
        // The Messages API requires the first message to be from the user — the widget's
        // history often starts with the assistant's welcome, so drop any leading assistant turns.
        while (! empty($messages) && $messages[0]['role'] === 'assistant') {
            array_shift($messages);
        }
        $messages[] = ['role' => 'user', 'content' => $data['message']];

        try {
            $result = $provider === 'gemini'
                ? $this->callGemini($apiKey, $model, $system, $messages)
                : $this->callAnthropic($apiKey, $model, $system, $messages);

            if ($result === null) {
                return response()->json([
                    'reply' => "Sorry — I'm having trouble responding right now. Please try again in a moment.",
                ], 200);
            }

            // Charge this call against the global daily budget (M-S1). Counters expire
            // at midnight so the budget resets each day. Cache::add seeds the key with a
            // TTL only if absent; increment is atomic on shared stores (redis/database).
            $eod = now()->endOfDay();
            Cache::add($reqKey, 0, $eod);
            Cache::increment($reqKey);
            Cache::add($tokKey, 0, $eod);
            Cache::increment($tokKey, max(1, $result['tokens']));

            $reply = trim($result['reply']) !== ''
                ? $result['reply']
                : "Sorry — I couldn't produce a response. Please try rephrasing your question.";

            return response()->json(['reply' => $reply]);
        } catch (\Exception $e) {
            Log::warning('Chat assistant request failed: ' . $e->getMessage());
            return response()->json([
                'reply' => "Sorry — I'm having trouble responding right now. Please try again in a moment.",
            ], 200);
        }
    }

    /**
     * Anthropic Messages API. Returns ['reply' => string, 'tokens' => int] or null on failure.
     * $messages is already normalised to [['role' => user|assistant, 'content' => string], …].
     */
    private function callAnthropic(string $apiKey, string $model, string $system, array $messages): ?array
    {
        $resp = Http::withHeaders([
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])
            ->timeout(30)
            ->post('https://api.anthropic.com/v1/messages', [
                'model'      => $model,
                'max_tokens' => 1024,
                'system'     => $system,
                'messages'   => $messages,
            ]);

        if (! $resp->successful()) {
            Log::warning('Chat assistant (anthropic) API error: ' . $resp->status() . ' ' . $resp->body());
            return null;
        }

        $body  = $resp->json();
        $reply = '';
        foreach ($body['content'] ?? [] as $block) {
            if (($block['type'] ?? null) === 'text') {
                $reply = $block['text'];
                break;
            }
        }

        return [
            'reply'  => (string) $reply,
            'tokens' => (int) (($body['usage']['input_tokens'] ?? 0) + ($body['usage']['output_tokens'] ?? 0)),
        ];
    }

    /**
     * Google Gemini generateContent API (free Flash tier). Returns the same shape as
     * callAnthropic(), or null on failure.
     *
     * Differences from Anthropic worth noting:
     *  - the system prompt is its own `system_instruction` object, not a top-level string
     *  - the assistant role is called `model`, not `assistant`
     *  - text arrives as an array of `parts`, which we concatenate
     *  - the key goes in the x-goog-api-key header, never the query string, so it can't
     *    leak into access logs or proxy traces
     */
    private function callGemini(string $apiKey, string $model, string $system, array $messages): ?array
    {
        $contents = [];
        foreach ($messages as $turn) {
            $contents[] = [
                'role'  => $turn['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $turn['content']]],
            ];
        }

        $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/'
                  . rawurlencode($model) . ':generateContent';

        $resp = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
                'content-type'   => 'application/json',
            ])
            ->timeout(30)
            ->post($endpoint, [
                'system_instruction' => ['parts' => [['text' => $system]]],
                'contents'           => $contents,
                'generationConfig'   => ['maxOutputTokens' => 1024],
            ]);

        if (! $resp->successful()) {
            Log::warning('Chat assistant (gemini) API error: ' . $resp->status() . ' ' . $resp->body());
            return null;
        }

        $body = $resp->json();

        // A safety filter can return 200 with no candidates — surface that as a normal
        // reply rather than a generic failure so the visitor gets something useful.
        if (empty($body['candidates'])) {
            $blocked = $body['promptFeedback']['blockReason'] ?? null;
            if ($blocked) {
                Log::info('Chat assistant (gemini) blocked a prompt: ' . $blocked);
                return [
                    'reply'  => "I can't help with that one, sorry. Try asking about finding jobs, applying, or your Krama account.",
                    'tokens' => (int) ($body['usageMetadata']['totalTokenCount'] ?? 0),
                ];
            }
            Log::warning('Chat assistant (gemini) returned no candidates: ' . $resp->body());
            return null;
        }

        $reply = '';
        foreach ($body['candidates'][0]['content']['parts'] ?? [] as $part) {
            if (isset($part['text'])) {
                $reply .= $part['text'];
            }
        }

        return [
            'reply'  => $reply,
            'tokens' => (int) ($body['usageMetadata']['totalTokenCount'] ?? 0),
        ];
    }
}
