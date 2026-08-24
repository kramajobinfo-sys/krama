<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\PremiumWaitlist;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Premium Featured homepage slot — a paid, time-boxed placement above the regular
 * Featured companies. Mirrors the featured-job boost flow (JobController::boost):
 * a pending Payment is created, and PaymentService::fulfill() sets companies.premium_until
 * on confirmation. Config (price / duration / limit / manual comps) lives in the
 * admin home_content settings blob.
 */
class PremiumSlotController extends Controller
{
    // Read premium-slot config from the admin-managed home_content settings blob.
    public static function premiumConfig(): array
    {
        $raw = Setting::where('group', 'home_content')->where('key', 'data')->value('value');
        $d   = json_decode($raw ?: '{}', true);
        if (! is_array($d)) $d = [];

        return [
            'price'        => (float) ($d['premiumSlotPrice'] ?? 49),
            'currency'     => strtoupper((string) ($d['premiumSlotCurrency'] ?? 'USD')),
            'days'         => (int) ($d['premiumSlotDays'] ?? 30),
            // Optional annual option: enabled when a non-zero annual price is set.
            'annual_price' => (float) ($d['premiumSlotAnnualPrice'] ?? 0),
            'annual_days'  => (int) ($d['premiumSlotAnnualDays'] ?? 365),
            'limit'        => (int) ($d['premiumFeaturedLimit'] ?? 10),
            'manual'       => is_array($d['premiumFeatured'] ?? null) ? $d['premiumFeatured'] : [],
            'visible'      => ($d['premiumFeaturedVisible'] ?? true) !== false,
        ];
    }

    // Distinct companies currently occupying a premium slot: paid (premium_until in the
    // future) ∪ admin "comp" picks (by name). Both count toward the global limit.
    public static function occupiedCount(array $cfg): int
    {
        return Company::query()
            ->where(function ($q) use ($cfg) {
                $q->where('premium_until', '>', now());
                if (! empty($cfg['manual'])) $q->orWhereIn('name', $cfg['manual']);
            })
            ->count();
    }

    public function status(Request $request)
    {
        $company = $this->resolveCompany($request->user());
        $cfg     = self::premiumConfig();
        $used    = self::occupiedCount($cfg);
        $active  = $company->premium_until !== null && $company->premium_until->isFuture();
        $isComp  = in_array($company->name, $cfg['manual'], true);

        // Waitlist state for this company + the queue depth ahead of it.
        $wl = PremiumWaitlist::where('company_id', $company->id)->first();
        $waitlistCount = PremiumWaitlist::count();
        $waitlistPos = $wl
            ? PremiumWaitlist::where('id', '<=', $wl->id)->count()
            : 0;

        return response()->json([
            'active'         => $active || $isComp,
            'paid_active'    => $active,
            'comp'           => $isComp && ! $active,
            'premium_until'  => $active ? $company->premium_until : null,
            'days_remaining' => $active ? max(0, (int) now()->diffInDays($company->premium_until, false)) : 0,
            'price'          => $cfg['price'],
            'currency'       => $cfg['currency'],
            'days'           => $cfg['days'],
            'annual_available' => $cfg['annual_price'] > 0,
            'annual_price'   => $cfg['annual_price'],
            'annual_days'    => $cfg['annual_days'],
            'limit'          => $cfg['limit'],
            'used'           => $used,
            'is_full'        => $used >= $cfg['limit'],
            // A renewal/comp already holds a slot; a brand-new buyer needs free capacity.
            // (Price may be $0 for a promo/test — that's a valid free grant, so no price gate here.)
            'can_buy'        => ($active || $isComp || $used < $cfg['limit']),
            'waitlisted'     => (bool) $wl,
            'waitlist_position' => $waitlistPos,
            'waitlist_count' => $waitlistCount,
        ]);
    }

