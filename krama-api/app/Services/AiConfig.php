<?php

namespace App\Services;

use App\Models\Setting;

/**
 * Single source of truth for the AI provider credentials.
 *
 * Every AI feature — CV-match scoring, the AI job-draft, and the public chat agent —
 * resolves its provider/key/model through here, so the key is typed in ONE place
 * (Settings → AI provider, the `ai` settings group) and takes effect everywhere.
 *
 * Before this existed each feature carried its own copy of the same credentials
 * (`cv_match.gemini_api_key`, `chat.gemini_api_key`), which silently drifted apart —
 * an operator rotating "the" key updated one group and left the other stale. Those
 * legacy keys are still READ as a fallback so existing installs keep working, but
 * nothing writes them any more.
 */
class AiConfig
{
    public const GROUP = 'ai';

    public const DEFAULT_GEMINI_MODEL = 'gemini-2.0-flash';
    public const DEFAULT_CLAUDE_MODEL = 'claude-haiku-4-5';

    /**
     * Resolve the active provider and its credentials.
     *
     * If the selected provider has no key but the other one does, we switch to the
     * configured one rather than failing — a half-configured install should still work.
     *
     * @return array{provider:string,apiKey:string,model:string,configured:bool}
     */
    public static function resolve(): array
    {
        $ai     = self::group(self::GROUP);
        $cvm    = self::group('cv_match');
        $chat   = self::group('chat');

        $provider = self::normalizeProvider(
            $ai['provider'] ?? $cvm['ai_provider'] ?? $chat['provider'] ?? ''
        );

        $gemini = [
            'key'   => self::first($ai['gemini_api_key'] ?? '', $cvm['gemini_api_key'] ?? '', $chat['gemini_api_key'] ?? ''),
            'model' => self::first($ai['gemini_model'] ?? '', $cvm['gemini_model'] ?? '', $chat['gemini_model'] ?? '') ?: self::DEFAULT_GEMINI_MODEL,
        ];
        $claude = [
            'key'   => self::first($ai['claude_api_key'] ?? '', $cvm['claude_api_key'] ?? '', $chat['apiKey'] ?? ''),
            'model' => self::first($ai['claude_model'] ?? '', $cvm['claude_model'] ?? '', $chat['model'] ?? '') ?: self::DEFAULT_CLAUDE_MODEL,
        ];

        // Fall back to whichever provider actually has credentials.
        if ($provider === 'gemini' && $gemini['key'] === '' && $claude['key'] !== '') {
            $provider = 'claude';
        } elseif ($provider === 'claude' && $claude['key'] === '' && $gemini['key'] !== '') {
            $provider = 'gemini';
        }

        $chosen = $provider === 'gemini' ? $gemini : $claude;

        return [
            'provider'   => $provider,
            'apiKey'     => $chosen['key'],
            'model'      => $chosen['model'],
            'configured' => $chosen['key'] !== '',
        ];
    }

    /** True when the active provider has a usable key. */
    public static function isConfigured(): bool
    {
        return self::resolve()['configured'];
    }

    /**
     * Canonical provider names are `gemini` and `claude`. The chat agent historically
     * stored Claude as `anthropic`, so accept that spelling on read.
     */
    public static function normalizeProvider(?string $raw): string
    {
        $v = strtolower(trim((string) $raw));

        if ($v === 'gemini') {
            return 'gemini';
        }
        if ($v === 'claude' || $v === 'anthropic') {
            return 'claude';
        }

        return 'claude';
    }

    private static function group(string $group): array
    {
        return Setting::where('group', $group)->pluck('value', 'key')->toArray();
    }

    /** First non-blank value, trimmed. */
    private static function first(...$values): string
    {
        foreach ($values as $v) {
            $v = trim((string) $v);
            if ($v !== '') {
                return $v;
            }
        }

        return '';
    }
}
