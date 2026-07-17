<?php

namespace App\Services;

use App\Models\Job;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\Subscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    // NBC Bakong Open API base (production). The check endpoint keys transactions by KHQR md5.
    private const BAKONG_BASE = 'https://api-bakong.nbc.gov.kh';

    // ABA PayWay checkout API base (production).
    private const ABA_BASE = 'https://checkout.payway.com.kh';

    // Stripe API base.
    private const STRIPE_BASE = 'https://api.stripe.com';

    /**
     * Mark a pending payment as paid and apply its effect (activate the subscription
     * or feature the job). Idempotent — returns false if the payment was not pending,
     * so it's safe to call from the manual admin action, the verify endpoint, and the
     * scheduled sweep without double-applying.
     */
    public static function fulfill(Payment $payment): bool
    {
        if ($payment->status !== 'pending') {
            return false;
        }

        DB::transaction(function () use ($payment) {
            $payment->update(['status' => 'paid', 'paid_at' => now()]);

            if ($payment->purpose === 'featured_boost') {
                if ($payment->job_id) {
                    $days = (int) (Setting::where('group', 'featured')->where('key', 'boost_days')->value('value') ?? 30);
                    Job::where('id', $payment->job_id)
                        ->update(['is_featured' => true, 'featured_until' => now()->addDays($days)]);
                }
            } elseif ($payment->purpose === 'cv_credits') {
                // Top up the company's CV-match credit balance.
                if ($payment->company_id && $payment->credits) {
                    \App\Models\Company::where('id', $payment->company_id)->increment('cv_match_credits', (int) $payment->credits);
                }
            } elseif ($payment->subscription_id) {
                Subscription::where('id', $payment->subscription_id)
                    ->update(['status' => 'active']);
            }
        });

        return true;
    }

    /**
     * Ask NBC Bakong whether the transaction for a given KHQR md5 has completed.
     * responseCode 0 means the transaction was found and is successful.
     * Returns false on any error / not-yet-paid so callers simply leave the payment pending.
     */
    public static function bakongIsPaid(string $md5, string $token): bool
    {
        try {
            $resp = Http::withToken($token)->timeout(15)
                ->post(self::BAKONG_BASE . '/v1/check_transaction_by_md5', ['md5' => $md5]);

            if (! $resp->successful()) {
                return false;
            }

            $body = $resp->json();

            return isset($body['responseCode']) && (int) $body['responseCode'] === 0;
        } catch (\Exception $e) {
            Log::warning('Bakong verify failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Ask ABA PayWay whether a transaction (our invoice_no == PayWay tran_id) is approved,
     * via the check-transaction-2 endpoint. The request is signed with an HMAC-SHA512 hash
     * (base64) of req_time + merchant_id + tran_id keyed by the merchant API key.
     * Returns false on any error / not-yet-approved so callers leave the payment pending.
     */
    public static function abaIsPaid(string $tranId, string $merchantId, string $apiKey): bool
    {
        try {
            $reqTime = gmdate('YmdHis');
            $hash    = base64_encode(hash_hmac('sha512', $reqTime . $merchantId . $tranId, $apiKey, true));

            $resp = Http::asForm()->timeout(15)->post(self::ABA_BASE . '/api/payment-gateway/v1/payments/check-transaction-2', [
                'req_time'    => $reqTime,
                'merchant_id' => $merchantId,
                'tran_id'     => $tranId,
                'hash'        => $hash,
            ]);

            if (! $resp->successful()) {
                return false;
            }

            $body = $resp->json();

            // PayWay: status.code "00" = transaction found & successful. Some responses also
            // carry data.payment_status (APPROVED). Treat either positive signal as paid.
            $statusCode    = (string) data_get($body, 'status.code', '');
            $paymentStatus = strtoupper((string) data_get($body, 'data.payment_status', ''));

            return $statusCode === '00'
                || in_array($paymentStatus, ['APPROVED', 'SUCCESS', 'COMPLETED'], true);
        } catch (\Exception $e) {
            Log::warning('ABA verify failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Create a Stripe Checkout Session for a payment and return [url, id].
     * Amount is converted to the smallest currency unit (cents). Returns null on failure.
     *
     * @return array{url:string,id:string}|null
     */
    public static function stripeCreateSession(Payment $payment, string $secretKey, string $successUrl, string $cancelUrl, string $productName): ?array
    {
        try {
            $currency = strtolower($payment->currency ?: 'usd');
            $unit     = (int) round(((float) $payment->amount) * 100); // cents

            $resp = Http::withToken($secretKey)->asForm()->timeout(20)
                ->post(self::STRIPE_BASE . '/v1/checkout/sessions', [
                    'mode'                                  => 'payment',
                    'success_url'                           => $successUrl,
                    'cancel_url'                            => $cancelUrl,
                    'client_reference_id'                   => (string) $payment->invoice_no,
                    'metadata[payment_id]'                  => (string) $payment->id,
                    'line_items[0][quantity]'               => 1,
                    'line_items[0][price_data][currency]'   => $currency,
                    'line_items[0][price_data][unit_amount]' => $unit,
                    'line_items[0][price_data][product_data][name]' => $productName,
                ]);

            if (! $resp->successful()) {
                Log::warning('Stripe create session failed: ' . $resp->status() . ' ' . $resp->body());
                return null;
            }

            $body = $resp->json();
            if (empty($body['url']) || empty($body['id'])) {
                return null;
            }

            return ['url' => $body['url'], 'id' => $body['id']];
        } catch (\Exception $e) {
            Log::warning('Stripe create session error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Ask Stripe whether a Checkout Session has been paid.
     * Returns false on any error / not-yet-paid so callers leave the payment pending.
     */
    public static function stripeSessionPaid(string $sessionId, string $secretKey): bool
    {
        try {
            $resp = Http::withToken($secretKey)->timeout(15)
                ->get(self::STRIPE_BASE . '/v1/checkout/sessions/' . $sessionId);

            if (! $resp->successful()) {
                return false;
            }

            return (string) $resp->json('payment_status') === 'paid';
        } catch (\Exception $e) {
            Log::warning('Stripe verify failed: ' . $e->getMessage());
            return false;
        }
    }
}
