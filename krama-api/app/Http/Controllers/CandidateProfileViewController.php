<?php

namespace App\Http\Controllers;

use App\Models\ProfileView;
use Illuminate\Http\Request;

// "Who viewed your profile" for candidates — the companies that opened their profile from
// the employer talent search. Read-only; the write side lives in EmployerCandidateController.
class CandidateProfileViewController extends Controller
{
    // Free candidates see only the most recent few viewers; Premium unlocks the rest.
    private const FREE_LIMIT = 3;

    // GET /api/candidate/profile-views — viewer companies (newest first) + a "new since last
    // seen" count, then advances the seen marker so the badge clears. Gated: free candidates
    // get the FREE_LIMIT most recent viewers plus a locked_count; Premium gets everything.
    public function index(Request $request)
    {
        $this->requirePermission('save_jobs');
        $user = $request->user();

        $rows = ProfileView::with(['company:id,name,logo_url,industry,is_verified'])
            ->where('candidate_id', $user->id)
            ->orderByDesc('last_viewed_at')
            ->limit(100)
            ->get();

        $seenAt = $user->profile_views_seen_at;
        $newCount = $rows->filter(function ($r) use ($seenAt) {
            return ! $seenAt || ($r->last_viewed_at && $r->last_viewed_at->gt($seenAt));
        })->count();

        $isPremium = $user->isCandidatePremium();
        $total = $rows->count();
        // Free: only reveal the most recent FREE_LIMIT — locked viewers' identities are
        // never sent to the client, so the paywall can't be bypassed.
        $visible = $isPremium ? $rows : $rows->take(self::FREE_LIMIT);
        $lockedCount = $isPremium ? 0 : max(0, $total - $visible->count());

        $viewers = $visible->map(function ($r) {
            $c = $r->company;
            return [
                'company_id'     => $r->company_id,
                'company'        => $c ? $c->name : 'A company',
                'logo_url'       => $c ? $c->logo_url : null,
                'industry'       => $c ? $c->industry : null,
                'is_verified'    => $c ? (bool) $c->is_verified : false,
                'view_count'     => (int) $r->view_count,
                'last_viewed_at' => optional($r->last_viewed_at)->toIso8601String(),
            ];
        })->values();

        // Advance the seen marker AFTER computing new_count.
        $user->forceFill(['profile_views_seen_at' => now()])->save();

        return response()->json([
            'total'        => $total,
            'new_count'    => $newCount,
            'is_premium'   => $isPremium,
            'locked_count' => $lockedCount,
            'viewers'      => $viewers,
        ]);
    }

    // GET /api/candidate/profile-views/count — just the unseen count (for the nav badge).
    public function count(Request $request)
    {
        $this->requirePermission('save_jobs');
        $user = $request->user();

        $q = ProfileView::where('candidate_id', $user->id);
        if ($user->profile_views_seen_at) {
            $q->where('last_viewed_at', '>', $user->profile_views_seen_at);
        }

        return response()->json([
            'new_count' => $q->count(),
            'total'     => ProfileView::where('candidate_id', $user->id)->count(),
        ]);
    }
}
