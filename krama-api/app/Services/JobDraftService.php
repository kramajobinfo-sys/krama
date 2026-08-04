<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Drafts a job posting (description / requirements / benefits) from a title + light
 * context using the already-configured AI provider. Reuses the CV-Match / Chat-agent
 * AI settings and the same Messages/generateContent call shapes as CvMatchService —
 * no new keys or config. Returns HTML fragments (sanitized on write by the caller).
 */
class JobDraftService
{
    /** @return array{description:string,requirements:string,benefits:string} */
    public static function draft(array $in): array
    {
        // Same provider/key/model resolution as EmployerCvMatchController.
        $cvm = Setting::where('group', 'cv_match')->pluck('value', 'key')->toArray();
        $provider = trim($cvm['ai_provider'] ?? '') === 'gemini' ? 'gemini' : 'claude';

        if ($provider === 'gemini') {
            $apiKey = trim($cvm['gemini_api_key'] ?? '');
            $model  = trim($cvm['gemini_model'] ?? '') ?: 'gemini-2.0-flash';
        } else {
            $chat   = Setting::where('group', 'chat')->pluck('value', 'key')->toArray();
            $apiKey = trim($cvm['claude_api_key'] ?? '') ?: trim($chat['apiKey'] ?? '');
            $model  = trim($cvm['claude_model'] ?? '') ?: (trim($chat['model'] ?? '') ?: 'claude-haiku-4-5');
        }

        if ($apiKey === '') {
            throw new \RuntimeException('AI drafting is not configured yet. Add a Claude or Gemini API key under Settings → CV match (or Chat agent).');
        }

        $system = self::systemPrompt();
        $user   = self::userPrompt($in);

        $text = $provider === 'gemini'
            ? self::callGemini($apiKey, $model, $system, $user)
            : self::callClaude($apiKey, $model, $system, $user);

        return self::parse($text);
    }

    private static function systemPrompt(): string
    {
        return 'You are an expert recruiter writing job postings for a Cambodian job board (Krama). '
            . 'Write a clear, professional, inclusive posting from the given details. '
            . 'Return ONLY a JSON object with exactly these keys: "description", "requirements", "benefits". '
            . 'Each value is a short HTML fragment using ONLY <p>, <ul>, <li> and <strong> tags — no headings, no markdown, no code fences, no <script>. '
            . '"description": 2-3 short paragraphs on the role and responsibilities. '
            . '"requirements": a single <ul> of 4-7 concise bullet points. '
            . '"benefits": a single <ul> of 3-5 bullet points (use sensible norms for Cambodia if none are given). '
            . 'Be realistic and concise. Do NOT invent a specific salary figure. Output the JSON object only.';
    }

    private static function userPrompt(array $in): string
    {
        $lines = ['Job title: ' . $in['title']];
        if (! empty($in['company']))          $lines[] = 'Company: ' . $in['company'];
        if (! empty($in['job_type']))         $lines[] = 'Employment type: ' . $in['job_type'];
        if (! empty($in['experience_level'])) $lines[] = 'Seniority level: ' . $in['experience_level'];
        if (! empty($in['location']))         $lines[] = 'Location: ' . $in['location'];
        if (! empty($in['notes']))            $lines[] = "Key points to include:\n" . $in['notes'];

        return implode("\n", $lines);
    }

    private static function callClaude(string $apiKey, string $model, string $system, string $user): string
    {
        $resp = Http::withHeaders([
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])
            ->timeout(60)
            ->post('https://api.anthropic.com/v1/messages', [
                'model'      => $model ?: 'claude-haiku-4-5',
                'max_tokens' => 1500,
                'system'     => $system,
                'messages'   => [['role' => 'user', 'content' => $user]],
            ]);

        if (! $resp->successful()) {
            Log::warning('Job draft (claude ' . $model . ') API error: ' . $resp->status() . ' ' . $resp->body());
            throw new \RuntimeException('The AI service returned an error (' . $resp->status() . '). Check the API key and try again.');
        }

        $text = '';
        foreach ($resp->json('content') ?? [] as $block) {
            if (($block['type'] ?? null) === 'text') { $text = $block['text']; break; }
        }

        return $text;
    }

    private static function callGemini(string $apiKey, string $model, string $system, string $user): string
    {
        $model = $model ?: 'gemini-2.0-flash';
        $url   = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent';

        // Key in the x-goog-api-key header, never the query string — see ChatController::callGemini().
        $resp = Http::withHeaders([
                'x-goog-api-key' => $apiKey,
                'content-type'   => 'application/json',
            ])
            ->timeout(60)
            ->post($url, [
                'system_instruction' => ['parts' => [['text' => $system]]],
                'contents'           => [['role' => 'user', 'parts' => [['text' => $user]]]],
                'generationConfig'   => [
                    'temperature'      => 0.4,
                    'maxOutputTokens'  => 1500,
                    'responseMimeType' => 'application/json',
                    'thinkingConfig'   => ['thinkingBudget' => 0],
                ],
            ]);

        if (! $resp->successful()) {
            // JobController surfaces getMessage() to the employer, so keep the thrown text
            // user-facing and log the provider's actual reason for whoever has to debug it.
            Log::warning('Job draft (gemini ' . $model . ') API error: ' . $resp->status() . ' ' . $resp->body());
            throw new \RuntimeException('The AI service returned an error (' . $resp->status() . '). Check the API key and try again.');
        }

        $text = '';
        foreach ($resp->json('candidates.0.content.parts') ?? [] as $part) {
            if (isset($part['text'])) $text .= $part['text'];
        }

        return $text;
    }

    /** Pull the first JSON object out of the model response (tolerates prose / code fences). */
    private static function parse(string $text): array
    {
        $json = null;
        if (preg_match('/\{.*\}/s', $text, $m)) {
            $json = json_decode($m[0], true);
        }
        if (! is_array($json)) {
            throw new \RuntimeException('The AI response could not be read. Please try again.');
        }

        $clean = fn ($v) => is_string($v) ? trim($v) : '';

        return [
            'description'  => $clean($json['description'] ?? ''),
            'requirements' => $clean($json['requirements'] ?? ''),
            'benefits'     => $clean($json['benefits'] ?? ''),
        ];
    }
}
