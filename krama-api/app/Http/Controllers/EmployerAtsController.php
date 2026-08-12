<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\ApplicationNote;
use App\Models\ApplicationTag;
use App\Models\Company;
use App\Models\Job;
use Illuminate\Http\Request;

// Employer ATS workspace: the applicant pipeline board plus private notes and candidate tags.
// Every query is scoped to the acting employer's company (owner OR member via users.company_id)
// so one company can never read or mutate another company's applicants, notes, or tags.
class EmployerAtsController extends Controller
{
    private const STAGES = ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired', 'rejected'];
    private const COLUMN_CAP = 100; // max cards returned per stage column (bounded payload)

    // The company this user acts for: the one they own, else the one they're a member of.
    private function employerCompanyId($user): ?int
    {
        $owned = Company::where('user_id', $user->id)->value('id');
        return $owned ?: $user->company_id;
    }

    // Resolve an application that belongs to the acting employer's company, or 404.
    private function findApp($user, $appId): Application
    {
        return Application::with('job:id,company_id,title')
            ->whereHas('job', fn ($q) => $q->where('company_id', $this->employerCompanyId($user)))
            ->findOrFail($appId);
    }

    // GET /employer/jobs/{id}/board — applicants grouped by pipeline stage (capped per column).
    public function board(Request $request, $jobId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        $companyId = $this->employerCompanyId($user);
        $job = Job::where('company_id', $companyId)->findOrFail($jobId);

        $counts = Application::where('job_id', $job->id)
            ->selectRaw('stage, COUNT(*) as c')->groupBy('stage')->pluck('c', 'stage');

        $board = [];
        foreach (self::STAGES as $stage) {
            $apps = Application::with([
                'candidate:id,name,avatar_url,cv_visibility',
                'resume:id,candidate_id,headline,file_url',
                'tags:id,application_id,label',
            ])->withCount('notes')
                ->where('job_id', $job->id)->where('stage', $stage)
                ->orderByDesc('updated_at')->limit(self::COLUMN_CAP)->get();

            $board[$stage] = [
                'count' => (int) ($counts[$stage] ?? 0),
                'items' => $apps->map(function ($app) {
                    $visibility = optional($app->candidate)->cv_visibility ?? 'employers';
                    return [
                        'id'          => $app->id,
                        'stage'       => $app->stage,
                        'created_at'  => $app->created_at,
                        'updated_at'  => $app->updated_at,
                        'candidate'   => $app->candidate ? [
                            'id'         => $app->candidate->id,
                            'name'       => $app->candidate->name,
                            'avatar_url' => $app->candidate->avatar_url,
                        ] : null,
                        'headline'    => optional($app->resume)->headline,
                        'has_cv'      => $app->resume && ! empty($app->resume->file_url) && $visibility !== 'private',
                        'tags'        => $app->tags->map(fn ($t) => ['id' => $t->id, 'label' => $t->label])->values(),
                        'notes_count' => $app->notes_count,
                    ];
                })->values(),
            ];
        }

        return response()->json([
            'job'    => $job->only('id', 'title', 'status'),
            'stages' => self::STAGES,
            'board'  => $board,
        ]);
    }

    // ── Private notes ──────────────────────────────────────────────────────────

    // GET /employer/applications/{id}/notes
    public function notesIndex(Request $request, $appId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $app = $this->findApp($user, $appId);

        $notes = $app->notes()->with('author:id,name')->get()->map(fn ($n) => [
            'id'         => $n->id,
            'body'       => $n->body,
            'author'     => optional($n->author)->name,
            'author_id'  => $n->author_id,
            'can_edit'   => $n->author_id === $user->id,
            'created_at' => $n->created_at,
            'updated_at' => $n->updated_at,
        ]);

        return response()->json($notes);
    }

    // POST /employer/applications/{id}/notes
    public function noteStore(Request $request, $appId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $app = $this->findApp($user, $appId);

        $data = $request->validate(['body' => 'required|string|max:5000']);

        $note = ApplicationNote::create([
            'application_id' => $app->id,
            'company_id'     => $app->job->company_id,
            'author_id'      => $user->id,
            'body'           => trim($data['body']),
        ]);

        return response()->json([
            'id'         => $note->id,
            'body'       => $note->body,
            'author'     => $user->name,
            'author_id'  => $user->id,
            'can_edit'   => true,
            'created_at' => $note->created_at,
            'updated_at' => $note->updated_at,
        ], 201);
    }

    // PATCH /employer/notes/{id} — author-only edit
    public function noteUpdate(Request $request, $noteId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        $note = ApplicationNote::where('company_id', $this->employerCompanyId($user))->findOrFail($noteId);
        if ($note->author_id !== $user->id) {
            abort(403, 'Only the note author can edit it.');
        }

        $data = $request->validate(['body' => 'required|string|max:5000']);
        $note->update(['body' => trim($data['body'])]);

        return response()->json(['id' => $note->id, 'body' => $note->body, 'updated_at' => $note->updated_at]);
    }

    // DELETE /employer/notes/{id} — author OR company owner
    public function noteDestroy(Request $request, $noteId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        $note = ApplicationNote::where('company_id', $this->employerCompanyId($user))->findOrFail($noteId);
        $isOwner = Company::where('id', $note->company_id)->where('user_id', $user->id)->exists();
        if ($note->author_id !== $user->id && ! $isOwner) {
            abort(403, 'You can only delete your own notes.');
        }

        $note->delete();
        return response()->json(['message' => 'Note deleted.']);
    }

    // ── Candidate tags ─────────────────────────────────────────────────────────

    // POST /employer/applications/{id}/tags
    public function tagStore(Request $request, $appId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $app = $this->findApp($user, $appId);

        $data  = $request->validate(['label' => 'required|string|max:40']);
        $label = trim($data['label']);
        if ($label === '') {
            return response()->json(['message' => 'Tag cannot be empty.'], 422);
        }

        $tag = ApplicationTag::firstOrCreate(
            ['application_id' => $app->id, 'label' => $label],
            ['company_id' => $app->job->company_id]
        );

        return response()->json(['id' => $tag->id, 'label' => $tag->label], 201);
    }

    // DELETE /employer/applications/{id}/tags/{tagId}
    public function tagDestroy(Request $request, $appId, $tagId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $app = $this->findApp($user, $appId);

        ApplicationTag::where('application_id', $app->id)->where('id', $tagId)->delete();
        return response()->json(['message' => 'Tag removed.']);
    }

    // GET /employer/tags — the company's DISTINCT tag labels (for autocomplete)
    public function tags(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        $labels = ApplicationTag::where('company_id', $this->employerCompanyId($user))
            ->select('label')->distinct()->orderBy('label')->pluck('label');

        return response()->json($labels);
    }
}
