<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

/**
 * Web-push (browser/PWA) notifications. VAPID keys live in the admin-only `push` settings
 * group (vapid_public, vapid_private, vapid_subject); the private key is never exposed on the
 * public settings endpoint. Best-effort: failures only log, and expired subscriptions are pruned.
 */
class WebPushService
{
    private static function cfg(): ?array
    {
        $s = Setting::where('group', 'push')->pluck('value', 'key')->toArray();
        if (empty($s['vapid_public']) || empty($s['vapid_private'])) return null;
        return [
            'publicKey'  => $s['vapid_public'],
            'privateKey' => $s['vapid_private'],
            'subject'    => $s['vapid_subject'] ?: 'mailto:support@kramajob.com',
        ];
    }

    public static function publicKey(): ?string
    {
        return Setting::where('group', 'push')->where('key', 'vapid_public')->value('value');
    }

    public static function enabled(): bool
    {
        return self::cfg() !== null;
    }

    /** Send a push payload (['title','body','url','icon']) to all of a user's devices. */
    public static function sendToUser(int $userId, array $payload): void
    {
        $cfg = self::cfg();
        if (! $cfg) return;

        $subs = PushSubscription::where('user_id', $userId)->get();
        if ($subs->isEmpty()) return;

        try {
            $webPush = new WebPush(['VAPID' => [
                'subject'    => $cfg['subject'],
                'publicKey'  => $cfg['publicKey'],
                'privateKey' => $cfg['privateKey'],
            ]]);
            $body = json_encode($payload);
            $byEndpoint = [];
            foreach ($subs as $s) {
                $byEndpoint[$s->endpoint] = $s->id;
                $webPush->queueNotification(
                    Subscription::create([
                        'endpoint' => $s->endpoint,
                        'keys'     => ['p256dh' => $s->p256dh, 'auth' => $s->auth],
                    ]),
                    $body
                );
            }
            foreach ($webPush->flush() as $report) {
                if (! $report->isSuccess() && $report->isSubscriptionExpired()) {
                    $ep = $report->getEndpoint();
                    if (isset($byEndpoint[$ep])) {
                        PushSubscription::where('id', $byEndpoint[$ep])->delete(); // prune dead device
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning('web push failed for user ' . $userId . ': ' . $e->getMessage());
        }
    }
}
