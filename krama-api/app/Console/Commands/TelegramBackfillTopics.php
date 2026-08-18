<?php

namespace App\Console\Commands;

use App\Models\Job;
use App\Models\Setting;
use App\Services\SocialPostService;
use App\Services\TelegramService;
use Illuminate\Console\Command;

/**
 * One-time backfill: post every published job into its @kramajobforum category topic
 * (topics ONLY — never the @kramajob channel). Category topics are auto-created + reused.
 *
 * Paced to respect Telegram's per-group flood limit (~20 msg/min) with a sleep between
 * posts, and it parses "retry after N" flood-waits to back off and retry. Progress is
 * persisted after every job (social_post/telegram_backfill_last_id) so a killed run
 * resumes exactly where it stopped — just run the command again. Use --reset to start over.
 */
class TelegramBackfillTopics extends Command
{
    protected $signature = 'telegram:backfill-topics {--sleep=4 : seconds to wait between posts} {--limit=0 : max jobs this run (0 = all remaining)} {--reset : clear saved progress and start from the first job}';

    protected $description = 'Backfill all published jobs into their @kramajobforum category topics (topics only, resumable)';

    const STATE_KEY = 'telegram_backfill_last_id';

    public function handle(): int
    {
        $cfg   = SocialPostService::settings();
        $forum = trim($cfg['telegram_forum_chat'] ?? '');
        if ($forum === '' || TelegramService::botToken() === '') {
            $this->error('Aborting: telegram_forum_chat or bot token is not configured.');
            return 1;
        }

        if ($this->option('reset')) {
            Setting::where('group', 'social_post')->where('key', self::STATE_KEY)->delete();
            $this->info('Progress reset.');
        }

        $lastId = (int) (Setting::where('group', 'social_post')->where('key', self::STATE_KEY)->value('value') ?? 0);
        $sleep  = max(1, (int) $this->option('sleep'));
        $limit  = (int) $this->option('limit');

        $base  = Job::where('status', 'published')->where('id', '>', $lastId);
        $total = (clone $base)->count();
        $this->info("Backfill start: {$total} published jobs remaining (after id {$lastId}), {$sleep}s between posts, topics only.");

        $done = 0; $ok = 0; $fail = 0; $stop = false;

        $base->orderBy('id')->chunkById(100, function ($jobs) use (&$done, &$ok, &$fail, &$stop, $sleep, $limit, $total) {
            foreach ($jobs as $job) {
                if ($limit > 0 && $done >= $limit) { $stop = true; return false; }

                $attempt = 0;
                while (true) {
                    $attempt++;
                    $res = SocialPostService::postJobToForumTopic($job);
                    if (! empty($res['ok'])) {
                        $ok++;
                        $this->line("  #{$job->id} → [{$res['topic']}] ok");
                        break;
                    }
                    $err = $res['error'] ?? 'unknown';
                    // Telegram flood-wait: "Too Many Requests: retry after N" — back off and retry.
                    if (preg_match('/retry after (\d+)/i', $err, $m) && $attempt <= 6) {
                        $wait = (int) $m[1] + 1;
                        $this->warn("  #{$job->id} flood-wait {$wait}s (attempt {$attempt})");
                        sleep($wait);
                        continue;
                    }
                    $fail++;
                    $this->warn("  #{$job->id} FAILED: {$err}");
                    break;
                }

                $done++;
                // Persist progress after every job so a killed run resumes cleanly.
                Setting::updateOrInsert(['group' => 'social_post', 'key' => self::STATE_KEY], ['value' => (string) $job->id]);
                if ($done % 25 === 0) $this->info("  … {$done}/{$total} processed ({$ok} ok, {$fail} failed)");
                sleep($sleep);
            }
        });

        $this->info(($stop ? 'Batch limit reached' : 'Backfill complete') . ": {$done} processed, {$ok} ok, {$fail} failed.");
        return 0;
    }
}
