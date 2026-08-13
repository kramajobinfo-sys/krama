<?php

namespace App\Http\Controllers;

use App\Models\CandidateInvitation;
use Illuminate\Http\Request;

// Candidate-side view of invitations to apply. A candidate only ever sees invitations addressed
// to them. Listing marks unseen ones as viewed.
class CandidateInvitationController extends Controller
{
    // GET /candidate/invitations
    public function index(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('apply_jobs');

        $invs = CandidateInvitation::with(['job:id,title,slug,status,company_id', 'job.company:id,name,logo_url'])
            ->where('candidate_id', $user->id)
            ->whereIn('status', ['sent', 'viewed', 'applied'])
            ->orderByDesc('created_at')->get();

        // Mark freshly-seen invitations as viewed.
        CandidateInvitation::where('candidate_id', $user->id)->where('status', 'sent')
            ->update(['status' => 'viewed', 'viewed_at' => now()]);

        return response()->json($invs->map(fn ($v) => [
            'id'         => $v->id,
            'message'    => $v->message,
            'status'     => $v->effectiveStatus(),
            'created_at' => $v->created_at,
            'job'        => [
                'id'     => $v->job_id,
                'title'  => optional($v->job)->title,
                'slug'   => optional($v->job)->slug,
                'status' => optional($v->job)->status,
            ],
            'company'    => [
                'name'     => optional(optional($v->job)->company)->name,
                'logo_url' => optional(optional($v->job)->company)->logo_url,
            ],
        ])->values());
    }

    // POST /candidate/invitations/{id}/decline
    public function decline(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('apply_jobs');

        $inv = CandidateInvitation::where('candidate_id', $user->id)->findOrFail($id);
        if (in_array($inv->status, ['sent', 'viewed'], true)) {
            $inv->update(['status' => 'declined', 'responded_at' => now()]);
        }
        return response()->json(['status' => 'declined']);
    }
}
