<?php

namespace App\Services;

use App\Models\Resume;
use Illuminate\Support\Facades\Http;

/**
 * Deterministic CV-to-CV matching. Scores how well a candidate résumé matches a
 * reference résumé on a 0–100 scale, skills-dominant, with an explainable breakdown.
 * No external API — pure computation over the structured résumé data.
 */
class CvMatchService
{
    public static function score(Resume $ref, Resume $cand): array
    {
        $refSkills  = self::skillSet($ref);   // [normalizedKey => label]
        $candSkills = self::skillSet($cand);

        // 1) Skills overlap (55): fraction of the reference's skills the candidate has.
        $matchedKeys = array_values(array_intersect(array_keys($refSkills), array_keys($candSkills)));
        $missingKeys = array_values(array_diff(array_keys($refSkills), array_keys($candSkills)));
        $skillRatio  = count($refSkills) ? count($matchedKeys) / count($refSkills) : 0.0;

        // 2) Field similarity (15): headline + summary keyword overlap.
        $fieldRatio = self::tokenOverlap(
            self::tokens(($ref->headline ?? '') . ' ' . ($ref->summary ?? '')),
            self::tokens(($cand->headline ?? '') . ' ' . ($cand->summary ?? ''))
        );

        // 3) Experience depth (20): candidate entries relative to the reference.
        $refExp   = self::count($ref, 'experience');
        $candExp  = self::count($cand, 'experience');
        $expRatio = $refExp > 0 ? min(1.0, $candExp / $refExp) : ($candExp > 0 ? 1.0 : 0.0);

        // 4) Education (5) + 5) Languages (5).
        $eduRatio  = self::listOverlap($ref, $cand, 'education');
        $langRatio = self::listOverlap($ref, $cand, 'languages');

        $score = (int) round(55 * $skillRatio + 15 * $fieldRatio + 20 * $expRatio + 5 * $eduRatio + 5 * $langRatio);
        $score = max(0, min(100, $score));

        return [
            'score'     => $score,
            'breakdown' => [
                'skill_overlap_pct' => (int) round($skillRatio * 100),
                'matched_skills'    => array_map(fn ($k) => $refSkills[$k], $matchedKeys),
                'missing_skills'    => array_map(fn ($k) => $refSkills[$k], $missingKeys),
                'field_pct'         => (int) round($fieldRatio * 100),
                'experience'        => ['reference' => $refExp, 'candidate' => $candExp],
            ],
        ];
    }

    /**
     * AI scoring for a batch of candidates — routes to the configured provider.
     * $provider: 'claude' (default) | 'gemini'. Returns
     * [candidateResumeId => ['score'=>int, 'breakdown'=>[...]]].
     * Throws on API failure so the caller can avoid charging credits.
     */
    public static function scoreAiProvider(string $provider, Resume $ref, $candidates, string $apiKey, string $model): array
    {
        return $provider === 'gemini'
            ? self::scoreGeminiBatch($ref, $candidates, $apiKey, $model)
            : self::scoreAiBatch($ref, $candidates, $apiKey, $model);
    }

    /**
     * AI (Claude) scoring for a batch of candidates in a single request.
     */
    public static function scoreAiBatch(Resume $ref, $candidates, string $apiKey, string $model): array
    {
        $resp = Http::withHeaders([
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])
            ->timeout(60)
            ->post('https://api.anthropic.com/v1/messages', [
                'model'      => $model ?: 'claude-haiku-4-5',
                'max_tokens' => 2048,
                'system'     => self::aiSystemPrompt(),
                'messages'   => [['role' => 'user', 'content' => self::aiUserPrompt($ref, $candidates)]],
            ]);

        if (! $resp->successful()) {
            throw new \RuntimeException('AI matching request failed (' . $resp->status() . ').');
        }

        $text = '';
        foreach ($resp->json('content') ?? [] as $block) {
            if (($block['type'] ?? null) === 'text') {
                $text = $block['text'];
                break;
            }
        }

        return self::normalizeAiRows(self::extractJsonArray($text));
    }

    /**
     * AI (Google Gemini) scoring for a batch of candidates in a single request.
     * Uses the free-tier-friendly generateContent endpoint with JSON output.
     */
    public static function scoreGeminiBatch(Resume $ref, $candidates, string $apiKey, string $model): array
    {
        $model = $model ?: 'gemini-flash-latest';
        $url   = 'https://generativelanguage.googleapis.com/v1beta/models/' . rawurlencode($model) . ':generateContent';

        $resp = Http::withHeaders(['content-type' => 'application/json'])
            ->timeout(60)
            ->post($url . '?key=' . urlencode($apiKey), [
                'system_instruction' => ['parts' => [['text' => self::aiSystemPrompt()]]],
                'contents'           => [['role' => 'user', 'parts' => [['text' => self::aiUserPrompt($ref, $candidates)]]]],
                'generationConfig'   => [
                    'temperature'      => 0,
                    'maxOutputTokens'  => 2048,
                    'responseMimeType' => 'application/json',
                    // gemini-flash-latest resolves to a reasoning model; disabling "thinking"
                    // keeps scoring fast, deterministic, and free of reasoning text leaking
                    // into the JSON output.
                    'thinkingConfig'   => ['thinkingBudget' => 0],
                ],
            ]);

        if (! $resp->successful()) {
            throw new \RuntimeException('AI matching request failed (' . $resp->status() . ').');
        }

        $text = '';
        foreach ($resp->json('candidates.0.content.parts') ?? [] as $part) {
            if (isset($part['text'])) {
                $text .= $part['text'];
            }
        }

        return self::normalizeAiRows(self::extractJsonArray($text));
    }

