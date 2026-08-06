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

    // ABA PayWay checkout API bases. The active one is chosen by the `aba_sandbox`
    // setting so we can test against sandbox and flip to production without a code change.
    private const ABA_BASE_PROD    = 'https://checkout.payway.com.kh';
    private const ABA_BASE_SANDBOX = 'https://checkout-sandbox.payway.com.kh';

    // Stripe API base.
    private const STRIPE_BASE = 'https://api.stripe.com';

    // Resolve the ABA base URL from settings (sandbox vs production).
    public static function abaBase(): string
    {
        $sandbox = trim((string) (Setting::where('group', 'payment')->where('key', 'aba_sandbox')->value('value') ?? ''));
        return in_array($sandbox, ['1', 'true', 'yes', 'on'], true) ? self::ABA_BASE_SANDBOX : self::ABA_BASE_PROD;
    }

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

        // Atomically claim the pending→paid transition and apply the effect in ONE
        // transaction. The conditional UPDATE (… WHERE status='pending') is a row-level
        // compare-and-swap: of the concurrent callers (gateway webhook, the employer's
        // verify poll, and the scheduled `payments:verify-pending` sweep) exactly ONE
        // flips the row and applies the effect; the losers see 0 affected rows and bail.
        // This prevents double credit top-ups / duplicate invoices. If a side effect
        // throws, the whole transaction rolls back and the payment stays pending (retryable).
        $applied = DB::transaction(function () use ($payment) {
            $claimed = Payment::where('id', $payment->id)
                ->where('status', 'pending')
                ->update(['status' => 'paid', 'paid_at' => now()]);

            if ($claimed !== 1) {
                return false;
            }
            $payment->status = 'paid'; // reflect the committed flip on the in-memory model

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

            // Consume any coupon attached to this payment now that it is confirmed paid — marks
            // the redemption used, bumps the coupon count, and grants its bonus credits/free days.
            // Deferred here (from subscribe) so an abandoned pending checkout never burns a code.
            if ($payment->coupon_code) {
                CouponService::consumeForPayment($payment);
            }

            return true;
        });

        if (! $applied) {
            return false;
        }

        // Generate + deliver the invoice, and announce a confirmed subscription, AFTER the
        // response is sent — so payment confirmation is never blocked/failed by mail/telegram,
        // and admins are alerted only once the employer has actually paid (payment-first).
        $paid = $payment->fresh()->load('subscription.plan', 'company');
        app()->terminating(function () use ($paid) {
            try {
                InvoiceService::deliver($paid);
            } catch (\Throwable $e) {
                Log::warning('Invoice delivery failed for payment ' . $paid->id . ': ' . $e->getMessage());
            }

            // Paid subscription → announce it now (moved here from subscribe() so the alert
            // never fires before payment). Trial/free plans announce at creation instead.
            if ($paid->subscription_id && $paid->subscription) {
                try {
                    $companyName = $paid->company->name ?? 'A company';
                    $subPlan     = optional($paid->subscription->plan);
                    $planName    = $subPlan->name ?: 'plan';
                    $discNote    = ((int) ($subPlan->discount_percent ?? 0) > 0) ? (' — ' . (int) $subPlan->discount_percent . '% off') : '';
                    $priceLabel  = ($paid->currency ?: '') . number_format((float) $paid->amount, 2) . $discNote;

                    \App\Models\Notification::recordAdmins(
                        'subscription_active',
                        'Subscription activated',
                        $companyName . ' — ' . $planName . ' (' . $priceLabel . ') is now active.'
                    );
                    \App\Services\TelegramService::notifyAdmin(
                        "✅ <b>Subscription payment confirmed</b>\n"
                        . 'Company: ' . e($companyName) . "\n"
                        . 'Plan: ' . e($planName) . ' (' . e($priceLabel) . ")\n"
                        . 'Invoice: ' . e((string) $paid->invoice_no) . "\n"
                        . now()->format('Y-m-d H:i')
                    );
                } catch (\Throwable $e) {
                    Log::warning('Subscription announce failed for payment ' . $paid->id . ': ' . $e->getMessage());
                }
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

    // ABA PayWay payment_status values we treat as a DEFINITIVE terminal failure (the buyer
    // will not complete this transaction) — as opposed to PENDING or a not-yet-seen tran.
    private const ABA_FAILED_STATUSES = ['DECLINED', 'CANCELLED', 'CANCELED', 'FAILED', 'EXPIRED', 'REFUSED', 'VOID'];

    /**
     * Resolve an ABA PayWay transaction (our invoice_no == PayWay tran_id) to a tri-state
     * 'paid' | 'failed' | 'pending' in a single check-transaction-2 round-trip. The request
     * is signed with an HMAC-SHA512 hash (base64) of req_time + merchant_id + tran_id keyed
     * by the merchant API key. Conservative: any network error or unrecognised/PENDING status
     * resolves to 'pending' so a genuinely in-flight payment is never wrongly failed.
     */
    public static function abaStatus(string $tranId, string $merchantId, string $apiKey): string
    {
        try {
            $reqTime = gmdate('YmdHis');
            $hash    = base64_encode(hash_hmac('sha512', $reqTime . $merchantId . $tranId, $apiKey, true));

            $resp = Http::asForm()->timeout(15)->post(self::abaBase() . '/api/payment-gateway/v1/payments/check-transaction-2', [
                'req_time'    => $reqTime,
                'merchant_id' => $merchantId,
                'tran_id'     => $tranId,
                'hash'        => $hash,
            ]);

            if (! $resp->successful()) {
                return 'pending';
            }

            $body = $resp->json();

            // CRITICAL: PayWay's status.code "00" only means the API REQUEST succeeded — it does
            // NOT mean the money was paid (a PENDING/unpaid transaction still returns status.code
            // "00" with data.payment_status "PENDING"). The ACTUAL result is data.payment_status;
            // only "APPROVED" (payment_status_code 0) means the buyer actually paid.
            $paymentStatus = strtoupper((string) data_get($body, 'data.payment_status', ''));
            $statusCodeNum = data_get($body, 'data.payment_status_code', null);

            if ($paymentStatus === 'APPROVED' || $statusCodeNum === 0 || $statusCodeNum === '0') {
                return 'paid';
            }
            if (in_array($paymentStatus, self::ABA_FAILED_STATUSES, true)) {
                return 'failed';
            }

            return 'pending';
        } catch (\Exception $e) {
            Log::warning('ABA verify failed: ' . $e->getMessage());
            return 'pending';
        }
    }

    /**
     * Ask ABA PayWay whether a transaction is approved. Thin wrapper over abaStatus() kept
     * for the callback + scheduled-sweep callers that only care about the paid transition.
     * Returns false on any error / not-yet-approved so callers leave the payment pending.
     */
    public static function abaIsPaid(string $tranId, string $merchantId, string $apiKey): bool
    {
        return self::abaStatus($tranId, $merchantId, $apiKey) === 'paid';
    }

    /**
     * Build the signed ABA PayWay "purchase" (hosted checkout) form fields. The browser
     * POSTs these to {abaBase}/api/payment-gateway/v1/payments/purchase, which renders
     * ABA's checkout page. Hash = base64(HMAC-SHA512(concat-in-order, public_key)) over the
     * PayWay v1 field sequence (empties included). Returns ['action' => url, 'fields' => [...]].
     */
    public static function abaPurchaseFields(Payment $payment, string $merchantId, string $apiKey, array $buyer, string $returnUrl, string $continueSuccessUrl, string $paymentOption = ''): array
    {
        $reqTime   = gmdate('YmdHis');
        $tranId    = (string) $payment->invoice_no;
        $amount    = number_format((float) $payment->amount, 2, '.', '');
        $currency  = strtoupper($payment->currency ?: 'USD');
        $firstname = (string) ($buyer['firstname'] ?? '');
        $lastname  = (string) ($buyer['lastname'] ?? '');
        $email     = (string) ($buyer['email'] ?? '');
        $phone     = (string) ($buyer['phone'] ?? '');

        $items = base64_encode(json_encode([[
            'name'     => 'Krama ' . ($payment->purpose ?: 'payment'),
            'quantity' => 1,
            'price'    => (float) $amount,
        ]]));

        $type           = 'purchase';
        // empty = let the buyer pick any method on ABA's page; 'cards' = go straight to the card form
        $returnUrlB64   = base64_encode($returnUrl);   // server-to-server pushback (POST)
        $cancelUrl      = '';
        $returnDeeplink = '';
        $customFields   = '';
        $returnParams   = '';
        $shipping       = '0.00';   // digital service, no shipping — ABA rejects an empty value

        // PayWay v1 hash — values concatenated in this fixed order (empties included).
        $hashStr = $reqTime . $merchantId . $tranId . $amount . $items . $shipping
                 . $firstname . $lastname . $email . $phone . $type . $paymentOption
                 . $returnUrlB64 . $cancelUrl . $continueSuccessUrl . $returnDeeplink
                 . $currency . $customFields . $returnParams;
        $hash = base64_encode(hash_hmac('sha512', $hashStr, $apiKey, true));

        return [
            'action' => self::abaBase() . '/api/payment-gateway/v1/payments/purchase',
            'fields' => [
                'req_time'             => $reqTime,
                'merchant_id'          => $merchantId,
                'tran_id'              => $tranId,
                'amount'               => $amount,
                'items'                => $items,
                'shipping'             => $shipping,
                'firstname'            => $firstname,
                'lastname'             => $lastname,
                'email'                => $email,
                'phone'                => $phone,
                'type'                 => $type,
                'payment_option'       => $paymentOption,
                'return_url'           => $returnUrlB64,
                'cancel_url'           => $cancelUrl,
                'continue_success_url' => $continueSuccessUrl,
                'return_deeplink'      => $returnDeeplink,
                'currency'             => $currency,
                'custom_fields'        => $customFields,
                'return_params'        => $returnParams,
                'hash'                 => $hash,
            ],
        ];
    }

    /**
     * Call ABA PayWay's "purchase" API server-side and return the decoded response
     * (contains qrString/qrImage for ABA PAY — a scannable KHQR the buyer pays with
     * their banking app). Returns null on a network error; ABA validation errors come
     * back as the decoded body (with status.code/message) for the caller to surface.
     */
    public static function abaPurchase(Payment $payment, string $merchantId, string $apiKey, array $buyer, string $returnUrl, string $continueSuccessUrl): ?array
    {
        try {
            $req  = self::abaPurchaseFields($payment, $merchantId, $apiKey, $buyer, $returnUrl, $continueSuccessUrl);
            $resp = Http::asForm()->timeout(20)->post($req['action'], $req['fields']);
            $body = $resp->json();
            if (! is_array($body)) {
                Log::warning('ABA purchase non-JSON response: ' . $resp->status());
                return null;
            }
            if (empty($body['qrString']) && empty($body['qrImage'])) {
                Log::warning('ABA purchase rejected: ' . substr($resp->body(), 0, 300));
            }
            return $body;
        } catch (\Exception $e) {
            Log::warning('ABA purchase failed: ' . $e->getMessage());
            return null;
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
     * Resolve a Stripe Checkout Session to a tri-state 'paid' | 'failed' | 'pending' in a
     * single round-trip. A session with payment_status "paid" is paid; a session whose
     * status is "expired" (the buyer abandoned it / it timed out — a Checkout Session is
     * only ever open → complete or open → expired) is a definitive failure; anything else
     * (still "open") stays pending. Conservative: any error resolves to 'pending'.
     *
     * SAFE ONLY when $sessionId is the payment's own gateway_ref (the session we created
     * for THIS payment). Do NOT call this with an attacker-supplied session id against an
     * unrelated payment — use stripeSessionMatchesPayment() there.
     */
    public static function stripeSessionStatus(string $sessionId, string $secretKey): string
    {
        try {
            $resp = Http::withToken($secretKey)->timeout(15)
                ->get(self::STRIPE_BASE . '/v1/checkout/sessions/' . $sessionId);

            if (! $resp->successful()) {
                return 'pending';
            }

            $body = $resp->json();

            if ((string) ($body['payment_status'] ?? '') === 'paid') {
                return 'paid';
            }
            if ((string) ($body['status'] ?? '') === 'expired') {
                return 'failed';
            }

            return 'pending';
        } catch (\Exception $e) {
            Log::warning('Stripe verify failed: ' . $e->getMessage());
            return 'pending';
        }
    }

    /**
     * Ask Stripe whether a Checkout Session has been paid. Thin wrapper over
     * stripeSessionStatus() kept for the scheduled-sweep caller.
     */
    public static function stripeSessionPaid(string $sessionId, string $secretKey): bool
    {
        return self::stripeSessionStatus($sessionId, $secretKey) === 'paid';
    }

    /**
     * H-S2: Authoritatively verify a Checkout Session and bind it to a specific
     * payment before it may be fulfilled. Guards against a paid session id being
     * replayed against a different (more expensive) pending payment: we re-fetch
     * the session from Stripe and require paid status AND that its identity fields
     * exactly match the values we set when the session was created for this payment
     * (client_reference_id = invoice_no, currency, and amount_total in minor units).
     * Returns false on any mismatch or error so the payment stays pending.
     */
    public static function stripeSessionMatchesPayment(Payment $payment, string $sessionId, string $secretKey): bool
    {
        try {
            $resp = Http::withToken($secretKey)->timeout(15)
                ->get(self::STRIPE_BASE . '/v1/checkout/sessions/' . $sessionId);

            if (! $resp->successful()) {
                return false;
            }

            $session = $resp->json();

            $expectedCurrency = strtolower($payment->currency ?: 'usd');
            $expectedAmount   = (int) round(((float) $payment->amount) * 100); // mirror stripeCreateSession()

            return (string) ($session['payment_status'] ?? '') === 'paid'
                && (string) ($session['client_reference_id'] ?? '') === (string) $payment->invoice_no
                && strtolower((string) ($session['currency'] ?? '')) === $expectedCurrency
                && (int) ($session['amount_total'] ?? -1) === $expectedAmount;
        } catch (\Exception $e) {
            Log::warning('Stripe session/payment binding check failed: ' . $e->getMessage());
            return false;
        }
    }
}
