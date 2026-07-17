<?php

namespace App\Http\Controllers;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\Application;
use App\Models\Job;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    // POST /api/jobs/{id}/apply — candidate applies to a job
    public function apply(Request $request, $jobId)
    {
        $user = $request->user();
        $this->requirePermission('apply_jobs');

        $job = Job::where('status', 'published')->findOrFail($jobId);

        $data = $request->validate([
            'resume_id'  => 'nullable|exists:resumes,id',
            'cover_note' => 'nullable|string|max:2000',
        ]);

        // Ensure resume belongs to this candidate
        if (! empty($data['resume_id'])) {
            $resume = Resume::where('candidate_id', $user->id)->find($data['resume_id']);
            if (! $resume) {
                return response()->json(['message' => 'Resume not found.'], 422);
            }
        }

        // Auto-attach candidate's primary (or most recent) resume when none supplied by the request
        if (empty($data['resume_id'])) {
            $data['resume_id'] = Resume::where('candidate_id', $user->id)
                ->whereNotNull('file_url')
                ->orderByDesc('is_primary')
                ->orderByDesc('updated_at')
                ->value('id');
        }

        // insertOrIgnore handles the race condition where two simultaneous requests
        // pass the duplicate check before either commits.
        $inserted = DB::table('applications')->insertOrIgnore([
            'job_id'       => $job->id,
            'candidate_id' => $user->id,
            'resume_id'    => $data['resume_id'] ?? null,
            'cover_note'   => $data['cover_note'] ?? null,
            'stage'        => 'applied',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        if (! $inserted) {
            return response()->json(['message' => 'You have already applied to this job.'], 422);
        }

        $application = Application::where('job_id', $job->id)
            ->where('candidate_id', $user->id)
            ->latest()
            ->first();

        // In-app notification to the employer who owns the job
        \App\Models\Notification::record(
            $job->company->user_id ?? null,
            'application_received',
            'New application',
            $user->name . ' applied to “' . $job->title . '”.'
        );

        // Telegram: DM the employer who owns the job, if they've connected their chat.
        // No-op unless Telegram is enabled + the employer linked their account; never affects this response.
        $owner = User::find($job->company->user_id ?? null);
        if ($owner && ! empty($owner->telegram_chat_id)) {
            \App\Services\TelegramService::notifyChat(
                $owner->telegram_chat_id,
                "📨 <b>New application</b>\n"
                . e($user->name) . ' applied to "' . e($job->title) . '".'
            );
        }

        // Notify employer of new application
        try {
            if (MailConfig::isConfigured()) {
                $employer = User::find($job->company->user_id ?? null);
                if ($employer) {
                    MailConfig::applyFromDb();
                    [$subject, $html] = EmailTemplates::newApplicationReceived(
                        $employer->name, $job->title, $user->name
                    );
                    Mail::html($html, fn ($m) => $m->to($employer->email, $employer->name)->subject($subject));
                }
            }
        } catch (\Exception $e) {
            Log::warning('New application email failed: ' . $e->getMessage());
        }

        return response()->json($application->load([
            'job:id,title,company_id',
            'job.company:id,name,logo_url',
        ]), 201);
    }

    // DELETE /api/applications/{id} — candidate withdraws before review
    public function withdraw(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('apply_jobs');

        $application = Application::where('candidate_id', $user->id)->findOrFail($id);

        if ($application->stage !== 'applied') {
            return response()->json(['message' => 'Cannot withdraw — application is already under review.'], 422);
        }

        $application->delete();

        return response()->json(['message' => 'Application withdrawn.']);
    }

    // GET /api/candidate/applications — candidate's own applications
    public function myApplications(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('apply_jobs');

        $q = Application::with([
            'job:id,title,company_id,job_type,salary_min,salary_max,salary_currency,salary_period,status',
            'job.company:id,name,logo_url,user_id',
            // Employer account behind the company — exposes whether candidates may message them.
            'job.company.owner:id,name,allow_candidate_messages',
        ])->where('candidate_id', $user->id);

        if ($request->filled('stage')) {
            $q->where('stage', $request->stage);
        }

        $q->orderBy('created_at', 'desc');

        $perPage = min(50, max(1, (int) $request->input('per_page', 20)));

        return response()->json($q->paginate($perPage));
    }

    // GET /api/employer/jobs/{id}/applications — employer sees applicants for a job
    public function jobApplications(Request $request, $jobId)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        // Confirm job belongs to this employer's company
        $job = Job::whereHas('company', fn ($q) => $q->where('user_id', $user->id))
            ->findOrFail($jobId);

        $q = Application::with([
            'candidate:id,name,email,phone,avatar_url,cv_visibility',
            'resume:id,candidate_id,headline,file_url',
        ])->where('job_id', $job->id);

        if ($request->filled('stage')) {
            $q->where('stage', $request->stage);
        }

        $q->orderBy('created_at', 'desc');

        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        $paginated = $q->paginate($perPage);

        // Hide raw file paths; expose has_cv boolean so employer knows if a CV exists
        $items = array_map(function ($app) {
            $data = $app->toArray();
            if (isset($data['resume'])) {
                $data['resume']['has_cv'] = ! empty($data['resume']['file_url']);
                unset($data['resume']['file_url']);
            }
            return $data;
        }, $paginated->items());

        return response()->json([
            'job'          => $job->only('id', 'title', 'status'),
            'applications' => [
                'data'         => $items,
                'total'        => $paginated->total(),
                'per_page'     => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
            ],
        ]);
    }

    // PATCH /api/applications/{id}/stage — employer moves applicant through pipeline
    public function updateStage(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        $data = $request->validate([
            'stage' => 'required|in:reviewed,shortlisted,interview,offered,rejected',
        ]);

        // Verify employer owns the job this application belongs to
        $application = Application::whereHas('job.company', fn ($q) => $q->where('user_id', $user->id))
            ->findOrFail($id);

        $application->update(['stage' => $data['stage']]);

        $application->load(['candidate:id,name,email', 'job:id,title,company_id', 'job.company:id,name']);

        // In-app notification to the candidate about the stage change
        $STAGE_LABEL = ['reviewed' => 'reviewed', 'shortlisted' => 'shortlisted', 'interview' => 'invited to interview', 'offered' => 'made an offer', 'rejected' => 'not selected'];
        \App\Models\Notification::record(
            $application->candidate_id,
            'application_stage',
            'Application update',
            'Your application for “' . ($application->job->title ?? 'a job') . '” at ' . ($application->job->company->name ?? 'a company') . ' was ' . ($STAGE_LABEL[$data['stage']] ?? $data['stage']) . '.'
        );

        // Notify candidate of stage change
        try {
            if (MailConfig::isConfigured()) {
                $candidate = $application->candidate;
                if ($candidate) {
                    MailConfig::applyFromDb();
                    [$subject, $html] = EmailTemplates::applicationStageChanged(
                        $candidate->name,
                        $application->job->title,
                        $application->job->company->name ?? '',
                        $data['stage']
                    );
                    Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
                }
            }
        } catch (\Exception $e) {
            Log::warning('Stage change email failed: ' . $e->getMessage());
        }

        return response()->json([
            'id'    => $application->id,
            'stage' => $application->stage,
        ]);
    }

    // GET /api/jobs/{id}/applied — candidate checks if they've applied (boolean)
    public function checkApplied(Request $request, $jobId)
    {
        $user = $request->user();

        $application = Application::where('job_id', $jobId)
            ->where('candidate_id', $user->id)
            ->first();

        return response()->json([
            'applied' => (bool) $application,
            'stage'   => $application ? $application->stage : null,
        ]);
    }

    // ---- Saved jobs -------------------------------------------------------

    // POST /api/jobs/{id}/save
    public function save(Request $request, $jobId)
    {
        $user = $request->user();
        $this->requirePermission('save_jobs');

        Job::where('status', 'published')->findOrFail($jobId);

        $inserted = DB::table('saved_jobs')->insertOrIgnore([
            'candidate_id' => $user->id,
            'job_id'       => $jobId,
            'created_at'   => now(),
        ]);

        if (! $inserted) {
            return response()->json(['message' => 'Already saved.'], 422);
        }

        return response()->json(['message' => 'Job saved.'], 201);
    }

    // DELETE /api/jobs/{id}/save
    public function unsave(Request $request, $jobId)
    {
        $user = $request->user();
        $this->requirePermission('save_jobs');

        DB::table('saved_jobs')
            ->where('candidate_id', $user->id)
            ->where('job_id', $jobId)
            ->delete();

        return response()->json(['message' => 'Job removed from saved.']);
    }

    // GET /api/candidate/saved-jobs
    public function savedJobs(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('save_jobs');

        $perPage = min(50, max(1, (int) $request->input('per_page', 20)));

        $jobs = Job::with(['company:id,name,logo_url', 'category:id,name', 'location:id,name'])
            ->whereIn('id', function ($q) use ($user) {
                $q->select('job_id')->from('saved_jobs')->where('candidate_id', $user->id);
            })
            ->where('status', 'published')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($jobs);
    }

    // GET /api/applications/{id}/cv — employer downloads candidate CV for a specific application
    public function downloadCv(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        // Verify employer owns the job this application belongs to
        $application = Application::with(['resume', 'candidate'])
            ->whereHas('job.company', fn ($q) => $q->where('user_id', $user->id))
            ->findOrFail($id);

        // Respect candidate's CV visibility preference
        $candidate = $application->candidate;
        $visibility = $candidate ? ($candidate->cv_visibility ?? 'employers') : 'employers';
        if ($visibility === 'private') {
            abort(403, 'This candidate has set their CV to private.');
        }

        $resume = $application->resume;

        if (! $resume || ! $resume->file_url) {
            abort(404, 'No CV file attached to this application.');
        }

        // Legacy files stored as public URLs
        if (str_starts_with($resume->file_url, 'http')) {
            return redirect($resume->file_url);
        }

        $disk = Storage::disk('local');
        if (! $disk->exists($resume->file_url)) {
            abort(404, 'CV file not found.');
        }

        $ext      = pathinfo($resume->file_url, PATHINFO_EXTENSION);
        $filename = ($application->candidate->name ?? 'Candidate') . ($ext ? '.' . $ext : '');
        return response()->streamDownload(function () use ($disk, $resume) {
            echo $disk->get($resume->file_url);
        }, $filename, ['Content-Type' => $disk->mimeType($resume->file_url)]);
    }

}
