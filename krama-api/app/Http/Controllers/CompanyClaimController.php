<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyClaim;
use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * "Claim your company" — when a company was created on an employer's behalf, the real
 * employer can request ownership. They search the approved companies, submit a claim, and
 * an admin approves it → ownership transfers to them (companies.user_id), or rejects it.
 *
 * Billing is company-scoped (subscriptions.company_id), so an ownership transfer needs no
 * re-pointing — the plan stays with the company.
 */
class CompanyClaimController extends Controller
{
    // ── Employer side ────────────────────────────────────────────────────────

    /** GET /api/employer/claimable?q= — approved companies matching a name, to request a claim. */
    public function searchClaimable(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');

        $q = trim((string) $request->query('q', ''));
        if (mb_strlen($q) < 2) return response()->json(['data' => []]);

        $rows = Company::where('status', 'approved')
            ->whereRaw('LOWER(name) LIKE ?', ['%' . mb_strtolower($q) . '%'])
            ->where('user_id', '!=', $user->id)
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name', 'logo_url', 'location_id']);

        return response()->json(['data' => $rows->map(fn ($c) => [
            'id' => $c->id, 'name' => $c->name, 'logo_url' => $c->logo_url,
        ])]);
    }

    /** POST /api/employer/company-claims { company_id, message } */
    public function store(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');

        // An employer who already owns or belongs to a company can't claim another.
        if (Company::where('user_id', $user->id)->exists() || $user->company_id) {
            return response()->json(['message' => 'Your account already has a company.'], 422);
        }

        $data = $request->validate([
            'company_id' => 'required|integer|exists:companies,id',
            'message'    => 'nullable|string|max:500',
        ]);

        if (CompanyClaim::where('user_id', $user->id)->where('status', 'pending')->exists()) {
            return response()->json(['message' => 'You already have a pending claim. Please wait for it to be reviewed.'], 422);
        }

        $claim = CompanyClaim::create([
            'company_id' => $data['company_id'],
            'user_id'    => $user->id,
            'email'      => $user->email,
            'message'    => $data['message'] ?? null,
            'status'     => 'pending',
        ]);

        $company = Company::find($data['company_id']);
        try {
            TelegramService::notifyAdmin("🏢 Company claim requested\n" . $user->email . " → " . ($company->name ?? ('#' . $data['company_id'])) . "\nReview in Admin → Company claims.");
        } catch (\Throwable $e) {
            Log::warning('Company-claim notify failed: ' . $e->getMessage());
        }

        return response()->json(['message' => "Request submitted. We'll review it and grant you access shortly.", 'id' => $claim->id], 201);
    }

    /** GET /api/employer/company-claims — the requester's own claims + status. */
    public function mine(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');

        $rows = CompanyClaim::with('company:id,name')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $rows->map(fn ($r) => [
            'id' => $r->id, 'status' => $r->status,
            'company' => $r->company ? ['id' => $r->company->id, 'name' => $r->company->name] : null,
            'created_at' => $r->created_at, 'handled_at' => $r->handled_at,
        ])]);
    }

    // ── Admin side ───────────────────────────────────────────────────────────

    /** GET /api/admin/company-claims?status=pending */
    public function adminIndex(Request $request)
    {
        $this->requirePermission('approve_companies');

        $status = $request->query('status', 'pending');
        $q = CompanyClaim::query();
        if (in_array($status, ['pending', 'approved', 'rejected'], true)) $q->where('status', $status);

        $rows = $q->orderByRaw("FIELD(status,'pending','rejected','approved')")
            ->orderByDesc('created_at')->limit(300)->get();

        $companies = Company::whereIn('id', $rows->pluck('company_id')->unique())->get(['id', 'name', 'user_id', 'status'])->keyBy('id');
        $users = User::whereIn('id', $rows->pluck('user_id')->unique())->get(['id', 'name', 'email', 'status'])->keyBy('id');

        return response()->json([
            'data' => $rows->map(function ($r) use ($companies, $users) {
                $c = $companies->get($r->company_id);
                $u = $users->get($r->user_id);
                return [
                    'id' => $r->id, 'status' => $r->status, 'message' => $r->message,
                    'created_at' => $r->created_at, 'handled_at' => $r->handled_at,
                    'company' => $c ? ['id' => $c->id, 'name' => $c->name, 'status' => $c->status, 'current_owner_id' => $c->user_id] : null,
                    'requester' => $u ? ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'status' => $u->status] : null,
                ];
            }),
            'pending' => CompanyClaim::where('status', 'pending')->count(),
        ]);
    }

    /** POST /api/admin/company-claims/{id}/approve — transfer ownership to the requester. */
    public function approve(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $claim = CompanyClaim::findOrFail($id);
        if ($claim->status !== 'pending') {
            return response()->json(['message' => 'This claim has already been handled.'], 422);
        }

        $company = Company::find($claim->company_id);
        $newOwner = User::find($claim->user_id);
        if (! $company || ! $newOwner) {
            return response()->json(['message' => 'The company or requester no longer exists.'], 422);
        }
        // The requester must still be company-less (avoid stealing an already-run company).
        if ($newOwner->company_id && (int) $newOwner->company_id !== (int) $company->id) {
            return response()->json(['message' => 'The requester now belongs to another company.'], 422);
        }

        DB::transaction(function () use ($company, $newOwner, $claim, $request) {
            $prevOwnerId = (int) $company->user_id;

            // Transfer ownership. Owner is identified by companies.user_id; owners carry a null
            // company_role (they own it) but we set company_id so member lookups resolve too.
            $company->forceFill(['user_id' => $newOwner->id])->save();
            $newOwner->forceFill(['company_id' => $company->id, 'company_role' => null])->save();

            // If the previous owner was a real employer (not an admin/staff account creating it
            // on behalf), keep them on as a company_admin member rather than orphaning them.
            if ($prevOwnerId && $prevOwnerId !== $newOwner->id) {
                $prev = User::find($prevOwnerId);
                if ($prev && optional($prev->role)->slug === 'employer') {
                    $prev->forceFill(['company_id' => $company->id, 'company_role' => 'company_admin'])->save();
                }
            }

            $claim->forceFill(['status' => 'approved', 'handled_at' => now(), 'handled_by' => $request->user()->id])->save();
            // Close any other pending claims by this user.
            CompanyClaim::where('user_id', $newOwner->id)->where('status', 'pending')->where('id', '!=', $claim->id)
                ->update(['status' => 'rejected', 'handled_at' => now()]);
        });

        Log::info("Company #{$company->id} ownership transferred to user #{$newOwner->id} (claim #{$claim->id}).");

        return response()->json(['message' => 'Approved — ownership transferred to ' . $newOwner->email . '.']);
    }

    /** POST /api/admin/company-claims/{id}/reject */
    public function reject(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $claim = CompanyClaim::findOrFail($id);
        $claim->forceFill(['status' => 'rejected', 'handled_at' => now(), 'handled_by' => $request->user()->id])->save();

        return response()->json(['message' => 'Claim rejected.']);
    }
}
