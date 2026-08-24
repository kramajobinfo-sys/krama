<?php

namespace App\Http\Controllers;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\Application;
use App\Models\Company;
use App\Models\Interview;
use App\Models\InterviewScorecard;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

// Employer interview scheduling + private scorecards, tied to an application. Every query is
// scoped to the acting employer's company so no company can read or touch another's interviews.
class EmployerInterviewController extends Controller
{
    private function employerCompanyId($user): ?int
    {
        $owned = Company::where('user_id', $user->id)->value('id');
        return $owned ?: $user->company_id;
    }

    private function findApp($user, $appId): Application
    {
        return Application::with('job:id,company_id,title', 'candidate:id,name,email')
            ->whereHas('job', fn ($q) => $q->where('company_id', $this->employerCompanyId($user)))
            ->findOrFail($appId);
    }

    private function findInterview($user, $id): Interview
    {
        return Interview::where('company_id', $this->employerCompanyId($user))->findOrFail($id);
    }

    private function serialize(Interview $iv, $userId): array
    {
        return [
            'id'             => $iv->id,
            'application_id' => $iv->application_id,
            'type'           => $iv->type,
            'scheduled_at'   => $iv->scheduled_at,
            'duration_min'   => $iv->duration_min,
            'timezone'       => $iv->timezone,
            'location'       => $iv->location,
            'meeting_url'    => $iv->meeting_url,
            'notes'          => $iv->notes,
            'status'         => $iv->status,
            'interviewer_id' => $iv->interviewer_id,
            'interviewer'    => optional($iv->interviewer)->name,
            'scorecards'     => $iv->scorecards->map(fn ($s) => [
                'id'             => $s->id,
                'author'         => optional($s->author)->name,
                'author_id'      => $s->author_id,
                'ratings'        => $s->ratings,
                'recommendation' => $s->recommendation,
                'comment'        => $s->comment,
                'can_edit'       => $s->author_id === $userId,
                'updated_at'     => $s->updated_at,
            ])->values(),
        ];
    }

    // GET /employer/applications/{id}/interviews
    public function index(Request $request, $appId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $app = $this->findApp($user, $appId);

        $ivs = Interview::with(['interviewer:id,name', 'scorecards.author:id,name'])
            ->where('application_id', $app->id)->orderBy('scheduled_at')->get();

        return response()->json($ivs->map(fn ($iv) => $this->serialize($iv, $user->id))->values());
    }

    // POST /employer/applications/{id}/interviews — schedule
    public function store(Request $request, $appId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $this->requireCompanyCapability('manage_applicants');
        $app = $this->findApp($user, $appId);

        $data = $this->validateInterview($request, true);

        $iv = Interview::create(array_merge($data, [
            'application_id' => $app->id,
            'company_id'     => $app->job->company_id,
            'scheduled_by'   => $user->id,
            'status'         => 'scheduled',
        ]));

        $this->notifyCandidate($app, $iv);

        $iv->load(['interviewer:id,name', 'scorecards']);
        return response()->json($this->serialize($iv, $user->id), 201);
    }

    // PATCH /employer/interviews/{id} — reschedule / edit / change status
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $this->requireCompanyCapability('manage_applicants');
        $iv = $this->findInterview($user, $id);

        $data = $this->validateInterview($request, false);
        $iv->fill($data)->save();

