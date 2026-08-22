<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Services\WebPushService;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    // GET /api/push/vapid-public-key — public: the browser needs this to subscribe.
    public function vapidPublicKey()
    {
        return response()->json(['publicKey' => WebPushService::publicKey()]);
    }

    // POST /api/candidate/push-subscription — save (or refresh) this device's subscription.
    public function store(Request $request)
    {
        $data = $request->validate([
            'endpoint'     => 'required|string|max:1000',
            'keys.p256dh'  => 'required|string|max:255',
            'keys.auth'    => 'required|string|max:255',
        ]);

        PushSubscription::updateOrCreate(
            ['user_id' => $request->user()->id, 'endpoint_hash' => hash('sha256', $data['endpoint'])],
            [
                'endpoint' => $data['endpoint'],
                'p256dh'   => $data['keys']['p256dh'],
                'auth'     => $data['keys']['auth'],
                'ua'       => substr((string) $request->userAgent(), 0, 255),
            ]
        );

        return response()->json(['message' => 'Push notifications enabled on this device.']);
    }

    // DELETE /api/candidate/push-subscription — remove this device's subscription.
    public function destroy(Request $request)
    {
        $endpoint = (string) $request->input('endpoint', '');
        if ($endpoint !== '') {
            PushSubscription::where('user_id', $request->user()->id)
                ->where('endpoint_hash', hash('sha256', $endpoint))
                ->delete();
        }
        return response()->json(['message' => 'Push notifications disabled on this device.']);
    }
}
