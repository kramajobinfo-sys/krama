<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Coupon;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Str;

class ReferralService
{
    /** Read the admin-configured referral reward settings (with sane defaults). */
    public static function config(): array
    {
        $s = Setting::where('group', 'referral')->pluck('value', 'key')->toArray();
        $n = fn ($k, $d = 0) => is_numeric($s[$k] ?? null) ? $s[$k] + 0 : $d;
        return [
            'enabled'          => (int) ($s['enabled'] ?? 0) === 1,
            'expiry_days'      => (int) $n('expiry_days', 90),
            'welcome'          => [
                'percent_off' => (int) $n('welcome_percent_off'),
                'amount_off'  => (float) $n('welcome_amount_off'),
                'credits'     => (int) $n('welcome_credits'),
                'free_days'   => (int) $n('welcome_free_days'),
                'job_posts'   => (int) $n('welcome_job_posts'),
            ],
            'referrer'         => [
                'percent_off' => (int) $n('referrer_percent_off'),
                'amount_off'  => (float) $n('referrer_amount_off'),
                'credits'     => (int) $n('referrer_credits'),
                'free_days'   => (int) $n('referrer_free_days'),
                'job_posts'   => (int) $n('referrer_job_posts'),
            ],
        ];
    }

    /** Generate a unique referral code and assign it to the user if they don't have one. */
    public static function ensureCode(User $user): string
    {
        if ($user->referral_code) {
            return $user->referral_code;
        }
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        $user->referral_code = $code;
        $user->save();
        return $code;
    }

    /** Resolve an employer user by their referral code (case-insensitive), or null. */
    public static function referrerByCode(?string $code): ?User
    {
        $c = strtoupper(trim((string) $code));
        if ($c === '') {
            return null;
        }
        return User::whereRaw('UPPER(referral_code) = ?', [$c])->first();
    }

    private static function rewardIsEmpty(array $r): bool
    {
        return empty($r['percent_off']) && empty($r['amount_off']) && empty($r['credits']) && empty($r['free_days']) && empty($r['job_posts']);
    }

    private static function makeCode(string $prefix): string
    {
        do {
            $code = strtoupper($prefix . '-' . Str::random(6));
        } while (Coupon::whereRaw('UPPER(code) = ?', [$code])->exists());
        return $code;
    }

    /**
     * Issue the new employer their welcome coupon (personal, single-use) once their company
     * exists — only if they were referred, referrals are enabled, a welcome reward is configured,
     * and they don't already have one. Called from CompanyController@store.
     */
    public static function issueWelcomeCoupon(Company $company): ?Coupon
    {
        $cfg = self::config();
        if (! $cfg['enabled'] || self::rewardIsEmpty($cfg['welcome'])) {
            return null;
        }
        $owner = User::find($company->user_id);
        if (! $owner || ! $owner->referred_by) {
            return null;
        }
        // Already issued?
        if (Coupon::where('kind', 'referral_welcome')->where('owner_company_id', $company->id)->exists()) {
            return null;
        }

        return self::createPersonalCoupon($company->id, 'referral_welcome', 'WELCOME', 'Referral welcome discount', $cfg['welcome'], $cfg['expiry_days']);
    }

    /**
     * Reward the referrer when their referee's first paid subscription confirms. Resolves the
     * referrer's company and issues them a personal reward coupon. Called from CouponService when
     * a referral_welcome coupon is consumed. Idempotent per referee (guarded by a label tag).
     */
    public static function rewardReferrer(Company $referredCompany): ?Coupon
    {
        $cfg = self::config();
        if (! $cfg['enabled'] || self::rewardIsEmpty($cfg['referrer'])) {
            return null;
        }
        $referredOwner = User::find($referredCompany->user_id);
        if (! $referredOwner || ! $referredOwner->referred_by) {
            return null;
        }
        $referrer = User::find($referredOwner->referred_by);
        if (! $referrer) {
            return null;
        }
        // Resolve the referrer's company (owner, or recruiter link).
        $referrerCompany = Company::where('user_id', $referrer->id)->first();
        if (! $referrerCompany && $referrer->company_id) {
            $referrerCompany = Company::find($referrer->company_id);
        }
        if (! $referrerCompany) {
            return null;
        }

        $tag = '[ref:' . $referredCompany->id . ']';
        if (Coupon::where('kind', 'referral_reward')->where('owner_company_id', $referrerCompany->id)->where('label', 'like', '%' . $tag . '%')->exists()) {
            return null; // already rewarded for this referee
        }

        return self::createPersonalCoupon($referrerCompany->id, 'referral_reward', 'THANKS', 'Referral reward ' . $tag, $cfg['referrer'], $cfg['expiry_days']);
    }

    private static function createPersonalCoupon(int $companyId, string $kind, string $prefix, string $label, array $reward, int $expiryDays): Coupon
    {
        return Coupon::create([
            'code'                   => self::makeCode($prefix),
            'label'                  => $label,
            'kind'                   => $kind,
            'scope'                  => 'single_use',
            'percent_off'            => $reward['percent_off'] ?: null,
            'amount_off'             => $reward['amount_off'] ?: null,
            'bonus_featured_credits' => $reward['credits'] ?: null,
            'bonus_free_days'        => $reward['free_days'] ?: null,
            'bonus_job_posts'        => $reward['job_posts'] ?: null,
            'max_redemptions'        => 1,
            'expires_at'             => $expiryDays > 0 ? now()->addDays($expiryDays) : null,
            'is_active'              => true,
            'owner_company_id'       => $companyId,
        ]);
    }
}