    // Shared system prompt for any AI provider.
    private static function aiSystemPrompt(): string
    {
        return "You are an expert technical recruiter. Score how well each CANDIDATE résumé matches the REFERENCE résumé "
            . "for the same kind of role, on a 0-100 scale (100 = ideal match). Weigh skills, seniority/experience, field, and education. "
            . "Respond with ONLY a JSON array — one object per candidate — and nothing else: "
            . "[{\"id\":<candidate id>,\"score\":<int 0-100>,\"matched_skills\":[..],\"missing_skills\":[..],\"reason\":\"<one short sentence>\"}].";
    }

    // Shared user prompt (reference + candidate blocks) for any AI provider.
    private static function aiUserPrompt(Resume $ref, $candidates): string
    {
        $blocks = [];
        foreach ($candidates as $c) {
            $blocks[] = "CANDIDATE id=" . $c->id . ":\n" . self::resumeText($c);
        }
        return "REFERENCE:\n" . self::resumeText($ref) . "\n\n" . implode("\n\n", $blocks);
    }

    // Normalize decoded JSON rows into [candidateResumeId => ['score', 'breakdown']].
    private static function normalizeAiRows(array $rows): array
    {
        $out = [];
        foreach ($rows as $row) {
            $id = (int) ($row['id'] ?? 0);
            if (! $id) {
                continue;
            }
            $out[$id] = [
                'score'     => max(0, min(100, (int) ($row['score'] ?? 0))),
                'breakdown' => [
                    'matched_skills' => array_values(array_filter((array) ($row['matched_skills'] ?? []), 'is_string')),
                    'missing_skills' => array_values(array_filter((array) ($row['missing_skills'] ?? []), 'is_string')),
                    'reason'         => is_string($row['reason'] ?? null) ? $row['reason'] : '',
                ],
            ];
        }
        return $out;
    }

    // Compact plain-text rendering of a résumé for the AI prompt.
    private static function resumeText(Resume $r): string
    {
        $skills = array_values(self::skillSet($r));
        $exp    = self::rawList($r, 'experience');
        $expTitles = [];
        foreach ($exp as $e) {
            $expTitles[] = is_array($e) ? trim(($e['title'] ?? '') . ' ' . ($e['company'] ?? '')) : (string) $e;
        }
        $parts = [];
        if ($r->headline) $parts[] = "Headline: " . $r->headline;
        if ($r->summary)  $parts[] = "Summary: " . mb_substr($r->summary, 0, 600);
        if ($skills)      $parts[] = "Skills: " . implode(', ', $skills);
        if ($expTitles)   $parts[] = "Experience (" . count($exp) . "): " . implode('; ', array_filter($expTitles));
        $edu = self::flatten(self::rawList($r, 'education'));
        if (trim($edu) !== '') $parts[] = "Education: " . mb_substr($edu, 0, 300);
        $lang = self::flatten(self::rawList($r, 'languages'));
        if (trim($lang) !== '') $parts[] = "Languages: " . $lang;
        return implode("\n", $parts) ?: "(empty résumé)";
    }

    // Pull the first JSON array out of a model response (tolerates markdown fences / prose).
    private static function extractJsonArray(string $text): array
    {
        $start = strpos($text, '[');
        $end   = strrpos($text, ']');
        if ($start === false || $end === false || $end < $start) {
            return [];
        }
        $json = substr($text, $start, $end - $start + 1);
        $decoded = json_decode($json, true);
        return is_array($decoded) ? $decoded : [];
    }

    // ---- helpers -------------------------------------------------------------

    // Normalize a résumé's skills into [lowercaseKey => originalLabel].
    private static function skillSet(Resume $r): array
    {
        $out = [];
        foreach (self::rawList($r, 'skills') as $s) {
            $label = is_array($s) ? ($s['name'] ?? (is_scalar(reset($s)) ? reset($s) : '')) : (string) $s;
            $label = trim((string) $label);
            if ($label === '') {
                continue;
            }
            $out[mb_strtolower($label)] = $label;
        }
        return $out;
    }

    private static function rawList(Resume $r, string $key): array
    {
        $data = is_array($r->data) ? $r->data : [];
        $v = $data[$key] ?? [];
        return is_array($v) ? $v : [];
    }

    private static function count(Resume $r, string $key): int
    {
        return count(self::rawList($r, $key));
    }

    private static function listOverlap(Resume $a, Resume $b, string $key): float
    {
        return self::tokenOverlap(
            self::tokens(self::flatten(self::rawList($a, $key))),
            self::tokens(self::flatten(self::rawList($b, $key)))
        );
    }

    private static function flatten(array $list): string
    {
        $parts = [];
        foreach ($list as $item) {
            if (is_array($item)) {
                $parts[] = implode(' ', array_map(fn ($x) => is_scalar($x) ? (string) $x : '', $item));
            } elseif (is_scalar($item)) {
                $parts[] = (string) $item;
            }
        }
        return implode(' ', $parts);
    }

    private static function tokens(string $text): array
    {
        $words = preg_split('/[^a-z0-9+#.]+/i', mb_strtolower($text)) ?: [];
        $stop  = ['the', 'and', 'for', 'with', 'a', 'an', 'of', 'to', 'in', 'on', 'at', 'is', 'are', 'as', 'by', 'or', 'our', 'we', 'you'];
        $out   = [];
        foreach ($words as $w) {
            $w = trim($w);
            if (strlen($w) < 2 || in_array($w, $stop, true)) {
                continue;
            }
            $out[$w] = true;
        }
        return array_keys($out);
    }

    // Fraction of $a's tokens present in $b.
    private static function tokenOverlap(array $a, array $b): float
    {
        if (! $a || ! $b) {
            return 0.0;
        }
        return count(array_intersect($a, $b)) / count($a);
    }
}
