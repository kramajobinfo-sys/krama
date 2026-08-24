<?php

namespace App\Jobs;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\EmailCampaign;
use App\Models\Job;
use App\Models\User;
use App\Services\SocialPostService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Welcome email on signup — the lifecycle counterpart to the manual campaign tool. Candidates
 * get a warm intro + a few live "top jobs"; employers get a "post your first job" nudge.
 * Queued + fired afterResponse so it never blocks registration.
 */
class SendWelcomeEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 60;

    public function __construct(public int $userId)
    {
    }

    public function handle(): void
    {
        $user = User::with('role')->find($this->userId);
        if (! $user || ! $user->email) return;
        if (! MailConfig::isConfigured()) return;
        MailConfig::applyFromDb();

        $role = optional($user->role)->slug;

        $topJobs = [];
        if ($role !== 'employer') {
            $topJobs = Job::with(['company:id,name', 'location:id,name'])
                ->where('status', 'published')
                ->orderByDesc('is_featured')->orderByDesc('published_at')
                ->limit(5)->get()
                ->map(function ($j) {
                    $logo = optional($j->company)->logo_url;
                    if ($logo && ! str_starts_with($logo, 'http')) {
                        $logo = rtrim((string) (config('app.url') ?: 'https://kramajob.com'), '/') . '/' . ltrim($logo, '/');
                    }
                    return [
                        'title'    => $j->title,
                        'company'  => optional($j->company)->name ?: '',
                        'location' => $j->is_remote ? 'Remote' : (optional($j->location)->name ?: ''),
                        'url'      => SocialPostService::jobUrl($j),
                        'logo'     => $logo ?: null,
                    ];
                })->all();
        }

        try {
            [$subject, $html] = EmailTemplates::welcome($user->name, $role, $topJobs, EmailCampaign::unsubUrl($user->id));
            Mail::html($html, fn ($m) => $m->to($user->email, $user->name)->subject($subject));
        } catch (\Throwable $e) {
            Log::warning("Welcome email failed for user {$user->id}: " . $e->getMessage());
        }
    }
}
