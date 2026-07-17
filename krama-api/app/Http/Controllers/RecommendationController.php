<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecommendationController extends Controller
{
    // GET /api/candidate/recommended
    // Returns published jobs scored by how well they match the candidate's profile.
    // Scoring: +3 for category match, +2 for experience level match, +1 for job_type match.
    // Excludes jobs the candidate already applied to.
    // Falls back to newest published jobs when the candidate has no history.
    public function recommended(Request $request)
    {
        $user    = $request->user();
        $perPage = min(20, max(1, (int) $request->input('per_page', 12)));
        $search  = trim($request->input('search', ''));

        // ── Gather candidate signals ─────────────────────────────────────────
        $appliedJobIds = DB::table('applications')
            ->where('candidate_id', $user->id)
            ->pluck('job_id');

        $savedJobIds = DB::table('saved_jobs')
            ->where('candidate_id', $user->id)
            ->pluck('job_id');

        $signalJobIds = $appliedJobIds->merge($savedJobIds)->unique()->values();

        // Base query — published, not already applied
        $base = Job::with(['company:id,name,logo_url', 'category:id,name,slug'])
            ->where('status', 'published')
            ->whereNotIn('id', $appliedJobIds);

        if ($search !== '') {
            $like = '%' . $search . '%';
            $base->where(function ($q) use ($like) {
                $q->where('title', 'like', $like)
                  ->orWhereHas('company', fn($c) => $c->where('name', 'like', $like));
            });
        }

        // ── No history → newest jobs ─────────────────────────────────────────
        if ($signalJobIds->isEmpty()) {
            return response()->json(
                $base->orderBy('published_at', 'desc')
                     ->paginate($perPage)
            );
        }

        // ── Build signal profile ─────────────────────────────────────────────
        $signalJobs = DB::table('jobs')
            ->whereIn('id', $signalJobIds)
            ->get(['category_id', 'experience_level', 'job_type']);

        // Top categories by frequency (up to 5)
        $topCategories = $signalJobs
            ->pluck('category_id')->filter()
            ->countBy()->sortDesc()->keys()->take(5)->toArray();

        // Top experience levels (up to 3)
        $topLevels = $signalJobs
            ->pluck('experience_level')->filter()
            ->countBy()->sortDesc()->keys()->take(3)->values()->toArray();

        // Top job types (up to 2)
        $topTypes = $signalJobs
            ->pluck('job_type')->filter()
            ->countBy()->sortDesc()->keys()->take(2)->values()->toArray();

        // ── Score expression (all dynamic values via PDO bindings) ──────────
        $catScore   = count($topCategories) > 0
            ? 'CASE WHEN jobs.category_id IN (' . implode(',', array_fill(0, count($topCategories), '?')) . ') THEN 3 ELSE 0 END'
            : '0';

        $levelScore = count($topLevels) > 0
            ? 'CASE WHEN jobs.experience_level IN (' . implode(',', array_fill(0, count($topLevels), '?')) . ') THEN 2 ELSE 0 END'
            : '0';

        $typeScore  = count($topTypes) > 0
            ? 'CASE WHEN jobs.job_type IN (' . implode(',', array_fill(0, count($topTypes), '?')) . ') THEN 1 ELSE 0 END'
            : '0';

        $scoreExpr  = "($catScore + $levelScore + $typeScore)";
        $bindings   = array_merge($topCategories, $topLevels, $topTypes);

        $jobs = $base->orderByRaw("$scoreExpr DESC", $bindings)
                     ->orderBy('published_at', 'desc')
                     ->paginate($perPage);

        // Attach match_reason to each item so the UI can display it
        $matchedCategories = array_map('intval', $topCategories);
        $matchedLevels     = $topLevels;

        $jobs->getCollection()->transform(function (Job $job) use ($matchedCategories, $matchedLevels) {
            $reasons = [];
            if (in_array((int) $job->category_id, $matchedCategories)) {
                $reasons[] = 'category';
            }
            if (in_array($job->experience_level, $matchedLevels)) {
                $reasons[] = 'level';
            }
            $job->match_reasons = $reasons;
            return $job;
        });

        return response()->json($jobs);
    }
}
