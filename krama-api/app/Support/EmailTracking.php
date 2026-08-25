<?php

namespace App\Support;

/**
 * Open/click tracking for marketing emails. Per-recipient links are signed (HMAC of
 * app.key) so opens/clicks can't be forged for an arbitrary user. Applied per recipient
 * at send time (SendCampaignJob), NOT stored on the campaign body.
 */
class EmailTracking
{
    // Signature over "{action}:{campaignId}:{userId}" → non-forgeable token {userId}-{sig}.
    public static function token(string $action, int $campaignId, int $userId): string
    {
        $sig = substr(hash_hmac('sha256', $action . ':' . $campaignId . ':' . $userId, (string) config('app.key')), 0, 16);
        return $userId . '-' . $sig;
    }

    public static function verify(string $action, int $campaignId, string $token): ?int
    {
        [$id, $sig] = array_pad(explode('-', $token, 2), 2, '');
        if (! ctype_digit($id)) return null;
        $expected = self::token($action, $campaignId, (int) $id);
        return hash_equals($expected, $token) ? (int) $id : null;
    }

    public static function pixelUrl(int $campaignId, int $userId): string
    {
        return url('/e/o/' . $campaignId . '/' . self::token('open', $campaignId, $userId) . '.gif');
    }

    public static function clickUrl(int $campaignId, int $userId, string $target): string
    {
        return url('/e/c/' . $campaignId . '/' . self::token('click', $campaignId, $userId))
            . '?u=' . urlencode($target);
    }

    /**
     * Rewrite the campaign body's http(s) links to go through the click redirect, and append
     * a 1×1 open-tracking pixel. Runs on the inner body BEFORE the marketing shell wraps it,
     * so the shell's own unsubscribe link is left untouched.
     */
    public static function apply(int $campaignId, int $userId, ?string $bodyHtml): string
    {
        $html = (string) $bodyHtml;

        // Rewrite href="http(s)://…" — skip mailto:, anchors, and already-tracked links.
        $html = preg_replace_callback('/href\s*=\s*(["\'])(https?:\/\/[^"\']+)\1/i', function ($m) use ($campaignId, $userId) {
            $target = $m[2];
            // Don't double-wrap our own tracking/unsubscribe URLs.
            if (strpos($target, '/e/c/') !== false || strpos($target, '/unsubscribe/') !== false) {
                return $m[0];
            }
            return 'href=' . $m[1] . self::clickUrl($campaignId, $userId, $target) . $m[1];
        }, $html);

        $pixel = '<img src="' . self::pixelUrl($campaignId, $userId) . '" width="1" height="1" alt="" style="display:none;width:1px;height:1px;border:0;" />';
        return $html . $pixel;
    }

    // Transparent 1×1 GIF bytes.
    public static function pixelBytes(): string
    {
        return base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    }
}
