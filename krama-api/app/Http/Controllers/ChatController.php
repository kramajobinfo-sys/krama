<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    // POST /api/chat — public support-assistant proxy to the Anthropic Messages API.
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
        $apiKey  = trim($cfg['apiKey'] ?? '');

        // Graceful fallback when the assistant isn't configured yet.
        if (! $enabled || $apiKey === '') {
            return response()->json([
                'reply' => "Thanks for your message! Our live assistant isn't available right now — please browse Find jobs, or contact us and a Krama specialist will follow up.",
                'configured' => false,
            ]);
        }

        $model = trim($cfg['model'] ?? '') ?: 'claude-haiku-4-5';

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
                Log::warning('Chat assistant API error: ' . $resp->status() . ' ' . $resp->body());
                return response()->json([
                    'reply' => "Sorry — I'm having trouble responding right now. Please try again in a moment.",
                ], 200);
            }

            $body = $resp->json();

            // Extract the first text block from the Messages API response content array.
            $reply = '';
            foreach ($body['content'] ?? [] as $block) {
                if (($block['type'] ?? null) === 'text') {
                    $reply = $block['text'];
                    break;
                }
            }
            if ($reply === '') {
                $reply = "Sorry — I couldn't produce a response. Please try rephrasing your question.";
            }

            return response()->json(['reply' => $reply]);
        } catch (\Exception $e) {
            Log::warning('Chat assistant request failed: ' . $e->getMessage());
            return response()->json([
                'reply' => "Sorry — I'm having trouble responding right now. Please try again in a moment.",
            ], 200);
        }
    }
}
