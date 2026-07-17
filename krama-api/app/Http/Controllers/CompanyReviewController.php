<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CompanyReviewController extends Controller
{
    // GET /api/companies/{id}/reviews — public, approved only
    public function index($id, Request $request)
    {
        Company::findOrFail($id);

        $reviews = CompanyReview::with('candidate:id,name,avatar_url')
            ->where('company_id', $id)
            ->where('status', 'approved')
            ->latest()
            ->paginate(10);

        $stats = CompanyReview::where('company_id', $id)
            ->where('status', 'approved')
            ->selectRaw('COUNT(*) as count, ROUND(AVG(rating), 1) as avg, SUM(rating=5) as r5, SUM(rating=4) as r4, SUM(rating=3) as r3, SUM(rating=2) as r2, SUM(rating=1) as r1')
            ->first();

        $items = $reviews->getCollection()->map(function ($r) {
            return [
                'id'           => $r->id,
                'rating'       => $r->rating,
                'title'        => $r->title,
                'body'         => $r->body,
                'is_anonymous' => $r->is_anonymous,
                'author'       => $r->is_anonymous ? null : ['name' => $r->candidate->name ?? 'Candidate', 'avatar_url' => $r->candidate->avatar_url ?? null],
                'created_at'   => $r->created_at,
            ];
        });

        return response()->json([
            'data'        => $items,
            'total'       => $reviews->total(),
            'last_page'   => $reviews->lastPage(),
            'current_page'=> $reviews->currentPage(),
            'stats'       => [
                'count'   => (int) ($stats->count ?? 0),
                'avg'     => $stats->avg ? (float) $stats->avg : null,
                'r5'      => (int) ($stats->r5 ?? 0),
                'r4'      => (int) ($stats->r4 ?? 0),
                'r3'      => (int) ($stats->r3 ?? 0),
                'r2'      => (int) ($stats->r2 ?? 0),
                'r1'      => (int) ($stats->r1 ?? 0),
            ],
        ]);
    }

    // POST /api/companies/{id}/reviews — candidate submits
    public function store($id, Request $request)
    {
        $this->requirePermission('save_jobs');
        $user = Auth::user();

        Company::findOrFail($id);

        if (CompanyReview::where('company_id', $id)->where('candidate_id', $user->id)->exists()) {
            return response()->json(['message' => 'You have already submitted a review for this company.'], 422);
        }

        $data = $request->validate([
            'rating'       => 'required|integer|min:1|max:5',
            'title'        => 'nullable|string|max:100',
            'body'         => 'required|string|min:20|max:3000',
            'is_anonymous' => 'nullable|boolean',
        ]);

        CompanyReview::create(array_merge($data, [
            'company_id'   => $id,
            'candidate_id' => $user->id,
            'status'       => 'pending',
        ]));

        return response()->json(['message' => 'Review submitted. It will appear after moderation.'], 201);
    }

    // DELETE /api/candidate/reviews/{id}
    public function destroy($id)
    {
        $this->requirePermission('save_jobs');
        $user = Auth::user();

        $review = CompanyReview::where('candidate_id', $user->id)->findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted.']);
    }

    // GET /api/admin/reviews
    public function adminIndex(Request $request)
    {
        $this->requirePermission('site_settings');

        $status = $request->query('status', 'pending');
        $page   = (int) $request->query('page', 1);

        $q = CompanyReview::with(['company:id,name', 'candidate:id,name,email'])
            ->latest();

        if ($status !== 'all') {
            $q->where('status', $status);
        }

        $reviews = $q->paginate(15, ['*'], 'page', $page);

        return response()->json([
            'data'       => $reviews->getCollection()->map(function ($r) {
                return [
                    'id'           => $r->id,
                    'company'      => ['id' => $r->company->id, 'name' => $r->company->name],
                    'candidate'    => ['id' => $r->candidate->id, 'name' => $r->candidate->name, 'email' => $r->candidate->email],
                    'rating'       => $r->rating,
                    'title'        => $r->title,
                    'body'         => $r->body,
                    'is_anonymous' => $r->is_anonymous,
                    'status'       => $r->status,
                    'created_at'   => $r->created_at,
                ];
            }),
            'total'      => $reviews->total(),
            'last_page'  => $reviews->lastPage(),
            'current_page' => $reviews->currentPage(),
        ]);
    }

    // PATCH /api/admin/reviews/{id}/approve
    public function approve($id)
    {
        $this->requirePermission('site_settings');
        $review = CompanyReview::findOrFail($id);
        $review->update(['status' => 'approved']);
        return response()->json(['message' => 'Review approved.', 'status' => 'approved']);
    }

    // PATCH /api/admin/reviews/{id}/reject
    public function reject($id)
    {
        $this->requirePermission('site_settings');
        $review = CompanyReview::findOrFail($id);
        $review->update(['status' => 'rejected']);
        return response()->json(['message' => 'Review rejected.', 'status' => 'rejected']);
    }
}
