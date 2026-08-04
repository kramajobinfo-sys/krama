<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Consolidate the duplicated AI credentials into one shared `ai` settings group.
 *
 * The same provider key used to be stored twice — once in `cv_match` and once in
 * `chat` — so rotating "the" key updated one copy and left the other stale. This
 * seeds the new single location from whatever is already configured, preferring
 * `cv_match` (which carried the provider choice) and falling back to `chat`.
 *
 * The legacy rows are deliberately LEFT IN PLACE: AiConfig still reads them as a
 * fallback, so a deploy that lands before this migration runs keeps working.
 */
return new class extends Migration
{
    public function up(): void
    {
        $cvm  = self::group('cv_match');
        $chat = self::group('chat');

        // Chat stored Claude as `anthropic`; the shared group standardises on `claude`.
        $provider = self::first($cvm['ai_provider'] ?? '', $chat['provider'] ?? '');
        $provider = in_array(strtolower($provider), ['gemini'], true) ? 'gemini' : 'claude';

        $seed = [
            'provider'       => $provider,
            'gemini_api_key' => self::first($cvm['gemini_api_key'] ?? '', $chat['gemini_api_key'] ?? ''),
            'gemini_model'   => self::first($cvm['gemini_model'] ?? '', $chat['gemini_model'] ?? ''),
            'claude_api_key' => self::first($cvm['claude_api_key'] ?? '', $chat['apiKey'] ?? ''),
            'claude_model'   => self::first($cvm['claude_model'] ?? '', $chat['model'] ?? ''),
        ];

        foreach ($seed as $key => $value) {
            if ($value === '') {
                continue;   // don't create empty rows for providers that were never set up
            }

            // insertOrIgnore so re-running never clobbers a key an admin has since changed
            // in the new location.
            DB::table('settings')->insertOrIgnore([
                'group' => 'ai',
                'key'   => $key,
                'value' => $value,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('settings')->where('group', 'ai')->delete();
    }

    private static function group(string $group): array
    {
        return DB::table('settings')->where('group', $group)->pluck('value', 'key')->toArray();
    }

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
};
