<?php

namespace App\Jobs;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\Job;
use App\Models\JobAlert;
use App\Services\SocialPostService;
use App\Services\TelegramService;
use App\Services\WebPushService;
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

        // Track everyone already notified so the AI-match pass never double-pings a
        // candidate who also matched a saved-search alert or follows the company.
        $notified = [];

        try {
            foreach ($this->sendJobAlertEmails($job) as $id) $notified[$id] = true;
        } catch (\Throwable $e) {
            Log::warning('Job alert emails failed for job ' . $job->id . ': ' . $e->getMessage());
        }

        try {
            foreach ($this->sendFollowerEmails($job) as $id) $notified[$id] = true;
        } catch (\Throwable $e) {
            Log::warning('Follower emails failed for job ' . $job->id . ': ' . $e->getMessage());
        }

        try {
            $this->sendAiMatchAlerts($job, $notified);
        } catch (\Throwable $e) {
            Log::warning('AI-match alerts failed for job ' . $job->id . ': ' . $e->getMessage());
        }
    }

    /** @return int[] candidate ids notified */
    private function sendFollowerEmails(Job $job): array
    {
        $job->loadMissing(['company:id,name', 'location:id,name']);

        $followers = DB::table('company_followers')
            ->join('users', 'users.id', '=', 'company_followers.candidate_id')
            ->where('company_followers.company_id', $job->company_id)
            ->select('users.id', 'users.name', 'users.email', 'users.telegram_chat_id')
            ->get();

        if ($followers->isEmpty()) return [];

        $mailOk = MailConfig::isConfigured();
        if ($mailOk) MailConfig::applyFromDb();

        // Canonical slug URL — /jobs/{id} 404s for crawlers and the SPA resolves by slug,
        // so the id form produced a dead "View job" link in these emails.
        $jobUrl       = SocialPostService::jobUrl($job);
        $locationName = $job->location->name ?? '';
        $jobType      = $job->job_type ?? 'full_time';
        $companyName  = $job->company->name ?? '';

        foreach ($followers as $candidate) {
            if ($mailOk && $candidate->email) {
                try {
                    [$subject, $html] = EmailTemplates::newJobFromFollowedCompany(
                        $candidate->name, $companyName, $job->title, $locationName, $jobType, $jobUrl
                    );
                    Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
                } catch (\Exception $e) {
                    Log::warning("Follower email failed for candidate {$candidate->id}: " . $e->getMessage());
                }
            }
            // Telegram DM — only for followers who linked their Telegram (no-op if the bot is off).
            if (! empty($candidate->telegram_chat_id)) {
                try {
                    TelegramService::notifyChat($candidate->telegram_chat_id,
                        $this->alertTelegramText($job, $companyName, $locationName, $jobType, $jobUrl, true));
                } catch (\Throwable $e) {
                    Log::warning("Follower Telegram failed for candidate {$candidate->id}: " . $e->getMessage());
                }
            }
            // Web push — to every device this follower subscribed (no-op if none / VAPID unset).
            WebPushService::sendToUser((int) $candidate->id, [
                'title' => '📣 ' . ($companyName ?: 'A company you follow') . ' is hiring',
                'body'  => $job->title . ($locationName ? ' · ' . $locationName : ''),
                'url'   => $jobUrl,
                'icon'  => '/krama/assets/icon-192.png',
            ]);
        }

        return $followers->pluck('id')->map(fn ($v) => (int) $v)->all();
    }

    /** @return int[] candidate ids notified */
    private function sendJobAlertEmails(Job $job): array
    {
        $job->loadMissing(['category:id,name', 'location:id,name', 'company:id,name']);

        $alerts = JobAlert::with('candidate:id,name,email,telegram_chat_id')
            ->where('type', 'filter')  // 'ai' rows carry no filters — handled by sendAiMatchAlerts()
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

        if ($alerts->isEmpty()) return [];

        $mailOk = MailConfig::isConfigured();
        if ($mailOk) MailConfig::applyFromDb();

        // Canonical slug URL — see the note in the follower-email path above.
        $jobUrl = SocialPostService::jobUrl($job);
        $locationName = $job->location->name ?? '';
        $jobType = $job->job_type ?? 'full_time';
        $companyName = $job->company->name ?? '';

        // Deduplicate by candidate so a candidate with multiple matching alerts is notified once.
        $seen = [];
        foreach ($alerts as $alert) {
            $candidate = $alert->candidate;
            if (! $candidate || isset($seen[$candidate->id])) continue;
            $seen[$candidate->id] = true;

            if ($mailOk && $candidate->email) {
                try {
                    [$subject, $html] = EmailTemplates::jobAlertMatch(
                        $candidate->name, $job->title, $companyName, $locationName, $jobType, $jobUrl
                    );
                    Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
                } catch (\Exception $e) {
                    Log::warning("Job alert email failed for candidate {$candidate->id}: " . $e->getMessage());
                }
            }
            // Telegram DM — only for candidates who linked their Telegram (no-op if the bot is off).
            if (! empty($candidate->telegram_chat_id)) {
                try {
                    TelegramService::notifyChat($candidate->telegram_chat_id,
                        $this->alertTelegramText($job, $companyName, $locationName, $jobType, $jobUrl, false));
                } catch (\Throwable $e) {
                    Log::warning("Job alert Telegram failed for candidate {$candidate->id}: " . $e->getMessage());
                }
            }
            // Web push — to every device this candidate subscribed (no-op if none / VAPID unset).
            WebPushService::sendToUser((int) $candidate->id, [
                'title' => '🔔 New job matching your alert',
                'body'  => $job->title . ($companyName ? ' — ' . $companyName : ''),
                'url'   => $jobUrl,
                'icon'  => '/krama/assets/icon-192.png',
            ]);
        }

        return array_map('intval', array_keys($seen));
    }

    // ---- AI profile matching -------------------------------------------------

    // Candidates AI-scored per publish (a cheap deterministic pre-filter ranks the
    // opted-in pool down to this many, so one AI batch call covers a whole publish).
    private const AI_POOL_MAX = 12;
    // AI score (0-100) at or above which we notify.
    private const AI_SCORE_THRESHOLD = 70;

    /**
     * "Match me by my profile (AI)": notify opted-in candidates whose résumé the AI
     * scores as a strong fit for this job — even when no saved-search filter matched.
     *
     * Cost control: opt-in only, a free deterministic pre-filter trims to AI_POOL_MAX,
     * ONE batched AI call scores the shortlist, and a per-day cap (Setting ai_match/daily_cap)
     * caps spend so a burst of publishes can't exhaust the provider's free quota.
     *
     * @param array<int,bool> $alreadyNotified candidate ids already pinged this publish
     */
    private function sendAiMatchAlerts(Job $job, array $alreadyNotified): void
    {
        $optIns = JobAlert::with('candidate:id,name,email,telegram_chat_id')
            ->where('type', 'ai')
            ->get()
            ->filter(fn ($a) => $a->candidate && ! isset($alreadyNotified[$a->candidate->id]))
            ->keyBy(fn ($a) => (int) $a->candidate->id);

        if ($optIns->isEmpty()) return;

        // Primary (else latest) résumé per opted-in candidate — skip empty résumés.
        $resumes = \App\Models\Resume::whereIn('candidate_id', $optIns->keys()->all())
            ->orderByDesc('is_primary')->orderByDesc('id')
            ->get()
            ->filter(fn ($r) => trim((string) $r->headline) !== '' || trim((string) $r->summary) !== '')
            ->unique('candidate_id')   // first per candidate wins (primary, then newest)
            ->values();

        if ($resumes->isEmpty()) return;

        // Pseudo-résumé standing in for the job, so we can reuse the CV↔CV matcher.
        $ref = new \App\Models\Resume([
            'headline' => (string) $job->title,
            'summary'  => mb_substr(trim(strip_tags((string) $job->description . ' ' . (string) $job->requirements)), 0, 1500),
        ]);

        // Free deterministic pre-filter → keep the strongest AI_POOL_MAX for the AI batch.
        $pool = $resumes
            ->sortByDesc(fn ($r) => \App\Services\CvMatchService::score($ref, $r)['score'])
            ->take(self::AI_POOL_MAX)
            ->values();

        // Per-day budget guard — one AI call per publish, capped per day.
        if (! $this->consumeAiBudget()) {
            Log::info('AI-match skipped for job ' . $job->id . ': daily AI budget reached.');
            return;
        }

        ['provider' => $provider, 'apiKey' => $apiKey, 'model' => $model] = \App\Services\AiConfig::resolve();
        if ($apiKey === '') return;

        $scores = \App\Services\CvMatchService::scoreAiProvider($provider, $ref, $pool, $apiKey, $model);
        // Guard against a model returning ids outside the batch.
        $scores = array_intersect_key($scores, $pool->keyBy('id')->all());

        $mailOk = MailConfig::isConfigured();
        if ($mailOk) MailConfig::applyFromDb();

        $jobUrl       = SocialPostService::jobUrl($job);
        $locationName = $job->location->name ?? '';
        $jobType      = $job->job_type ?? 'full_time';
        $companyName  = $job->company->name ?? '';

        foreach ($pool as $resume) {
            $score = $scores[$resume->id]['score'] ?? 0;
            if ($score < self::AI_SCORE_THRESHOLD) continue;

            $candidate = $optIns->get((int) $resume->candidate_id);
            if (! $candidate || ! $candidate->candidate) continue;
            $candidate = $candidate->candidate;

            if ($mailOk && $candidate->email) {
                try {
                    [$subject, $html] = EmailTemplates::jobAlertMatch(
                        $candidate->name, $job->title, $companyName, $locationName, $jobType, $jobUrl
                    );
                    Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
                } catch (\Exception $e) {
                    Log::warning("AI-match email failed for candidate {$candidate->id}: " . $e->getMessage());
                }
            }
            if (! empty($candidate->telegram_chat_id)) {
                try {
                    TelegramService::notifyChat($candidate->telegram_chat_id,
                        $this->alertTelegramText($job, $companyName, $locationName, $jobType, $jobUrl, false));
                } catch (\Throwable $e) {
                    Log::warning("AI-match Telegram failed for candidate {$candidate->id}: " . $e->getMessage());
                }
            }
            WebPushService::sendToUser((int) $candidate->id, [
                'title' => '✨ A new job fits your profile',
                'body'  => $job->title . ($companyName ? ' — ' . $companyName : ''),
                'url'   => $jobUrl,
                'icon'  => '/krama/assets/icon-192.png',
            ]);
        }
    }

    /**
     * Increment today's AI-match call counter and return whether this call is within
     * the daily cap. Cap lives in Setting ai_match/daily_cap (default 30); the counter
     * resets when the stored date rolls over. Free-tier Gemini has a small daily quota,
     * so this stops a publish storm from burning it — see [[project-ai-provider-keys]].
     */
    private function consumeAiBudget(): bool
    {
        $today = now()->toDateString();
        $rows  = \App\Models\Setting::where('group', 'ai_match')->pluck('value', 'key')->all();

        $cap = (int) ($rows['daily_cap'] ?? 30);
        if ($cap <= 0) $cap = 30;

        $count = ($rows['count_date'] ?? '') === $today ? (int) ($rows['count'] ?? 0) : 0;
        if ($count >= $cap) return false;

        \App\Models\Setting::updateOrInsert(
            ['group' => 'ai_match', 'key' => 'count_date'], ['value' => $today]
        );
        \App\Models\Setting::updateOrInsert(
            ['group' => 'ai_match', 'key' => 'count'], ['value' => (string) ($count + 1)]
        );

        return true;
    }

    // Compact HTML message for a Telegram job-alert / followed-company DM (sent HTML parse mode).
    private function alertTelegramText(Job $job, string $companyName, string $locName, string $jobType, string $url, bool $follow): string
    {
        $typeLabel = ['full_time' => 'Full-time', 'part_time' => 'Part-time', 'contract' => 'Contract', 'internship' => 'Internship'][$jobType] ?? $jobType;
        $meta = array_filter([$locName, $typeLabel]);
        $e = fn ($s) => htmlspecialchars((string) $s, ENT_NOQUOTES, 'UTF-8');
        $lines = [$follow ? '📣 New job from a company you follow' : '🔔 New job matching your alert', ''];
        $lines[] = '💼 <b>' . $e($job->title) . '</b>';
        if ($companyName) $lines[] = '🏢 ' . $e($companyName);
        if ($meta)        $lines[] = '📍 ' . $e(implode('  ·  ', $meta));
        $lines[] = '';
        $lines[] = $url;
        return implode("\n", $lines);
    }
}
