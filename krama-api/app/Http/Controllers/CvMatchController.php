<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Services\CvMatchService;
use Illuminate\Http\Request;

class CvMatchController extends Controller
{
    // POST /api/admin/cv-match/compare — score a reference résumé against chosen résumés.
    public function compare(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'reference_id' => 'required|integer|exists:resumes,id',
            'target_ids'   => 'required|array|min:1|max:20',
            'target_ids.*' => 'integer|exists:resumes,id',
        ]);

        $ref = Resume::with('candidate:id,name,avatar_url')->findOrFail($data['reference_id']);

        $targets = Resume::with('candidate:id,name,avatar_url')
            ->whereIn('id', $data['target_ids'])
            ->where('id', '!=', $ref->id)
            ->get();

        $results = $targets->map(fn ($t) => $this->row($ref, $t))
            ->sortByDesc('score')->values();

        return response()->json(['reference' => $this->refInfo($ref), 'results' => $results]);
    }

    // POST /api/admin/cv-match/suggest — auto-rank the best-matching résumés from the pool.
    public function suggest(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'reference_id' => 'required|integer|exists:resumes,id',
            'limit'        => 'nullable|integer|min:1|max:20',
        ]);

        $limit = (int) ($data['limit'] ?? 3);
        $ref   = Resume::with('candidate:id,name,avatar_url')->findOrFail($data['reference_id']);

        // Cap the scored pool for performance on large candidate bases.
        $pool = Resume::with('candidate:id,name,avatar_url')
            ->where('id', '!=', $ref->id)
            ->limit(500)->get();

        $results = $pool->map(fn ($t) => $this->row($ref, $t))
            ->sortByDesc('score')->take($limit)->values();

        return response()->json(['reference' => $this->refInfo($ref), 'results' => $results]);
    }

    private function row(Resume $ref, Resume $t): array
    {
        $m = CvMatchService::score($ref, $t);

        return [
            'resume_id' => $t->id,
            'candidate' => [
                'id'         => $t->candidate->id ?? null,
                'name'       => $t->candidate->name ?? 'Candidate',
                'avatar_url' => $t->candidate->avatar_url ?? null,
            ],
            'headline'  => $t->headline,
            'score'     => $m['score'],
            'breakdown' => $m['breakdown'],
        ];
    }

    private function refInfo(Resume $r): array
    {
        return [
            'resume_id' => $r->id,
            'name'      => $r->candidate->name ?? 'Candidate',
            'headline'  => $r->headline,
        ];
    }
}
