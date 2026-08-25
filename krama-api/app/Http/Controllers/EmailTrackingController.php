<?php

namespace App\Http\Controllers;

use App\Support\EmailTracking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Public open/click endpoints hit from marketing emails. No auth; the per-recipient token
// is HMAC-signed so events can't be forged for another user. Each (campaign,user,type) is
// recorded once (unique index) → the campaign's opens/clicks are UNIQUE counts.
class EmailTrackingController extends Controller
{
    // GET /e/o/{campaign}/{token}.gif — open pixel.
    public function open(Request $request, $campaign, string $token)
    {
        $token = preg_replace('/\.gif$/', '', $token);
        $userId = EmailTracking::verify('open', (int) $campaign, $token);
        if ($userId !== null) {
            $this->record((int) $campaign, $userId, 'open', null);
        }

        return response(EmailTracking::pixelBytes(), 200, [
            'Content-Type'  => 'image/gif',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma'        => 'no-cache',
        ]);
    }

    // GET /e/c/{campaign}/{token}?u=<target> — log click, then redirect to the target.
    public function click(Request $request, $campaign, string $token)
    {
        $target = (string) $request->query('u', '');
        // Only ever redirect to an http(s) URL we were handed.
        if (! preg_match('#^https?://#i', $target)) {
            return redirect(url('/'));
        }

        $userId = EmailTracking::verify('click', (int) $campaign, $token);
        if ($userId !== null) {
            $this->record((int) $campaign, $userId, 'click', mb_substr($target, 0, 1000));
        }

        return redirect()->away($target);
    }

    // Insert the event once per (campaign,user,type); on the first insert bump the aggregate.
    private function record(int $campaignId, int $userId, string $type, ?string $url): void
    {
        try {
            $inserted = DB::table('email_campaign_events')->insertOrIgnore([
                'campaign_id' => $campaignId,
                'user_id'     => $userId,
                'type'        => $type,
                'url'         => $url,
                'created_at'  => now(),
            ]);
            if ($inserted) {
                DB::table('email_campaigns')->where('id', $campaignId)
                    ->increment($type === 'open' ? 'opens' : 'clicks');
            }
        } catch (\Throwable $e) {
            // Never let tracking break the pixel/redirect.
        }
    }
}
