<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Coupon;
use App\Models\CouponRedemption;
use App\Models\Plan;
use App\Models\User;
use App\Services\CouponService;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CouponController extends Controller
{
    // ── Employer ─────────────────────────────────────────────────────────────

    // POST /api/employer/coupon/validate — live preview of a coupon at checkout.
    // Returns the money discount + any bonus credits/free days for the chosen plan, or a reason.
    public function validateCode(Request $request)
    {
        $this->requirePermission('post_jobs');

        $data = $request->validate([
            'plan_id' => 'required|exists:plans,id',
            'code'    => 'required|string|max:40',
        ]);

        $company = $this->employerCompany($request->user());
        $plan    = Plan::where('is_active', true)->findOrFail($data['plan_id']);

        $result = CouponService::evaluate($data['code'], $company, $plan, $plan->effective_price);

        if (! $result['ok']) {
            return response()->json(['ok' => false, 'message' => $result['message']], 422);
        }

        $coupon = $result['coupon'];
        return response()->json([
            'ok'         => true,
            'code'       => $coupon->code,
            'label'      => $coupon->label,
            'discount'   => $result['discount'],
            'new_charge' => $result['new_charge'],
            'credits'    => $result['credits'],
            'free_days'  => $result['free_days'],
        ]);
    }

    // GET /api/employer/coupon/available?plan_id= — best personal (referral) coupon pre-applied at checkout.
    public function available(Request $request)
    {
        $this->requirePermission('post_jobs');
        $data = $request->validate(['plan_id' => 'required|exists:plans,id']);
        $company = $this->employerCompany($request->user());
        $plan    = Plan::where('is_active', true)->findOrFail($data['plan_id']);

        $r = CouponService::bestPersonal($company, $plan);
        if (! $r) {
            return response()->json(['available' => false]);
        }
        return response()->json([
            'available'  => true,
            'code'       => $r['coupon']->code,
            'label'      => $r['coupon']->label,
            'kind'       => $r['kind'],
            'discount'   => $r['discount'],
            'new_charge' => $r['new_charge'],
            'credits'    => $r['credits'],
            'free_days'  => $r['free_days'],
        ]);
    }

    // GET /api/employer/referral — the employer's own referral code, share link and stats.
    public function myReferral(Request $request)
    {
        $this->requirePermission('post_jobs');
        $user = $request->user();
        $code = ReferralService::ensureCode($user);

        $company = Company::where('user_id', $user->id)->first();
        if (! $company && $user->company_id) {
            $company = Company::find($user->company_id);
        }
        $rewarded = $company ? Coupon::where('kind', 'referral_reward')->where('owner_company_id', $company->id)->count() : 0;

        $base = rtrim((string) config('app.url'), '/');
        $cfg  = ReferralService::config();
        return response()->json([
            'code'           => $code,
            'link'           => $base . '/?ref=' . $code,
            'referred_count' => User::where('referred_by', $user->id)->count(),
            'rewarded_count' => $rewarded,
            'enabled'        => $cfg['enabled'],
            'welcome'        => $cfg['welcome'],
            'referrer'       => $cfg['referrer'],
        ]);
    }

    // ── Admin ────────────────────────────────────────────────────────────────

    // GET /api/admin/coupons
    public function adminIndex(Request $request)
    {
        $this->requirePermission('manage_plans');

        $q = Coupon::query()->withCount(['redemptions as consumed_count' => function ($r) {
            $r->whereNotNull('consumed_at');
        }]);

        // Default to admin-created promo codes; referral-issued personal coupons are auto-managed
        // and only shown when explicitly requested (?kind=all or a specific kind).
        if ($request->filled('kind')) {
            if ($request->kind !== 'all') {
                $q->where('kind', $request->kind);
            }
        } else {
            $q->where('kind', 'promo');
        }
        if ($request->filled('active')) {
            $q->where('is_active', filter_var($request->active, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('q')) {
            $term = trim((string) $request->q);
            $q->where(fn ($w) => $w->where('code', 'like', "%$term%")->orWhere('label', 'like', "%$term%"));
        }

        $perPage = min(200, max(1, (int) $request->input('per_page', 50)));

        return response()->json($q->orderBy('created_at', 'desc')->paginate($perPage));
    }

    // POST /api/admin/coupons
    public function store(Request $request)
    {
        $this->requirePermission('manage_plans');

        $data = $this->validateCoupon($request, true);
        $data = $this->normaliseRewardFields($data, $request);

        // Every coupon must grant something.
        $hasReward = ! empty($data['percent_off']) || ! empty($data['amount_off'])
            || ! empty($data['bonus_featured_credits']) || ! empty($data['bonus_free_days']);
        if (! $hasReward) {
            return response()->json(['message' => 'Set at least one reward: a percentage, a fixed amount, featured credits, or free days.'], 422);
        }

        // A single explicit code, or bulk-generate a batch of unique single-use codes.
        $count = (int) $request->input('generate_count', 0);
        if ($count > 1) {
            if (($data['scope'] ?? 'single_use') !== 'single_use') {
                return response()->json(['message' => 'Bulk generation is only for single-use codes.'], 422);
            }
            $created = $this->generateBatch($data, $request, $count);
            $this->auditLog('coupon.batch_created', ['count' => count($created), 'prefix' => $request->input('prefix')]);
            return response()->json(['message' => count($created) . ' coupons generated.', 'coupons' => $created], 201);
        }

        $code = CouponService::normalize($data['code'] ?? '');
        if ($code === '') {
            return response()->json(['message' => 'A coupon code is required.'], 422);
        }
        if (Coupon::whereRaw('UPPER(code) = ?', [$code])->exists()) {
            return response()->json(['message' => 'That coupon code already exists.'], 422);
        }

        $coupon = Coupon::create(array_merge($data, [
            'code'       => $code,
            'created_by' => $request->user()->id,
        ]));

        $this->auditLog('coupon.created', ['coupon_id' => $coupon->id, 'code' => $coupon->code]);

        return response()->json($coupon, 201);
    }

    // PUT /api/admin/coupons/{id}
    public function update(Request $request, $id)
    {
        $this->requirePermission('manage_plans');

        $coupon = Coupon::findOrFail($id);
        $data   = $this->validateCoupon($request, false);
        $data   = $this->normaliseRewardFields($data, $request);

        // Code may be changed only while the coupon has never been redeemed.
        if (! empty($data['code'])) {
            $code = CouponService::normalize($data['code']);
            if ($code !== $coupon->code) {
                if ($coupon->redeemed_count > 0) {
                    return response()->json(['message' => 'Cannot change the code of a coupon that has been redeemed.'], 422);
                }
                if (Coupon::whereRaw('UPPER(code) = ?', [$code])->where('id', '!=', $coupon->id)->exists()) {
                    return response()->json(['message' => 'That coupon code already exists.'], 422);
                }
                $data['code'] = $code;
            } else {
                unset($data['code']);
            }
        }

        $coupon->update($data);
        $this->auditLog('coupon.updated', ['coupon_id' => $coupon->id, 'changes' => array_keys($data)]);

        return response()->json($coupon->fresh());
    }

    // DELETE /api/admin/coupons/{id} — soft policy: block delete once redeemed (keep the audit trail);
    // admins expire a live coupon by setting is_active=false instead.
    public function destroy(Request $request, $id)
    {
        $this->requirePermission('manage_plans');

        $coupon = Coupon::findOrFail($id);
        if ($coupon->redeemed_count > 0) {
            return response()->json(['message' => 'Cannot delete a coupon that has been redeemed. Deactivate it instead.'], 422);
        }

        $this->auditLog('coupon.deleted', ['coupon_id' => $coupon->id, 'code' => $coupon->code]);
        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted.']);
    }

    // GET /api/admin/coupons/{id}/redemptions
    public function redemptions(Request $request, $id)
    {
        $this->requirePermission('manage_plans');

        $coupon = Coupon::findOrFail($id);
        $rows = CouponRedemption::where('coupon_id', $coupon->id)
            ->with(['company:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(min(200, max(1, (int) $request->input('per_page', 50))));

        return response()->json(['coupon' => $coupon, 'redemptions' => $rows]);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function validateCoupon(Request $request, bool $creating): array
    {
        $req = $creating ? 'sometimes' : 'sometimes';
        return $request->validate([
            'code'                   => "$req|nullable|string|max:40",
            'label'                  => 'sometimes|nullable|string|max:120',
            'scope'                  => 'sometimes|in:single_use,per_employer',
            'percent_off'            => 'sometimes|nullable|integer|min:1|max:100',
            'amount_off'             => 'sometimes|nullable|numeric|min:0',
            'amount_currency'        => 'sometimes|string|max:8',
            'bonus_featured_credits' => 'sometimes|nullable|integer|min:0|max:1000',
            'bonus_free_days'        => 'sometimes|nullable|integer|min:0|max:3650',
            'plan_id'                => 'sometimes|nullable|exists:plans,id',
            'min_amount'             => 'sometimes|nullable|numeric|min:0',
            'max_redemptions'        => 'sometimes|nullable|integer|min:1',
            'starts_at'              => 'sometimes|nullable|date',
            'expires_at'             => 'sometimes|nullable|date',
            'is_active'              => 'sometimes|boolean',
        ]);
    }

    // Blank reward fields come in as null; force at least one reward to be present.
    private function normaliseRewardFields(array $data, Request $request): array
    {
        foreach (['percent_off', 'amount_off', 'bonus_featured_credits', 'bonus_free_days', 'min_amount', 'max_redemptions'] as $k) {
            if (array_key_exists($k, $data) && ($data[$k] === '' || $data[$k] === 0 || $data[$k] === '0')) {
                // treat 0 / empty as "not set" for the reward + limit fields
                if (in_array($k, ['percent_off', 'amount_off', 'bonus_featured_credits', 'bonus_free_days'], true)) {
                    $data[$k] = null;
                }
            }
        }
        return $data;
    }

    // Generate N unique single-use coupon codes sharing the same reward config.
    private function generateBatch(array $data, Request $request, int $count): array
    {
        $count  = min(2000, $count);
        $prefix = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', (string) $request->input('prefix', '')));
        $prefix = substr($prefix, 0, 12);

        $created = [];
        for ($i = 0; $i < $count; $i++) {
            $code = null;
            for ($try = 0; $try < 8; $try++) {
                $candidate = ($prefix ? $prefix . '-' : '') . strtoupper(Str::random(8));
                if (! Coupon::whereRaw('UPPER(code) = ?', [$candidate])->exists()) {
                    $code = $candidate;
                    break;
                }
            }
            if (! $code) {
                continue;
            }
            $created[] = Coupon::create(array_merge($data, [
                'code'            => $code,
                'scope'           => 'single_use',
                'max_redemptions' => 1,
                'created_by'      => $request->user()->id,
            ]))->only(['id', 'code']);
        }
        return $created;
    }

    // Resolve the employer's company (owner, or recruiter via company_id).
    private function employerCompany($user): Company
    {
        $company = Company::where('user_id', $user->id)->first();
        if ($company) return $company;
        if ($user->company_id) {
            $company = Company::find($user->company_id);
            if ($company) return $company;
        }
        abort(422, 'No company profile found.');
    }
}