    // Employer joins the waitlist — only meaningful when all slots are full and they
    // don't already hold one. Idempotent; alerts admins so they can gauge demand.
    public function joinWaitlist(Request $request)
    {
        $company = $this->resolveCompany($request->user());
        $cfg     = self::premiumConfig();

        $active = $company->premium_until !== null && $company->premium_until->isFuture();
        $isComp = in_array($company->name, $cfg['manual'], true);
        if ($active || $isComp) {
            return response()->json(['message' => 'Your company already holds a premium slot.'], 422);
        }
        if (self::occupiedCount($cfg) < $cfg['limit']) {
            return response()->json(['message' => 'Slots are available — you can buy one now.'], 422);
        }

        $existing = PremiumWaitlist::where('company_id', $company->id)->first();
        if (! $existing) {
            PremiumWaitlist::create(['company_id' => $company->id]);
            Notification::recordAdmins(
                'premium_waitlist',
                'Premium waitlist',
                '“' . ($company->name ?? 'A company') . '” joined the Premium slot waitlist.'
            );
        }

        $wl  = PremiumWaitlist::where('company_id', $company->id)->first();
        $pos = $wl ? PremiumWaitlist::where('id', '<=', $wl->id)->count() : 0;
        return response()->json(['waitlisted' => true, 'waitlist_position' => $pos, 'waitlist_count' => PremiumWaitlist::count()]);
    }

    public function leaveWaitlist(Request $request)
    {
        $company = $this->resolveCompany($request->user());
        PremiumWaitlist::where('company_id', $company->id)->delete();
        return response()->json(['waitlisted' => false, 'waitlist_count' => PremiumWaitlist::count()]);
    }

    // Admin overview: current occupants split into paid (with expiry) vs comp, plus the
    // waitlist queue. Used by the admin Homepage → Explore → Premium card.
    public function adminOverview(Request $request)
    {
        $cfg = self::premiumConfig();

        $paid = Company::where('premium_until', '>', now())
            ->orderBy('premium_until')
            ->get(['id', 'name', 'logo_url', 'premium_until'])
            ->map(fn ($c) => [
                'id'            => $c->id,
                'name'          => $c->name,
                'logo_url'      => $c->logo_url,
                'premium_until' => $c->premium_until,
            ]);

        $paidNames = $paid->pluck('name')->all();
        // Comp = admin manual picks that aren't already counted as paid.
        $comp = array_values(array_filter($cfg['manual'], fn ($n) => ! in_array($n, $paidNames, true)));

        $waitlist = PremiumWaitlist::with('company:id,name,logo_url')
            ->orderBy('id')
            ->get()
            ->map(fn ($w) => [
                'company_id' => $w->company_id,
                'name'       => $w->company ? $w->company->name : ('#' . $w->company_id),
                'logo_url'   => $w->company ? $w->company->logo_url : null,
                'since'      => $w->created_at,
            ]);

        return response()->json([
            'limit'    => $cfg['limit'],
            'used'     => self::occupiedCount($cfg),
            'paid'     => $paid,
            'comp'     => $comp,
            'waitlist' => $waitlist,
        ]);
    }

