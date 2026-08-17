<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Notification;
use App\Models\Payment;
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
            'price'    => (float) ($d['premiumSlotPrice'] ?? 49),
            'currency' => strtoupper((string) ($d['premiumSlotCurrency'] ?? 'USD')),
            'days'     => (int) ($d['premiumSlotDays'] ?? 30),
            'limit'    => (int) ($d['premiumFeaturedLimit'] ?? 10),
            'manual'   => is_array($d['premiumFeatured'] ?? null) ? $d['premiumFeatured'] : [],
            'visible'  => ($d['premiumFeaturedVisible'] ?? true) !== false,
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

        return response()->json([
            'active'         => $active || $isComp,
            'paid_active'    => $active,
            'comp'           => $isComp && ! $active,
            'premium_until'  => $active ? $company->premium_until : null,
            'days_remaining' => $active ? max(0, (int) now()->diffInDays($company->premium_until, false)) : 0,
            'price'          => $cfg['price'],
            'currency'       => $cfg['currency'],
            'days'           => $cfg['days'],
            'limit'          => $cfg['limit'],
            'used'           => $used,
            'is_full'        => $used >= $cfg['limit'],
            // A renewal/comp already holds a slot; a brand-new buyer needs free capacity.
            'can_buy'        => $cfg['price'] > 0 && ($active || $isComp || $used < $cfg['limit']),
        ]);
    }

    public function checkout(Request $request)
    {
        $company = $this->resolveCompany($request->user());
        $cfg     = self::premiumConfig();

        if ($cfg['price'] <= 0) {
            return response()->json(['message' => 'Premium slots are not available for purchase right now.'], 422);
        }

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
            'method'   => 'sometimes|in:khqr,aba,stripe',
        ]);

        $price    = $cfg['price'];
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
        DB::transaction(function () use ($company, $price, $currency, $fxRate, $data, &$payment) {
            $payment = Payment::create([
                'company_id' => $company->id,
                'purpose'    => 'premium_slot',
                'invoice_no' => $this->nextInvoiceNo(),
                'amount'     => $price,
                'currency'   => $currency,
                'fx_rate'    => $fxRate,
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
