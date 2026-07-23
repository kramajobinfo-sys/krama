<?php

namespace App\Services;

use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Sends notifications to a single admin Telegram chat via the Bot API.
 * Config lives in the admin-only `telegram` settings group (bot_token, chat_id, enabled)
 * and is never exposed to the public API.
 */
class TelegramService
{
    // Read the telegram settings group as [key => value].
    private static function config(): array
    {
        return Setting::where('group', 'telegram')->pluck('value', 'key')->toArray();
    }

    public static function botToken(): string
    {
        return (string) (self::config()['bot_token'] ?? '');
    }

    public static function isEnabled(): bool
    {
        $c = self::config();

        return ! empty($c['enabled']) && (int) $c['enabled'] === 1;
    }

    // Low-level send. Returns ['ok' => bool, 'error' => ?string]. Never throws.
    public static function sendMessage(string $token, string $chatId, string $text, ?array $replyMarkup = null): array
    {
        try {
            $payload = [
                'chat_id'                  => $chatId,
                'text'                     => $text,
                'parse_mode'               => 'HTML',
                'disable_web_page_preview' => true,
            ];
            if ($replyMarkup) $payload['reply_markup'] = json_encode($replyMarkup);
            $resp = Http::asForm()->timeout(10)->post(
                'https://api.telegram.org/bot' . $token . '/sendMessage',
                $payload
            );

            if ($resp->successful() && $resp->json('ok') === true) {
                return ['ok' => true, 'error' => null];
            }

            return ['ok' => false, 'error' => $resp->json('description') ?: ('HTTP ' . $resp->status())];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    // Send a photo with an optional HTML caption. $photo may be a local file path
    // (uploaded as multipart — works even when the URL isn't publicly reachable, e.g.
    // on localhost) or a public URL/file_id.
    public static function sendPhoto(string $token, string $chatId, string $photo, string $caption = '', ?array $replyMarkup = null): array
    {
        try {
            $url = 'https://api.telegram.org/bot' . $token . '/sendPhoto';
            $fields = ['chat_id' => $chatId, 'caption' => $caption, 'parse_mode' => 'HTML'];
            if ($replyMarkup) $fields['reply_markup'] = json_encode($replyMarkup);

            if (is_file($photo)) {
                $resp = Http::timeout(20)
                    ->attach('photo', file_get_contents($photo), basename($photo))
                    ->post($url, $fields);
            } else {
                $resp = Http::asForm()->timeout(20)->post($url, $fields + ['photo' => $photo]);
            }

            if ($resp->successful() && $resp->json('ok') === true) {
                return ['ok' => true, 'error' => null];
            }
            return ['ok' => false, 'error' => $resp->json('description') ?: ('HTTP ' . $resp->status())];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    // Notify the configured admin chat. No-op (returns false) if disabled/unconfigured; never throws.
    public static function notifyAdmin(string $text): bool
    {
        try {
            $c = self::config();

            if (empty($c['enabled']) || (int) $c['enabled'] !== 1) {
                return false;
            }

            $token  = (string) ($c['bot_token'] ?? '');
            $chatId = (string) ($c['chat_id'] ?? '');
            if ($token === '' || $chatId === '') {
                return false;
            }

            $res = self::sendMessage($token, $chatId, $text);
            if (! $res['ok']) {
                Log::warning('Telegram notifyAdmin failed: ' . $res['error']);
            }

            return $res['ok'];
        } catch (\Throwable $e) {
            Log::warning('Telegram notifyAdmin exception: ' . $e->getMessage());

            return false;
        }
    }

    // Send to a specific chat via the shared (admin-configured) bot token.
    // No-op (returns false) unless the integration is enabled + a token is set + a chat id is given.
    public static function notifyChat($chatId, string $text): bool
    {
        try {
            $chatId = (string) $chatId;
            if (! self::isEnabled() || self::botToken() === '' || $chatId === '') {
                return false;
            }

            $res = self::sendMessage(self::botToken(), $chatId, $text);
            if (! $res['ok']) {
                Log::warning('Telegram notifyChat failed: ' . $res['error']);
            }

            return $res['ok'];
        } catch (\Throwable $e) {
            Log::warning('Telegram notifyChat exception: ' . $e->getMessage());

            return false;
        }
    }

    // Validate the token and read the bot's @username. Returns ['ok', 'username', 'error'].
    public static function getMe(?string $token = null): array
    {
        $token = $token ?: self::botToken();
        if ($token === '') {
            return ['ok' => false, 'username' => null, 'error' => 'No bot token set.'];
        }
        try {
            $resp = Http::timeout(10)->get('https://api.telegram.org/bot' . $token . '/getMe');
            if ($resp->successful() && $resp->json('ok') === true) {
                return ['ok' => true, 'username' => $resp->json('result.username'), 'error' => null];
            }

            return ['ok' => false, 'username' => null, 'error' => $resp->json('description') ?: ('HTTP ' . $resp->status())];
        } catch (\Throwable $e) {
            return ['ok' => false, 'username' => null, 'error' => $e->getMessage()];
        }
    }

    // Register the webhook so Telegram delivers updates (the /start deep-link presses) to us.
    public static function setWebhook(string $url, string $secret, ?string $token = null): array
    {
        $token = $token ?: self::botToken();
        if ($token === '') {
            return ['ok' => false, 'error' => 'No bot token set.'];
        }
        try {
            $resp = Http::asForm()->timeout(15)->post(
                'https://api.telegram.org/bot' . $token . '/setWebhook',
                [
                    'url'             => $url,
                    'secret_token'    => $secret,
                    'allowed_updates' => json_encode(['message']),
                ]
            );
            if ($resp->successful() && $resp->json('ok') === true) {
                return ['ok' => true, 'error' => null];
            }

            return ['ok' => false, 'error' => $resp->json('description') ?: ('HTTP ' . $resp->status())];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }

    public static function getWebhookInfo(?string $token = null): array
    {
        $token = $token ?: self::botToken();
        if ($token === '') {
            return ['ok' => false, 'error' => 'No bot token set.'];
        }
        try {
            $resp = Http::timeout(10)->get('https://api.telegram.org/bot' . $token . '/getWebhookInfo');
            if ($resp->successful() && $resp->json('ok') === true) {
                return ['ok' => true, 'info' => $resp->json('result'), 'error' => null];
            }

            return ['ok' => false, 'error' => $resp->json('description') ?: ('HTTP ' . $resp->status())];
        } catch (\Throwable $e) {
            return ['ok' => false, 'error' => $e->getMessage()];
        }
    }
}
