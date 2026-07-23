<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Job;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Setting;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    // GET /api/plans — public list of active plans
    public function plans()
    {
        return response()->json(Plan::where('is_active', true)->orderBy('price')->get());
    }

    // GET /api/employer/subscription — employer's current subscription + plan
    public function mySubscription(Request $request)
    {
        $company = $this->employerCompany($request->user());

        // Auto-expire subscriptions whose renewal date has passed and close their jobs
        $expiredIds = Subscription::where('company_id', $company->id)
            ->whereIn('status', ['active', 'trial'])
            ->whereNotNull('renews_at')
            ->where('renews_at', '<', now())
            ->pluck('id');

        if ($expiredIds->isNotEmpty()) {
            \App\Models\Job::whereIn('subscription_id', $expiredIds)
                ->where('status', 'published')
                ->update(['status' => 'closed']);
            Subscription::whereIn('id', $expiredIds)->update(['status' => 'expired']);
        }

        $subscription = Subscription::with('plan')
            ->where('company_id', $company->id)
            ->latest('started_at')
            ->first();

        // Subscription-level override takes priority over plan default
        $jobLimit = null;
        if ($subscription) {
            $jobLimit = $subscription->job_post_limit
                ?? ($subscription->plan ? $subscription->plan->job_post_limit : null);
        }

        // Count only published jobs under the current subscription — per-subscription quota
        $jobsUsed = $subscription
            ? \App\Models\Job::where('company_id', $company->id)
                ->where('subscription_id', $subscription->id)
                ->where('status', 'published')
                ->count()
            : 0;

        $jobsRemaining = $jobLimit === null ? null : max(0, $jobLimit - $jobsUsed);

        // Build per-subscription quota rows for the employer dashboard
        // Show active/trial/pending subs + any expired/canceled that still have live jobs
        $activeSubIds = Subscription::where('company_id', $company->id)
            ->whereIn('status', ['active', 'trial', 'pending'])
            ->pluck('id');

        $subsWithJobs = \App\Models\Job::where('company_id', $company->id)
            ->where('status', 'published')
            ->whereNotNull('subscription_id')
            ->pluck('subscription_id');

        $relevantIds = $activeSubIds->merge($subsWithJobs)->unique();

        $allSubscriptions = Subscription::with('plan')
            ->whereIn('id', $relevantIds)
            ->orderBy('started_at', 'desc')
            ->get()
            ->map(function ($s) use ($company) {
                $limit = $s->job_post_limit ?? ($s->plan ? $s->plan->job_post_limit : null);
                $used  = \App\Models\Job::where('company_id', $company->id)
                    ->where('subscription_id', $s->id)
                    ->where('status', 'published')
                    ->count();
                $arr = $s->toArray();
                $arr['jobs_used']      = $used;
                $arr['jobs_limit']     = $limit;
                $arr['jobs_remaining'] = $limit === null ? null : max(0, $limit - $used);
                return $arr;
            });

        // Track which plan IDs the company has ever subscribed to (for one-time free plan enforcement)
        $usedPlanIds = Subscription::where('company_id', $company->id)
            ->pluck('plan_id')
            ->unique()
            ->values();

        return response()->json([
            'company'           => $company->only('id', 'name'),
            'subscription'      => $subscription,
            'all_subscriptions' => $allSubscriptions,
            'jobs_used'         => $jobsUsed,
            'jobs_remaining'    => $jobsRemaining,
            'jobs_limit'        => $jobLimit,
            'used_plan_ids'     => $usedPlanIds,
        ]);
    }

    // POST /api/employer/subscribe — employer creates/upgrades a subscription
    // In a real app this would initiate a payment gateway session.
    // Here we create a pending payment record and return it for the front-end
    // to complete (e.g. show KHQR code, redirect to ABA, etc.).
    public function subscribe(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');

        $company = $this->employerCompany($user);

        $data = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'method'  => 'required|in:stripe,aba,acleda,wing,khqr,cod,card,other,trial',
        ]);

        $plan = Plan::where('is_active', true)->findOrFail($data['plan_id']);

        // A $0 plan is only a timed trial if trial_days is explicitly set (> 0).
        // A $0 plan with no trial_days is a genuinely free plan — activates immediately, never expires.
        $isFreePlan = $plan->price == 0;
        $isTrial = $isFreePlan && (int) $plan->trial_days > 0;
        $trialDays = $isTrial ? (int) $plan->trial_days : 0;

        // Free (non-trial) plans are one-time only — block re-subscription.
        if ($isFreePlan && !$isTrial) {
            $alreadyUsed = Subscription::where('company_id', $company->id)
                ->where('plan_id', $plan->id)
                ->exists();
            if ($alreadyUsed) {
                return response()->json([
                    'message' => 'The ' . $plan->name . ' free plan can only be activated once. Please upgrade to a paid plan.',
                ], 422);
            }
        }

        // Cancel any current active or trial subscription before creating a new one
        Subscription::where('company_id', $company->id)
            ->whereIn('status', ['active', 'trial'])
            ->update(['status' => 'canceled']);

        // Renewal = this company has subscribed to this plan before. There is no auto-renew;
        // employers re-subscribe to continue after expiry, so a prior record for the same plan
        // means this is a renewal rather than a first-time subscription. Checked before the new row.
        $isRenewal = Subscription::where('company_id', $company->id)
            ->where('plan_id', $plan->id)
            ->exists();

        DB::transaction(function () use ($company, $plan, $data, $isTrial, $isFreePlan, $trialDays, &$payment, &$subscription) {
            $subscription = Subscription::create([
                'company_id' => $company->id,
                'plan_id'    => $plan->id,
                'status'     => $isTrial ? 'trial' : ($isFreePlan ? 'active' : 'pending'),
                'started_at' => now(),
                'renews_at'  => $isTrial
                    ? now()->addDays($trialDays)
                    : ($isFreePlan ? null : ($plan->interval === 'once' ? null : now()->addMonth())),
            ]);

            $payment = Payment::create([
                'company_id'      => $company->id,
                'subscription_id' => $subscription->id,
                'invoice_no'      => $this->nextInvoiceNo(),
                'amount'          => $plan->price,
                'currency'        => $plan->currency,
                'method'          => ($isTrial || $isFreePlan) ? 'other' : $data['method'],
                'status'          => ($isTrial || $isFreePlan) ? 'paid' : 'pending',
                'paid_at'         => ($isTrial || $isFreePlan) ? now() : null,
                'created_at'      => now(),
            ]);
        });

        if ($payment && $payment->status === 'pending') {
            \App\Models\Notification::recordAdmins('payment_pending', 'New payment pending', 'Payment ' . $payment->currency . number_format((float) $payment->amount, 2) . ' from “' . $company->name . '” is awaiting confirmation.');
        }

        // Telegram: notify the admin chat about a new subscription or a renewal (any status).
        // No-op unless the admin has enabled + configured the bot; never affects this response.
        $statusLabel = [
            'trial'   => 'Trial',
            'active'  => 'Active',
            'pending' => 'Pending payment',
        ][$subscription->status] ?? ucfirst((string) $subscription->status);
        $priceLabel = $plan->price > 0
            ? ($plan->currency . number_format((float) $plan->price, 2) . '/' . $plan->interval)
            : 'Free';
        $eventLabel = $isRenewal ? '🔄 <b>Subscription renewed</b>' : '🆕 <b>New subscription</b>';
        \App\Services\TelegramService::notifyAdmin(
            $eventLabel . "\n"
            . 'Company: ' . e($company->name) . "\n"
            . 'Plan: ' . e($plan->name) . ' (' . e($priceLabel) . ")\n"
            . 'Status: ' . $statusLabel . "\n"
            . now()->format('Y-m-d H:i')
        );

        return response()->json([
            'subscription' => $subscription->load('plan'),
            'payment'      => $payment,
            'message'      => $isTrial
                ? "Trial activated. Expires in {$trialDays} days."
                : ($isFreePlan
                    ? 'Free plan activated.'
                    : 'Payment pending. Complete payment to activate.'),
        ], 201);
    }

    // POST /api/admin/payments/{id}/mark-paid — admin manually marks a payment paid
    // (used when payment is confirmed offline, e.g. KHQR bank transfer)
    public function markPaid(Request $request, $id)
    {
        $this->requirePermission('manage_payments');

        $payment = Payment::where('status', 'pending')->findOrFail($id);

        \App\Services\PaymentService::fulfill($payment);

        $this->auditLog('payment.marked_paid', ['payment_id' => $payment->id, 'amount' => $payment->amount]);

        return response()->json(['message' => 'Payment marked as paid.', 'payment' => $payment->fresh()]);
    }

    // POST /api/employer/payments/{id}/khqr — generate a Bakong KHQR for a pending payment.
    public function generateKhqr(Request $request, $id)
    {
        $this->requirePermission('post_jobs');

        $company = $this->employerCompany($request->user());
        $payment = Payment::where('company_id', $company->id)->where('id', $id)->firstOrFail();

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'This payment is already ' . $payment->status . '.'], 422);
        }

        // Merchant account + name come from the admin "Payment methods" config (payment_config JSON);
        // the KHQR account id is public info (it's embedded in the QR anyway). The Bakong API token
        // used for verification lives in the admin-only `payment` settings group.
        $pc      = json_decode(Setting::where('group', 'payment_config')->where('key', 'data')->value('value') ?? '{}', true) ?: [];
        $khqrCfg = $pc['khqr'] ?? [];
        $account = trim($khqrCfg['account'] ?? '');

        if (empty($khqrCfg['enabled']) || $account === '') {
            return response()->json(['message' => 'KHQR payment is not configured. Please contact support.'], 422);
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

        return response()->json([
            'qr'       => $khqr['qr'],
            'amount'   => $payment->amount,
            'currency' => $payment->currency,
        ]);
    }

    // GET /api/employer/payments/{id}/verify — check a payment against its gateway
    // (KHQR→NBC Bakong by md5, ABA→PayWay by tran_id). Fulfills on confirmation.
    public function verifyPayment(Request $request, $id)
    {
        $this->requirePermission('post_jobs');

        $company = $this->employerCompany($request->user());
        $payment = Payment::where('company_id', $company->id)->where('id', $id)->firstOrFail();

        if ($payment->status === 'paid') {
            return response()->json(['status' => 'paid']);
        }

        $pay = Setting::where('group', 'payment')->pluck('value', 'key')->toArray();

        if ($payment->method === 'aba') {
            $mid = trim($pay['aba_merchant_id'] ?? '');
            $key = trim($pay['aba_api_key'] ?? '');
            if ($mid === '' || $key === '') {
                return response()->json(['status' => 'pending', 'configured' => false]);
            }
            if (\App\Services\PaymentService::abaIsPaid($payment->invoice_no, $mid, $key)) {
                \App\Services\PaymentService::fulfill($payment);
                $this->auditLog('payment.aba_verified', ['payment_id' => $payment->id, 'amount' => $payment->amount]);
                return response()->json(['status' => 'paid']);
            }
            return response()->json(['status' => 'pending']);
        }

        if ($payment->method === 'card') {
            $key = trim($pay['stripe_secret_key'] ?? '');
            if ($key === '' || ! $payment->gateway_ref) {
                return response()->json(['status' => 'pending', 'configured' => $key !== '']);
            }
            if (\App\Services\PaymentService::stripeSessionPaid($payment->gateway_ref, $key)) {
                \App\Services\PaymentService::fulfill($payment);
                $this->auditLog('payment.stripe_verified', ['payment_id' => $payment->id, 'amount' => $payment->amount]);
                return response()->json(['status' => 'paid']);
            }
            return response()->json(['status' => 'pending']);
        }

        // Default: KHQR / Bakong
        if (! $payment->md5) {
            return response()->json(['message' => 'Generate a KHQR first.'], 422);
        }
        $token = trim($pay['bakong_token'] ?? '');
        if ($token === '') {
            // Not configured for live verification — leave pending (admin can still mark paid).
            return response()->json(['status' => 'pending', 'configured' => false]);
        }
        if (\App\Services\PaymentService::bakongIsPaid($payment->md5, $token)) {
            \App\Services\PaymentService::fulfill($payment);
            $this->auditLog('payment.bakong_verified', ['payment_id' => $payment->id, 'amount' => $payment->amount]);
            return response()->json(['status' => 'paid']);
        }

        return response()->json(['status' => 'pending']);
    }

    // POST /api/payments/aba/callback — ABA PayWay pushback. We don't trust the pushback
    // payload's hash directly; instead we re-verify authoritatively via check-transaction-2.
    public function abaCallback(Request $request)
    {
        $tranId = (string) ($request->input('tran_id') ?? $request->input('tran_id', ''));
        if ($tranId === '') {
            return response()->json(['message' => 'missing tran_id'], 400);
        }

        $payment = Payment::where('invoice_no', $tranId)->where('status', 'pending')->first();
        if (! $payment) {
            return response()->json(['message' => 'ok']); // unknown or already handled — ack so PayWay stops retrying
        }

        $pay = Setting::where('group', 'payment')->pluck('value', 'key')->toArray();
        $mid = trim($pay['aba_merchant_id'] ?? '');
        $key = trim($pay['aba_api_key'] ?? '');

        if ($mid !== '' && $key !== '' && \App\Services\PaymentService::abaIsPaid($tranId, $mid, $key)) {
            \App\Services\PaymentService::fulfill($payment);
            $this->auditLog('payment.aba_verified', ['payment_id' => $payment->id, 'amount' => $payment->amount, 'via' => 'pushback']);
        }

        return response()->json(['message' => 'ok']);
    }

    // POST /api/employer/payments/{id}/stripe-checkout — create a Stripe Checkout Session
    // for a pending card payment and return the hosted checkout URL.
    public function stripeCheckout(Request $request, $id)
    {
        $this->requirePermission('post_jobs');

        $company = $this->employerCompany($request->user());
        $payment = Payment::with('subscription.plan')->where('company_id', $company->id)->where('id', $id)->firstOrFail();

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'This payment is already ' . $payment->status . '.'], 422);
        }

        $key = trim(Setting::where('group', 'payment')->where('key', 'stripe_secret_key')->value('value') ?? '');
        if ($key === '') {
            return response()->json(['message' => 'Card payment is not configured. Please contact support.'], 422);
        }

        $frontend    = rtrim(config('app.frontend_url', 'http://localhost/krama'), '/');
        $successUrl  = $frontend . '/ui_kits/employer-dashboard/index.html?stripe=success';
        $cancelUrl   = $frontend . '/ui_kits/employer-dashboard/index.html?stripe=cancel';
        $productName = optional(optional($payment->subscription)->plan)->name
            ? ('Krama — ' . $payment->subscription->plan->name . ' plan')
            : ('Krama payment ' . $payment->invoice_no);

        $session = \App\Services\PaymentService::stripeCreateSession($payment, $key, $successUrl, $cancelUrl, $productName);
        if (! $session) {
            return response()->json(['message' => 'Could not start card payment. Please try again.'], 502);
        }

        $payment->update(['method' => 'card', 'gateway_ref' => $session['id']]);

        return response()->json(['url' => $session['url']]);
    }

    // POST /api/payments/stripe/webhook — Stripe webhook. We don't trust the event payload;
    // we take the session id and re-verify authoritatively via the Stripe API.
    public function stripeWebhook(Request $request)
    {
        $sessionId = (string) $request->input('data.object.id', '');
        $ref       = (string) $request->input('data.object.client_reference_id', '');

        if ($sessionId === '') {
            return response()->json(['message' => 'ok']); // not a session event we handle
        }

        $key = trim(Setting::where('group', 'payment')->where('key', 'stripe_secret_key')->value('value') ?? '');
        if ($key === '') {
            return response()->json(['message' => 'ok']);
        }

        // Match by our stored session id, falling back to the client_reference_id (invoice_no).
        $payment = Payment::where('gateway_ref', $sessionId)->where('status', 'pending')->first();
        if (! $payment && $ref !== '') {
            $payment = Payment::where('invoice_no', $ref)->where('status', 'pending')->first();
        }
        if (! $payment) {
            return response()->json(['message' => 'ok']);
        }

        if (\App\Services\PaymentService::stripeSessionPaid($sessionId, $key)) {
            \App\Services\PaymentService::fulfill($payment);
            $this->auditLog('payment.stripe_verified', ['payment_id' => $payment->id, 'amount' => $payment->amount, 'via' => 'webhook']);
        }

        return response()->json(['message' => 'ok']);
    }

    // POST /api/admin/payments/{id}/refund — admin marks a payment refunded
    public function refund(Request $request, $id)
    {
        $this->requirePermission('manage_payments');

        $payment = Payment::where('status', 'paid')->findOrFail($id);

        DB::transaction(function () use ($payment) {
            $payment->update(['status' => 'refunded']);

            if ($payment->purpose === 'featured_boost') {
                // Un-feature the job when its boost payment is refunded.
                if ($payment->job_id) {
                    Job::where('id', $payment->job_id)
                        ->update(['is_featured' => false, 'featured_until' => null]);
                }
            } elseif ($payment->subscription_id) {
                Subscription::where('id', $payment->subscription_id)
                    ->update(['status' => 'refunded']);
            }
        });

        $this->auditLog('payment.refunded', ['payment_id' => $payment->id, 'amount' => $payment->amount]);

        return response()->json(['message' => 'Payment refunded.', 'payment' => $payment->fresh()]);
    }

    // GET /api/employer/payments — employer's own payment history
    public function myPayments(Request $request)
    {
        $this->requirePermission('post_jobs');

        $company = $this->employerCompany($request->user());

        $perPage = min(100, max(1, (int) $request->input('per_page', 10)));
        $payments = Payment::with('subscription.plan')
            ->where('company_id', $company->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($payments);
    }

    // GET /api/admin/payments — admin: all payments with filters
    public function adminIndex(Request $request)
    {
        $this->requirePermission('manage_payments');

        $q = Payment::with([
            'company:id,name',
            'subscription.plan:id,name',
            'job:id,title',
        ]);

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        if ($request->filled('method')) {
            $q->where('method', $request->method);
        }

        if ($request->filled('company')) {
            $q->where('company_id', $request->company);
        }

        $q->orderBy('created_at', 'desc');

        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        return response()->json($q->paginate($perPage));
    }

    // GET /api/admin/plans — admin: all plans including inactive
    public function adminPlans(Request $request)
    {
        $this->requirePermission('manage_plans');

        return response()->json(Plan::orderBy('price')->get());
    }

    // PUT /api/admin/plans/{id} — admin updates a plan
    public function updatePlan(Request $request, $id)
    {
        $this->requirePermission('manage_plans');

        $plan = Plan::findOrFail($id);

        $data = $request->validate([
            'name'             => 'sometimes|string|max:80',
            'price'            => 'sometimes|numeric|min:0',
            'currency'         => 'sometimes|string|max:8',
            'interval'         => 'sometimes|in:month,year,once',
            'job_post_limit'   => 'nullable|integer|min:1',
            'trial_days'       => 'nullable|integer|min:1|max:365',
            'featured_credits' => 'sometimes|integer|min:0',
            'features_json'    => 'nullable|array',
            'is_active'        => 'sometimes|boolean',
            'custom_pricing'   => 'sometimes|boolean',
        ]);

        $plan->update($data);

        $this->auditLog('plan.updated', ['plan_id' => $plan->id, 'plan_name' => $plan->name, 'changes' => array_keys($data)]);

        return response()->json($plan->fresh());
    }

    // POST /api/admin/plans — admin creates a plan
    public function storePlan(Request $request)
    {
        $this->requirePermission('manage_plans');

        $data = $request->validate([
            'name'             => 'required|string|max:80',
            'price'            => 'required|numeric|min:0',
            'currency'         => 'sometimes|string|max:8',
            'interval'         => 'sometimes|in:month,year,once',
            'job_post_limit'   => 'nullable|integer|min:1',
            'trial_days'       => 'nullable|integer|min:1|max:365',
            'featured_credits' => 'sometimes|integer|min:0',
            'features_json'    => 'nullable|array',
            'is_active'        => 'sometimes|boolean',
            'custom_pricing'   => 'sometimes|boolean',
        ]);

        $plan = Plan::create($data);

        $this->auditLog('plan.created', ['plan_id' => $plan->id, 'plan_name' => $plan->name, 'price' => $plan->price]);

        return response()->json($plan, 201);
    }

    // DELETE /api/admin/plans/{id}
    public function destroyPlan(Request $request, $id)
    {
        $this->requirePermission('manage_plans');

        $plan = Plan::findOrFail($id);

        if (Subscription::where('plan_id', $id)->where('status', 'active')->exists()) {
            return response()->json(['message' => 'Cannot delete a plan with active subscriptions.'], 422);
        }

        $this->auditLog('plan.deleted', ['plan_id' => $plan->id, 'plan_name' => $plan->name]);

        $plan->delete();
        return response()->json(['message' => 'Plan deleted.']);
    }

    // GET /api/admin/subscriptions
    public function adminSubscriptions(Request $request)
    {
        $this->requirePermission('manage_payments');

        // Auto-expire any active/trial subscriptions whose renews_at has passed
        Subscription::whereIn('status', ['active', 'trial'])
            ->whereNotNull('renews_at')
            ->where('renews_at', '<', now())
            ->update(['status' => 'expired']);

        $q = Subscription::with([
            'plan:id,name,price,currency,interval',
            'company:id,name,logo_url,user_id',
            'company.owner:id,name,email',
            'latestPayment',
        ]);

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        if ($request->filled('company_id')) {
            $q->where('company_id', $request->company_id);
        }

        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        return response()->json($q->orderBy('started_at', 'desc')->paginate($perPage));
    }

    // POST /api/admin/subscriptions — admin assigns a plan to an employer
    public function adminCreateSubscription(Request $request)
    {
        $this->requirePermission('manage_payments');

        $data = $request->validate([
            'company_id'    => 'required|exists:companies,id',
            'plan_id'       => 'required|exists:plans,id',
            'status'        => 'sometimes|in:pending,active,trial,canceled,refunded,expired',
            'started_at'    => 'sometimes|date',
            'renews_at'     => 'nullable|date',
            'job_post_limit'=> 'nullable|integer|min:1',
        ]);

        // Cancel existing active subscription for this company
        Subscription::where('company_id', $data['company_id'])
            ->where('status', 'active')
            ->update(['status' => 'canceled']);

        $sub = Subscription::create([
            'company_id'     => $data['company_id'],
            'plan_id'        => $data['plan_id'],
            'status'         => $data['status'] ?? 'active',
            'started_at'     => $data['started_at'] ?? now(),
            'renews_at'      => $data['renews_at'] ?? null,
            'job_post_limit' => $data['job_post_limit'] ?? null,
        ]);

        $this->auditLog('subscription.created', [
            'subscription_id' => $sub->id, 'company_id' => $sub->company_id,
            'plan_id' => $sub->plan_id, 'status' => $sub->status,
        ]);

        return response()->json(
            $sub->load(['plan:id,name,price,currency,interval', 'company:id,name,logo_url']),
            201
        );
    }

    // PUT /api/admin/subscriptions/{id}
    public function adminUpdateSubscription(Request $request, $id)
    {
        $this->requirePermission('manage_payments');

        $sub = Subscription::findOrFail($id);

        $data = $request->validate([
            'plan_id'        => 'sometimes|exists:plans,id',
            'status'         => 'sometimes|in:pending,active,trial,canceled,refunded,expired',
            'started_at'     => 'sometimes|date',
            'renews_at'      => 'nullable|date',
            'job_post_limit' => 'nullable|integer|min:1',
        ]);

        // If renews_at is being extended to a future date and the subscription
        // is currently expired, restore it to active unless a status was explicitly provided
        if (
            isset($data['renews_at']) &&
            $data['renews_at'] !== null &&
            now()->lt($data['renews_at']) &&
            $sub->status === 'expired' &&
            !isset($data['status'])
        ) {
            $data['status'] = 'active';
        }

        // Admin renewal: reactivating a lapsed subscription (expired/canceled/refunded → active/
        // trial) resets its featured-credit usage so the customer gets a fresh allocation — the
        // same as an employer re-subscribe, which starts a brand-new row at 0. Captured against
        // $sub->status (the pre-update value) before the update below runs.
        if (
            in_array($sub->status, ['expired', 'canceled', 'refunded'], true) &&
            in_array($data['status'] ?? $sub->status, ['active', 'trial'], true)
        ) {
            $data['featured_credits_used'] = 0;
        }

        $sub->update($data);

        // If admin manually expires or cancels, close the subscription's published jobs
        if (isset($data['status']) && in_array($data['status'], ['expired', 'canceled', 'refunded'])) {
            \App\Models\Job::where('subscription_id', $sub->id)
                ->where('status', 'published')
                ->update(['status' => 'closed']);
        }

        $this->auditLog('subscription.updated', [
            'subscription_id' => $sub->id, 'company_id' => $sub->company_id, 'changes' => array_keys($data),
        ]);

        return response()->json(
            $sub->fresh()->load(['plan:id,name,price,currency,interval', 'company:id,name,logo_url'])
        );
    }

    // ----------------------------------------------------------------
    private function employerCompany($user): Company
    {
        // Company owner
        $company = Company::where('user_id', $user->id)->first();
        if ($company) return $company;

        // Recruiter linked via company_id
        if ($user->company_id) {
            $company = Company::find($user->company_id);
            if ($company) return $company;
        }

        abort(422, 'No company profile found.');
    }

    private function nextInvoiceNo(): string
    {
        $year = date('Y');
        $result = Payment::lockForUpdate()
            ->where('invoice_no', 'like', "INV-$year-%")
            ->selectRaw("MAX(CAST(SUBSTRING(invoice_no, -4) AS UNSIGNED)) as max_seq")
            ->first();
        $seq = (int) ($result->max_seq ?? 0) + 1;
        return sprintf('INV-%s-%04d', $year, $seq);
    }
}
