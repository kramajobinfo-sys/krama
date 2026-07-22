<?php

namespace App\Console\Commands;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\ForumReply;
use App\Models\ForumSubscription;
use App\Models\ForumThread;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendForumDigest extends Command
{
    protected $signature = 'forum:digest';
    protected $description = 'Email forum subscribers a daily digest of new replies in threads they follow';

    public function handle(): int
    {
        $cfg = Setting::where('group', 'forum')->pluck('value', 'key')->toArray();
        if (array_key_exists('digest_enabled', $cfg) && ! (bool) $cfg['digest_enabled']) {
            $this->info('Forum digest disabled — skipping.');
            return self::SUCCESS;
        }
        if (! MailConfig::isConfigured()) {
            $this->info('SMTP not configured — skipping forum digest.');
            return self::SUCCESS;
        }

        MailConfig::applyFromDb();

        $base = rtrim(config('app.frontend_url') ?: config('app.url'), '/');

        // Gather new, non-own replies per subscriber since they were last notified.
        // Structure: [userId => ['user' => User, 'threads' => [threadId => ['title','url','count']]]]
        $bundles = [];

        ForumSubscription::query()->orderBy('user_id')->chunk(200, function ($subs) use (&$bundles, $base) {
            foreach ($subs as $sub) {
                $thread = ForumThread::find($sub->thread_id);
                if (! $thread || $thread->is_hidden) continue;

                $since = $sub->last_notified_at ?: $sub->created_at;

                $count = ForumReply::where('thread_id', $thread->id)
                    ->where('is_hidden', false)
                    ->where('user_id', '!=', $sub->user_id)   // don't notify about my own replies
                    ->when($since, fn ($q) => $q->where('created_at', '>', $since))
                    ->count();

                if ($count < 1) continue;

                $bundles[$sub->user_id] ??= ['threads' => [], 'subIds' => []];
                $bundles[$sub->user_id]['threads'][] = [
                    'title' => $thread->title,
                    'url'   => $base . '?thread=' . $thread->id,
                    'count' => $count,
                ];
                $bundles[$sub->user_id]['subIds'][] = $sub->id;
            }
        });

        $sent = 0;
        foreach ($bundles as $userId => $bundle) {
            $user = User::find($userId);
            if (! $user || empty($user->email)) continue;

            try {
                [$subject, $html] = EmailTemplates::forumDigest($user->name ?? 'there', $bundle['threads']);
                Mail::html($html, fn ($m) => $m->to($user->email, $user->name)->subject($subject));
                $sent++;
            } catch (\Throwable $e) {
                Log::warning('Forum digest email failed for user ' . $userId . ': ' . $e->getMessage());
                continue; // don't advance last_notified_at if the send failed
            }

            // Mark these subscriptions as notified so the next run won't repeat them.
            ForumSubscription::whereIn('id', $bundle['subIds'])->update(['last_notified_at' => now()]);
        }

        $this->info("Forum digest: emailed {$sent} subscriber(s).");
        return self::SUCCESS;
    }
}
