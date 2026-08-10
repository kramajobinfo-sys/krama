<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\Subscription;

class CouponService
{
    /** Normalise a user-typed code: trim + uppercase (codes are matched case-insensitively). */
    public static function normalize(?string $code): string
    {
        return strtoupper(trim((string) $code));
    }

    /** Find a coupon by code (case-insensitive), or null. */
    public static function find(?string $code): ?Coupon
    {
        $c = self::normalize($code);
        if ($c === '') {
            return null;
        }
        return Coupon::whereRaw('UPPER(code) = ?', [$c])->first();
    }

    /**
     * Evaluate a coupon for a given company + plan + pre-VAT charge.
     * Returns one of:
     *   ['ok' => true,  'coupon' => Coupon, 'discount' => float, 'new_charge' => float, 'credits' => int, 'free_days' => int]
     *   ['ok' => false, 'message' => string]
     *
     * A coupon is "available" based on CONSUMED (paid) redemptions only, so an abandoned
     * pending checkout never burns a single-use code.
     */
    public static function evaluate(?string $code, Company $company, Plan $plan, float $charge): array
    {
        $coupon = self::find($code);
        if (! $coupon) {
            return ['ok' => false, 'message' => 'Coupon code not found.'];
        }
        if (! $coupon->is_active) {
            return ['ok' => false, 'message' => 'This coupon is no longer active.'];
        }
        // Personal coupons (referral welcome/reward) belong to one company and are surfaced
        // pre-applied for it; promo coupons carry no owner and are typeable by anyone.
        if ($coupon->owner_company_id) {
            if ((int) $coupon->owner_company_id !== (int) $company->id) {
                return ['ok' => false, 'message' => 'This code cannot be applied here.'];
            }
        } elseif ($coupon->kind !== 'promo') {
            return ['ok' => false, 'message' => 'This code cannot be applied here.'];
        }

        $now = now();
        if ($coupon->starts_at && $now->lessThan($coupon->starts_at)) {
            return ['ok' => false, 'message' => 'This coupon is not active yet.'];
        }
        if ($coupon->expires_at && $now->greaterThan($coupon->expires_at)) {
            return ['ok' => false, 'message' => 'This coupon has expired.'];
        }
        if ($coupon->plan_id && (int) $coupon->plan_id !== (int) $plan->id) {
            return ['ok' => false, 'message' => 'This coupon does not apply to the selected plan.'];
        }
        if ($coupon->min_amount && $charge < (float) $coupon->min_amount) {
            return ['ok' => false, 'message' => 'This coupon requires a minimum purchase of ' . rtrim(rtrim(number_format((float) $coupon->min_amount, 2), '0'), '.') . ' ' . ($coupon->amount_currency ?: 'USD') . '.'];
        }

        $consumedCount = CouponRedemption::where('coupon_id', $coupon->id)->whereNotNull('consumed_at')->count();

        if ($coupon->scope === 'single_use') {
            $cap = $coupon->max_redemptions ?: 1;
            if ($consumedCount >= $cap) {
                return ['ok' => false, 'message' => 'This coupon has already been used.'];
            }
        } else { // per_employer campaign code — once per company
            $usedByCompany = CouponRedemption::where('coupon_id', $coupon->id)
                ->where('company_id', $company->id)
                ->whereNotNull('consumed_at')
                ->exists();
            if ($usedByCompany) {
                return ['ok' => false, 'message' => 'You have already used this coupon.'];
            }
            if ($coupon->max_redemptions && $consumedCount >= $coupon->max_redemptions) {
                return ['ok' => false, 'message' => 'This coupon has reached its redemption limit.'];
            }
        }

        // Compute the money discount (percent + fixed both allowed), never below zero.
        $discount = 0.0;
        if ($coupon->percent_off) {
            $discount += $charge * min(100, (int) $coupon->percent_off) / 100;
        }
        if ($coupon->amount_off) {
            $discount += (float) $coupon->amount_off;
        }
        $discount   = round(min($discount, $charge), 2);
        $newCharge  = round($charge - $discount, 2);

        return [
            'ok'         => true,
            'coupon'     => $coupon,
            'kind'       => $coupon->kind,
            'discount'   => $discount,
            'new_charge' => $newCharge,
            'credits'    => (int) $coupon->bonus_featured_credits,
            'free_days'  => (int) $coupon->bonus_free_days,
            'job_posts'  => (int) $coupon->bonus_job_posts,
        ];
    }

