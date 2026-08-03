<?php

namespace App\Jobs;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\Job;
use App\Models\JobAlert;
use App\Services\SocialPostService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Post-publish fan-out for a newly published job: share to social, then email every
 * matching job-alert subscriber and every company follower.
 *
 * This runs on the QUEUE (processed by the scheduled `queue:work`) instead of inline in
 * the request. Previously it ran in an app()->terminating() callback — which, while it
 * fired after the response, still held the web worker for the full duration of hundreds
 * of blocking SMTP sends + external social/HTTP calls, so a few concurrent publishes
 * could starve the worker pool. Dispatching to the queue makes the publish request return
 * immediately (it just inserts one queue row) and moves the heavy work to the background.
 */
class NotifyJobPublished implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 300;

    public function __construct(public int $jobId)
    {
    }

    public function handle(): void
    {
        $job = Job::with(['company:id,name', 'location:id,name', 'category:id,name'])->find($this->jobId);
        if (! $job) {
            return;
        }

        // Social first so the job posts promptly even if email delivery is slow.
        try {
            SocialPostService::shareJob($job);
        } catch (\Throwable $e) {
            Log::warning('Social post failed for job ' . $job->id . ': ' . $e->getMessage());
        }

        try {
            $this->sendJobAlertEmails($job);
        } catch (\Throwable $e) {
            Log::warning('Job alert emails failed for job ' . $job->id . ': ' . $e->getMessage());
        }

        try {
            $this->sendFollowerEmails($job);
        } catch (\Throwable $e) {
            Log::warning('Follower emails failed for job ' . $job->id . ': ' . $e->getMessage());
        }
    }

    private function sendFollowerEmails(Job $job): void
    {
        if (! MailConfig::isConfigured()) return;

        $job->loadMissing(['company:id,name', 'location:id,name']);

        $followers = DB::table('company_followers')
            ->join('users', 'users.id', '=', 'company_followers.candidate_id')
            ->where('company_followers.company_id', $job->company_id)
            ->select('users.id', 'users.name', 'users.email')
            ->get();

        if ($followers->isEmpty()) return;

        MailConfig::applyFromDb();

        // Canonical slug URL — /jobs/{id} 404s for crawlers and the SPA resolves by slug,
        // so the id form produced a dead "View job" link in these emails.
        $jobUrl       = SocialPostService::jobUrl($job);
        $locationName = $job->location->name ?? '';
        $jobType      = $job->job_type ?? 'full_time';
        $companyName  = $job->company->name ?? '';

        foreach ($followers as $candidate) {
            if (! $candidate->email) continue;
            try {
                [$subject, $html] = EmailTemplates::newJobFromFollowedCompany(
                    $candidate->name,
                    $companyName,
                    $job->title,
                    $locationName,
                    $jobType,
                    $jobUrl
                );
                Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
            } catch (\Exception $e) {
                Log::warning("Follower email failed for candidate {$candidate->id}: " . $e->getMessage());
            }
        }
    }

    private function sendJobAlertEmails(Job $job): void
    {
        if (! MailConfig::isConfigured()) return;

        $job->loadMissing(['category:id,name', 'location:id,name', 'company:id,name']);

        $alerts = JobAlert::with('candidate:id,name,email')
            ->where(function ($q) use ($job) {
                $q->whereNull('category_id')->orWhere('category_id', $job->category_id);
            })
            ->where(function ($q) use ($job) {
                $q->whereNull('location_id')->orWhere('location_id', $job->location_id);
            })
            ->where(function ($q) use ($job) {
                $q->whereNull('job_type')->orWhere('job_type', $job->job_type);
            })
            ->where(function ($q) use ($job) {
                $q->whereNull('is_remote')->orWhere('is_remote', $job->is_remote);
            })
            ->where(function ($q) use ($job) {
                $q->whereNull('keyword')
                  ->orWhereRaw('LOWER(?) LIKE CONCAT(\'%\', LOWER(keyword), \'%\')', [$job->title]);
            })
            ->get();

        if ($alerts->isEmpty()) return;

        MailConfig::applyFromDb();

        // Canonical slug URL — see the note in the follower-email path above.
        $jobUrl = SocialPostService::jobUrl($job);
        $locationName = $job->location->name ?? '';
        $jobType = $job->job_type ?? 'full_time';
        $companyName = $job->company->name ?? '';

        // Deduplicate by candidate so a candidate with multiple matching alerts gets one email.
        $seen = [];
        foreach ($alerts as $alert) {
            $candidate = $alert->candidate;
            if (! $candidate || ! $candidate->email || isset($seen[$candidate->id])) continue;
            $seen[$candidate->id] = true;

            try {
                [$subject, $html] = EmailTemplates::jobAlertMatch(
                    $candidate->name,
                    $job->title,
                    $companyName,
                    $locationName,
                    $jobType,
                    $jobUrl
                );
                Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
            } catch (\Exception $e) {
                Log::warning("Job alert email failed for candidate {$candidate->id}: " . $e->getMessage());
            }
        }
    }
}
