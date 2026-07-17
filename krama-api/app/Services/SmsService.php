<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;

/**
 * Provider-agnostic SMS sender. Config lives in the admin-only `sms` settings group.
 * Drivers: `twilio` (Account SID + token + sender) or `http` (generic HTTP gateway:
 * configurable URL, method, param names, static params and an optional auth header).
 */
class SmsService
{
    private static function config(): array
    {
        return Setting::where('group', 'sms')->pluck('value', 'key')->toArray();
    }

    public static function isEnabled(): bool
    {
        $c = self::config();

        return ! empty($c['enabled']) && (int) $c['enabled'] === 1;
    }

    // Returns ['ok' => bool, 'error' => ?string]. Never throws.
    public static function send(string $phone, string $text): array
    {
        try {
            $c = self::config();
            if (empty($c['enabled']) || (int) $c['enabled'] !== 1) {
                return ['ok' => false, 'error' => 'SMS is not enabled.'];
            }

            $driver = (string) ($c['driver'] ?? 'twilio');
            if ($driver === 'twilio') {
                return self::sendTwilio($c, $phone, $text);
            }
            if ($driver === 'http') {
                return self::sendHttp($c, $phone, $text);
            }

            return ['ok' => false, 'error' => 'Unknown SMS driver: ' . $driver];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    private static function sendTwilio(array $c, string $phone, string $text): array
    {
        $sid  = (string) ($c['twilio_sid'] ?? '');
        $tok  = (string) ($c['twilio_token'] ?? '');
        $from = (string) ($c['twilio_from'] ?? '');
        if ($sid === '' || $tok === '' || $from === '') {
            return ['ok' => false, 'error' => 'Twilio SID, token and sender number are required.'];
        }

        $resp = Http::asForm()->withBasicAuth($sid, $tok)->timeout(15)->post(
            'https://api.twilio.com/2010-04-01/Accounts/' . $sid . '/Messages.json',
            ['To' => $phone, 'From' => $from, 'Body' => $text]
        );

        if ($resp->successful()) {
            return ['ok' => true, 'error' => null];
        }

        return ['ok' => false, 'error' => $resp->json('message') ?: ('HTTP ' . $resp->status())];
    }

    // Generic HTTP gateway. The admin sets the URL, method, the param names for the
    // recipient + message, any static params (api key, sender…) and an optional header.
    private static function sendHttp(array $c, string $phone, string $text): array
    {
        $url = (string) ($c['http_url'] ?? '');
        if ($url === '') {
            return ['ok' => false, 'error' => 'SMS gateway URL is required.'];
        }

        $method    = strtoupper((string) ($c['http_method'] ?? 'GET')) === 'POST' ? 'POST' : 'GET';
        $toParam   = (string) ($c['http_to_param'] ?? 'to') ?: 'to';
        $textParam = (string) ($c['http_text_param'] ?? 'text') ?: 'text';

        parse_str((string) ($c['http_extra'] ?? ''), $params); // static params: key=…&sender=…
        $params[$toParam]   = $phone;
        $params[$textParam] = $text;

        $req = Http::timeout(15);
        $hdr = (string) ($c['http_header'] ?? '');
        if ($hdr !== '' && strpos($hdr, ':') !== false) {
            [$hn, $hv] = array_map('trim', explode(':', $hdr, 2));
            $req = $req->withHeaders([$hn => $hv]);
        }

        $resp = $method === 'POST' ? $req->asForm()->post($url, $params) : $req->get($url, $params);

        if ($resp->successful()) {
            return ['ok' => true, 'error' => null];
        }

        return ['ok' => false, 'error' => 'HTTP ' . $resp->status() . ' ' . substr($resp->body(), 0, 140)];
    }
}