    /**
     * Best available personal (referral) coupon for this company + plan, as an evaluate() result,
     * or null. Used to surface a referral reward pre-applied at checkout.
     */
    public static function bestPersonal(Company $company, Plan $plan): ?array
    {
        $coupons = Coupon::where('owner_company_id', $company->id)->where('is_active', true)->get();
        $best = null;
        foreach ($coupons as $c) {
            $r = self::evaluate($c->code, $company, $plan, $plan->effective_price);
            if (! empty($r['ok'])) {
                $score = $r['discount'] + $r['credits'] + $r['free_days'] + ($r['job_posts'] ?? 0);
                if (! $best || $score > $best['_score']) {
                    $r['_score'] = $score;
                    $best = $r;
                }
            }
        }
        return $best;
    }

    /**
     * Record a redemption for a payment. When $consumeNow is true (immediate activation —
     * trial/free/coupon-zeroed), the redemption is consumed and the bonuses granted right away;
     * otherwise it stays pending until the gateway payment is confirmed (see consumeForPayment).
     * Must be called inside the subscribe() transaction.
     */
    public static function recordRedemption(Coupon $coupon, Company $company, ?int $userId, Payment $payment, Subscription $subscription, float $discount, bool $consumeNow): void
    {
        CouponRedemption::create([
            'coupon_id'       => $coupon->id,
            'company_id'      => $company->id,
            'user_id'         => $userId,
            'payment_id'      => $payment->id,
            'subscription_id' => $subscription->id,
            'discount_amount' => $discount,
            'consumed_at'     => $consumeNow ? now() : null,
            'created_at'      => now(),
        ]);

        if ($consumeNow) {
            Coupon::where('id', $coupon->id)->increment('redeemed_count');
            self::grantBonuses($subscription, (int) $payment->coupon_credits, (int) $payment->coupon_free_days, (int) $payment->coupon_job_posts);
            self::onConsumed($coupon, $company->id);
        }
    }

    /**
     * Consume the pending redemption tied to a now-paid gateway payment: mark it consumed,
     * bump the coupon's redeemed_count, and grant its bonuses to the subscription. Idempotent —
     * a no-op if there is no unconsumed redemption for this payment. Called from
     * PaymentService::fulfill() inside its paid-transition transaction.
     */
    public static function consumeForPayment(Payment $payment): void
    {
        $redemption = CouponRedemption::where('payment_id', $payment->id)->whereNull('consumed_at')->first();
        if (! $redemption) {
            return;
        }

        $redemption->consumed_at = now();
        $redemption->save();

        Coupon::where('id', $redemption->coupon_id)->increment('redeemed_count');

        if ($payment->subscription_id) {
            $sub = Subscription::find($payment->subscription_id);
            if ($sub) {
                self::grantBonuses($sub, (int) $payment->coupon_credits, (int) $payment->coupon_free_days, (int) $payment->coupon_job_posts);
            }
        }

        $coupon = Coupon::find($redemption->coupon_id);
        if ($coupon) {
            self::onConsumed($coupon, $payment->company_id);
        }
    }

    /** Side-effects when a coupon is consumed — a referral welcome triggers the referrer's reward. */
    private static function onConsumed(Coupon $coupon, ?int $companyId): void
    {
        if ($coupon->kind === 'referral_welcome' && $companyId) {
            $company = Company::find($companyId);
            if ($company) {
                ReferralService::rewardReferrer($company);
            }
        }
    }

    /** Add bonus featured credits + job-post slots and extend the renewal date by any free days. */
    private static function grantBonuses(Subscription $sub, int $credits, int $freeDays, int $jobPosts = 0): void
    {
        if ($credits > 0) {
            Subscription::where('id', $sub->id)->increment('bonus_featured_credits', $credits);
        }
        if ($jobPosts > 0) {
            Subscription::where('id', $sub->id)->increment('bonus_job_posts', $jobPosts);
        }
        if ($freeDays > 0 && $sub->renews_at) {
            Subscription::where('id', $sub->id)->update([
                'renews_at' => $sub->renews_at->copy()->addDays($freeDays),
            ]);
        }
    }
}
