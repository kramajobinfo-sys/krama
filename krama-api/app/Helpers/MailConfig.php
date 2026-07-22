<?php

namespace App\Helpers;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;

class MailConfig
{
    /**
     * Read SMTP settings from the DB and reconfigure Laravel's mailer.
     * Call this before any Mail::html() or Mail::send() call.
     */
    public static function applyFromDb(): void
    {
        $s = self::settings();

        if (empty($s['host'])) {
            return; // No DB config — fall back to .env defaults
        }

        config([
            'mail.default'                 => 'smtp', // route mail through SMTP when DB config is present (env may default to 'log')
            'mail.mailers.smtp.host'       => $s['host'],
            'mail.mailers.smtp.port'       => (int) ($s['port'] ?? 587),
            'mail.mailers.smtp.encryption' => $s['encryption'] ?? 'tls',
            'mail.mailers.smtp.username'   => $s['username'] ?? '',
            'mail.mailers.smtp.password'   => $s['password'] ?? '',
            // Fail fast on an unreachable/slow mail server (Swift socket connect + stream
            // timeout, seconds) so a bad SMTP host can't hang a request for ~30s+.
            'mail.mailers.smtp.timeout'    => (int) ($s['timeout'] ?? 8),
            'mail.from.address'            => $s['from_address'] ?? config('mail.from.address'),
            'mail.from.name'               => $s['from_name'] ?? config('mail.from.name'),
        ]);

        // Purge the resolved SMTP transport so it picks up the new config.
        app('mail.manager')->purge('smtp');
    }

    public static function isConfigured(): bool
    {
        $s = self::settings();
        return ! empty($s['enabled']) && ! empty($s['host']);
    }

    public static function forgetCache(): void
    {
        Cache::forget('settings.smtp');
    }

    private static function settings(): array
    {
        return Cache::remember('settings.smtp', 300, function () {
            return Setting::where('group', 'smtp')->pluck('value', 'key')->toArray();
        });
    }
}