    public function checkout(Request $request)
    {
        $this->requireCompanyCapability('manage_billing');
        $company = $this->resolveCompany($request->user());
        $cfg     = self::premiumConfig();

        $active = $company->premium_until !== null && $company->premium_until->isFuture();
        $isComp = in_array($company->name, $cfg['manual'], true);

        // Only a NEW occupant is subject to the cap; renewals/comps already hold their slot.
        if (! $active && ! $isComp && self::occupiedCount($cfg) >= $cfg['limit']) {
            return response()->json([
                'message' => 'Premium is full — all ' . $cfg['limit'] . ' slots are currently taken. Please try again later.',
            ], 409);
        }

        $data = $request->validate([
            'currency' => 'sometimes|in:USD,KHR',
            'method'   => 'sometimes|in:khqr,aba,acleda,card,cod,stripe',
            'period'   => 'sometimes|in:month,year',
        ]);

        // Annual chosen only when offered (annual_price>0). The granted duration is stamped
        // on the payment (credits column) so fulfill() extends by the right amount even if
        // the admin later changes the config.
        $annual   = (($data['period'] ?? 'month') === 'year') && $cfg['annual_price'] > 0;
        $price    = $annual ? $cfg['annual_price'] : $cfg['price'];
        $days     = $annual ? $cfg['annual_days'] : $cfg['days'];

        // Free ($0) slot — admin promo / test price. Skip the gateway and grant immediately
        // (a $0 paid invoice is still recorded via fulfill for the audit trail).
        if ($price <= 0) {
            $payment = null;
            DB::transaction(function () use ($company, $days, &$payment) {
                $payment = Payment::create([
                    'company_id' => $company->id,
                    'purpose'    => 'premium_slot',
                    'invoice_no' => $this->nextInvoiceNo(),
                    'amount'     => 0,
                    'currency'   => 'USD',
                    'credits'    => $days,
                    'method'     => 'free',
                    'status'     => 'pending',
                    'created_at' => now(),
                ]);
            });
            \App\Services\PaymentService::fulfill($payment); // flips to paid + sets premium_until
            return response()->json([
                'requires_payment' => false,
                'payment'          => $payment->fresh(),
                'message'          => 'Your company is now Premium.',
            ]);
        }

        $currency = $cfg['currency'];
        $fxRate   = null;

        // KHR conversion from a USD base price (mirrors boost / subscribe). Only convert a
        // USD base — if the admin priced in KHR it is already riel and must not be re-converted.
        if (($data['currency'] ?? $currency) === 'KHR' && $currency === 'USD' && $price > 0) {
            $manual = (float) (Setting::where('group', 'tax')->where('key', 'exchange_rate_khr')->value('value') ?: 0);
            $fxRate = $manual > 0 ? $manual : 4100.0;
            $price  = round($price * $fxRate); // whole riel — no minor unit
            $currency = 'KHR';
        }

        $payment = null;
        DB::transaction(function () use ($company, $price, $currency, $fxRate, $days, $data, &$payment) {
            $payment = Payment::create([
                'company_id' => $company->id,
                'purpose'    => 'premium_slot',
                'invoice_no' => $this->nextInvoiceNo(),
                'amount'     => $price,
                'currency'   => $currency,
                'fx_rate'    => $fxRate,
                'credits'    => $days, // days granted on fulfilment (month vs year)
                'method'     => $data['method'] ?? 'khqr',
                'status'     => 'pending',
                'created_at' => now(),
            ]);
        });

        Notification::recordAdmins(
            'payment_pending',
            'New payment pending',
            'Premium-slot payment ' . $currency . ' ' . number_format((float) $price, 2) . ' from “' . ($company->name ?? 'a company') . '” is awaiting confirmation.'
        );

        return response()->json([
            'requires_payment' => true,
            'payment'          => $payment,
            'price'            => $price,
            'currency'         => $currency,
            'days'             => $cfg['days'],
            'message'          => 'Payment pending. Your company becomes Premium once payment is confirmed.',
        ], 201);
    }

    // Company owner, or a recruiter linked via company_id (same rule as JobController).
    private function resolveCompany($user): Company
    {
        $company = Company::where('user_id', $user->id)->first();
        if ($company) return $company;

        if ($user->company_id) {
            $company = Company::find($user->company_id);
            if ($company) return $company;
        }

        abort(422, 'No company profile found. Create a company first.');
    }

    private function nextInvoiceNo(): string
    {
        $year   = date('Y');
        $result = Payment::lockForUpdate()
            ->where('invoice_no', 'like', "INV-$year-%")
            ->selectRaw("MAX(CAST(SUBSTRING(invoice_no, -4) AS UNSIGNED)) as max_seq")
            ->first();
        $seq = (int) ($result->max_seq ?? 0) + 1;
        return sprintf('INV-%s-%04d', $year, $seq);
    }
}
