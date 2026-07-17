<?php

namespace App\Http\Controllers;

use App\Models\JobAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobAlertController extends Controller
{
    // GET /api/candidate/alerts
    public function index()
    {
        $this->requirePermission('save_jobs');
        $user = Auth::user();

        $alerts = JobAlert::with(['category:id,name', 'location:id,name'])
            ->where('candidate_id', $user->id)
            ->latest('created_at')
            ->get()
            ->map(function ($a) {
                return [
                    'id'          => $a->id,
                    'keyword'     => $a->keyword,
                    'category'    => $a->category ? ['id' => $a->category->id, 'name' => $a->category->name] : null,
                    'location'    => $a->location ? ['id' => $a->location->id, 'name' => $a->location->name] : null,
                    'job_type'    => $a->job_type,
                    'is_remote'   => $a->is_remote,
                    'created_at'  => $a->created_at,
                ];
            });

        return response()->json(['data' => $alerts]);
    }

    // POST /api/candidate/alerts
    public function store(Request $request)
    {
        $this->requirePermission('save_jobs');
        $user = Auth::user();

        if (JobAlert::where('candidate_id', $user->id)->count() >= 10) {
            return response()->json(['message' => 'You can have at most 10 active job alerts.'], 422);
        }

        $data = $request->validate([
            'keyword'     => 'nullable|string|max:150',
            'category_id' => 'nullable|integer|exists:categories,id',
            'location_id' => 'nullable|integer|exists:locations,id',
            'job_type'    => 'nullable|in:full_time,part_time,contract,internship',
            'is_remote'   => 'nullable|boolean',
        ]);

        // Require at least one filter
        $hasFilter = collect($data)->filter(fn($v) => $v !== null && $v !== '')->isNotEmpty();
        if (!$hasFilter) {
            return response()->json(['message' => 'Please set at least one filter for the alert.'], 422);
        }

        $alert = JobAlert::create(array_merge($data, ['candidate_id' => $user->id]));
        $alert->load(['category:id,name', 'location:id,name']);

        return response()->json([
            'message' => 'Alert created.',
            'data' => [
                'id'         => $alert->id,
                'keyword'    => $alert->keyword,
                'category'   => $alert->category ? ['id' => $alert->category->id, 'name' => $alert->category->name] : null,
                'location'   => $alert->location ? ['id' => $alert->location->id, 'name' => $alert->location->name] : null,
                'job_type'   => $alert->job_type,
                'is_remote'  => $alert->is_remote,
                'created_at' => $alert->created_at,
            ],
        ], 201);
    }

    // DELETE /api/candidate/alerts/{id}
    public function destroy($id)
    {
        $this->requirePermission('save_jobs');
        $user = Auth::user();

        $alert = JobAlert::where('candidate_id', $user->id)->findOrFail($id);
        $alert->delete();

        return response()->json(['message' => 'Alert deleted.']);
    }

}