        $iv->load(['interviewer:id,name', 'scorecards.author:id,name']);
        return response()->json($this->serialize($iv, $user->id));
    }

    // DELETE /employer/interviews/{id}
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $this->requireCompanyCapability('manage_applicants');
        $this->findInterview($user, $id)->delete();
        return response()->json(['message' => 'Interview removed.']);
    }

    // PUT /employer/interviews/{id}/scorecard — upsert the current user's private scorecard
    public function upsertScorecard(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $this->requireCompanyCapability('manage_applicants');
        $iv = $this->findInterview($user, $id);

        $data = $request->validate([
            'ratings'        => 'nullable|array',
            'ratings.*'      => 'nullable|integer|min:1|max:5',
            'recommendation' => 'nullable|in:strong_hire,hire,maybe,no_hire',
            'comment'        => 'nullable|string|max:5000',
        ]);

        $card = InterviewScorecard::updateOrCreate(
            ['interview_id' => $iv->id, 'author_id' => $user->id],
            [
                'company_id'     => $iv->company_id,
                'ratings'        => $data['ratings'] ?? null,
                'recommendation' => $data['recommendation'] ?? null,
                'comment'        => $data['comment'] ?? null,
            ]
        );

        return response()->json([
            'id'             => $card->id,
            'author'         => $user->name,
            'author_id'      => $user->id,
            'ratings'        => $card->ratings,
            'recommendation' => $card->recommendation,
            'comment'        => $card->comment,
            'can_edit'       => true,
            'updated_at'     => $card->updated_at,
        ]);
    }

    // GET /employer/interviews/upcoming — next scheduled interviews across the company (dashboard)
    public function upcoming(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        $ivs = Interview::with(['interviewer:id,name', 'application.candidate:id,name', 'application.job:id,title'])
            ->where('company_id', $this->employerCompanyId($user))
            ->whereIn('status', ['scheduled', 'confirmed', 'rescheduled'])
            ->where('scheduled_at', '>=', now()->subHours(2))
            ->orderBy('scheduled_at')
            ->limit(min(50, max(1, (int) $request->input('limit', 10))))
            ->get();

        return response()->json($ivs->map(fn ($iv) => [
            'id'            => $iv->id,
            'type'          => $iv->type,
            'scheduled_at'  => $iv->scheduled_at,
            'duration_min'  => $iv->duration_min,
            'status'        => $iv->status,
            'meeting_url'   => $iv->meeting_url,
            'location'      => $iv->location,
            'interviewer'   => optional($iv->interviewer)->name,
            'candidate'     => optional(optional($iv->application)->candidate)->name,
            'job'           => optional(optional($iv->application)->job)->title,
            'application_id'=> $iv->application_id,
        ])->values());
    }

    private function validateInterview(Request $request, bool $creating): array
    {
        $req = $creating ? 'required' : 'sometimes';
        $rules = [
            'type'           => $req . '|in:phone,video,in_person',
            'scheduled_at'   => $req . '|date',
            'duration_min'   => 'nullable|integer|min:5|max:600',
            'timezone'       => 'nullable|string|max:64',
            'location'       => 'nullable|string|max:300',
            'meeting_url'    => 'nullable|string|max:500',
            'notes'          => 'nullable|string|max:2000',
            'interviewer_id' => 'nullable|exists:users,id',
            // Must be validated here, not merged in raw: `status` is fillable and the column is a
            // MySQL enum under strict mode, so an unknown value is a 500 rather than a clean 422.
            'status'         => 'sometimes|in:scheduled,confirmed,rescheduled,completed,cancelled,no_show',
        ];
        return $request->validate($rules);
    }

    private function notifyCandidate(Application $app, Interview $iv): void
    {
        $candidate = $app->candidate;
        if (! $candidate) {
            return;
        }
        $when  = $iv->scheduled_at ? $iv->scheduled_at->format('D, j M Y H:i') : 'soon';
        $title = $app->job->title ?? 'a role';

        Notification::record(
            $candidate->id,
            'interview_scheduled',
            'Interview scheduled',
            'You have an interview for “' . $title . '” on ' . $when . ($iv->timezone ? ' (' . $iv->timezone . ')' : '') . '.'
        );

        try {
            if (MailConfig::isConfigured() && method_exists(EmailTemplates::class, 'interviewScheduled')) {
                MailConfig::applyFromDb();
                [$subject, $html] = EmailTemplates::interviewScheduled($candidate->name, $title, $iv);
                Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
            }
        } catch (\Throwable $e) {
            Log::warning('Interview scheduled email failed: ' . $e->getMessage());
        }
    }
}
