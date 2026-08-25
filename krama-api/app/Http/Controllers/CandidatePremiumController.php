<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Setting;
use App\Services\PaymentService;
use Illuminate\Http\Request;

// Self-serve Candidate Premium purchase via KHQR (the primary Cambodian method). Mirrors the
// employer KHQR flow but scoped to the candidate (payments.candidate_id, purpose
// 'candidate_premium'); PaymentService::fulfill applies candidate_premium_until.
class CandidatePremiumController extends Controller
{
    // Price/duration config with sensible defaults; admin-editable (candidate_premium settings).
    private function config(): array
    {
        $s = Setting::where('group', 'candidate_premium')->pluck('value', 'key')->toArray();
        return [
            'price'    => (float) ($s['price'] ?? 5),
            'currency' => strtoupper($s['currency'] ?? 'USD'),
            'months'   => max(1, (int) ($s['months'] ?? 3)),
        ];
    }

    private function khqrEnabled(): bool
    {
        $pc = json_decode(Setting::where('group', 'payment_config')->where('key', 'data')->value('value') ?? '{}', true) ?: [];
        return ! empty($pc['khqr']['enabled']) && trim($pc['khqr']['account'] ?? '') !== '';
    }

    // GET /api/candidate/premium — status + pricing for the upgrade UI.
    public function status(Request $request)
    {
        $this->requirePermission('save_jobs');
        $user = $request->user();
        $cfg = $this->config();

        return response()->json([
            'is_premium'   => $user->isCandidatePremium(),
            'until'        => optional($user->candidate_premium_until)->toIso8601String(),
            'price'        => $cfg['price'],
            'currency'     => $cfg['currency'],
            'months'       => $cfg['months'],
            'khqr_enabled' => $this->khqrEnabled(),
        ]);
    }

    // POST /api/candidate/premium/checkout — create a pending payment for the candidate.
    public function checkout(Request $request)
    {
        $this->requirePermission('save_jobs');
        $user = $request->user();

        if (! $this->khqrEnabled()) {
            return response()->json(['message' => 'Online payment is not available right now.'], 422);
        }

        $cfg = $this->config();

        // Reuse a still-pending premium payment for this candidate rather than piling up rows.
        $payment = Payment::where('candidate_id', $user->id)
            ->where('purpose', 'candidate_premium')->where('status', 'pending')
            ->latest('id')->first();

        if (! $payment) {
            $payment = Payment::create([
                'candidate_id' => $user->id,
                'purpose'      => 'candidate_premium',
                'invoice_no'   => 'CPREM-' . $user->id . '-' . now()->format('ymdHis'),
                'amount'       => $cfg['price'],
                'currency'     => $cfg['currency'],
                'credits'      => $cfg['months'],   // months of Premium (read by fulfill)
                'status'       => 'pending',
                'created_at'   => now(),
            ]);
        }

        return response()->json(['payment_id' => $payment->id, 'amount' => $payment->amount, 'currency' => $payment->currency, 'months' => (int) $payment->credits]);
    }

    // POST /api/candidate/premium/{id}/khqr — generate the KHQR for the pending payment.
    public function khqr(Request $request, $id)
    {
        $this->requirePermission('save_jobs');
        $user = $request->user();
        $payment = Payment::where('candidate_id', $user->id)->where('id', $id)->firstOrFail();

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'This payment is already ' . $payment->status . '.'], 422);
        }

        $pc = json_decode(Setting::where('group', 'payment_config')->where('key', 'data')->value('value') ?? '{}', true) ?: [];
        $khqrCfg = $pc['khqr'] ?? [];
        $account = trim($khqrCfg['account'] ?? '');
        if (empty($khqrCfg['enabled']) || $account === '') {
            return response()->json(['message' => 'KHQR payment is not configured.'], 422);
        }
        $city = trim(Setting::where('group', 'payment')->where('key', 'merchant_city')->value('value') ?? '') ?: 'Phnom Penh';

        $khqr = \App\Helpers\Khqr::generate([
            'account_id'    => $account,
            'merchant_name' => $khqrCfg['merchant'] ?? 'Krama',
            'city'          => $city,
            'amount'        => (float) $payment->amount,
            'currency'      => $payment->currency ?? 'USD',
            'bill_number'   => $payment->invoice_no,
        ]);
        $payment->update(['khqr' => $khqr['qr'], 'md5' => $khqr['md5'], 'method' => 'khqr']);

        return response()->json(['qr' => $khqr['qr'], 'amount' => $payment->amount, 'currency' => $payment->currency]);
    }

    // GET /api/candidate/premium/{id}/verify — poll Bakong; on paid, fulfill (grants Premium).
    public function verify(Request $request, $id)
    {
        $this->requirePermission('save_jobs');
        $user = $request->user();
        $payment = Payment::where('candidate_id', $user->id)->where('id', $id)->firstOrFail();

        if ($payment->status === 'paid') {
            return response()->json(['status' => 'paid']);
        }
        if (! $payment->md5) {
            return response()->json(['message' => 'Generate a KHQR first.'], 422);
        }
        $token = trim(Setting::where('group', 'payment')->where('key', 'bakong_token')->value('value') ?? '');
        if ($token === '') {
            return response()->json(['status' => 'pending', 'configured' => false]);
        }
        if (PaymentService::bakongIsPaid($payment->md5, $token)) {
            PaymentService::fulfill($payment);
            $this->auditLog('candidate.premium_purchased', ['payment_id' => $payment->id, 'candidate_id' => $user->id, 'amount' => $payment->amount]);
            return response()->json(['status' => 'paid']);
        }
        return response()->json(['status' => 'pending']);
    }
}
