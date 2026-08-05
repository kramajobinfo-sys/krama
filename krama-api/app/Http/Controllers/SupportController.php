<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\TelegramService;
use Illuminate\Http\Request;

/**
 * Support-chat configuration for the employer and candidate dashboards.
 *
 * The dashboards ask this endpoint HOW to offer support rather than hardcoding a Telegram
 * link, so the channel can change without shipping new frontend builds. Today it answers
 * `telegram_link` (open a chat with the bot). When the in-app bridge lands it answers
 * `in_app` and the same page renders a message thread instead — no rework in the UI beyond
 * the branch that is already there.
 */
class SupportController extends Controller
{
    // GET /api/support/config — for any signed-in user (candidate or employer).
    public function config(Request $request)
    {
        $s    = Setting::where('group', 'support')->pluck('value', 'key')->toArray();
        $user = $request->user();

        // Default on: support should be reachable unless an admin deliberately hides it.
        $enabled = ! array_key_exists('enabled', $s)
            || ! in_array($s['enabled'], ['0', 0, false, null], true);

        $mode = in_array($s['mode'] ?? '', ['telegram_link', 'in_app'], true)
            ? $s['mode'] : 'telegram_link';

        // Prefer an explicit support handle; otherwise reuse the notification bot.
        $handle = trim($s['telegram_handle'] ?? '') ?: trim((string) Setting::where('group', 'telegram')
            ->where('key', 'bot_username')->value('value'));
        $handle = ltrim($handle, '@');

        $url = null;
        if ($mode === 'telegram_link' && $handle !== '' && $user) {
            // The /start payload identifies the user to whoever answers, and is signed so a
            // future webhook can trust it and resolve the account without a lookup table.
            // Telegram allows [A-Za-z0-9_-], max 64 chars.
            $url = 'https://t.me/' . $handle . '?start=' . self::supportToken($user->id);
        }

        // Nothing to open and no bridge yet → tell the UI to stay hidden rather than
        // render a dead button.
        if ($mode === 'telegram_link' && ! $url) {
            $enabled = false;
        }

        return response()->json([
            'enabled'  => $enabled,
            'mode'     => $mode,
            'url'      => $url,
            'handle'   => $handle ?: null,
            'hours'    => trim($s['hours'] ?? '') ?: null,
            'note'     => trim($s['note'] ?? '') ?: null,
            // Surfaced so the UI can explain the channel; not required to render.
            'telegram_ready' => TelegramService::isEnabled(),
        ]);
    }

    /**
     * Opaque, signed per-user token: "s<id>-<hmac>".
     *
     * Carries the user id so support knows who is writing, plus a short HMAC so the id
     * cannot be swapped to impersonate someone else. Verify with verifySupportToken().
     */
    public static function supportToken(int $userId): string
    {
        return 's' . $userId . '-' . self::sign($userId);
    }

    /** @return int|null the user id, or null when the token is missing/tampered with. */
    public static function verifySupportToken(?string $token): ?int
    {
        if (! $token || ! preg_match('/^s(\d+)-([0-9a-f]{10})$/', $token, $m)) {
            return null;
        }
        $id = (int) $m[1];

        return hash_equals(self::sign($id), $m[2]) ? $id : null;
    }

    private static function sign(int $userId): string
    {
        return substr(hash_hmac('sha256', 'support:' . $userId, (string) config('app.key')), 0, 10);
    }
}
