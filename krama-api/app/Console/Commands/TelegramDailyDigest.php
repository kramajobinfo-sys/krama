<?php

namespace App\Console\Commands;

use App\Models\Job;
use App\Services\SocialPostService;
use App\Services\TelegramService;
use Illuminate\Console\Command;

/**
 * Posts a once-a-day digest of newly published jobs to the Telegram channel — the
 * retention loop that turns a channel of one-off "we're hiring!" posts into a daily
 * destination (rec #1 from the competitive analysis).
 *
 * Reuses the shared bot + channel already configured for social posting
 * (social_post.telegram_channel), so no new credentials. Opt-in via
 * social_post.digest_enabled; count via social_post.digest_count.
 */
class TelegramDailyDigest extends Command
{
    protected $signature = 'telegram:daily-digest {--hours=24 : Look-back window} {--force : Ignore the digest_enabled toggle} {--dry-run : Print the message instead of sending}';

    protected $description = 'Post a digest of newly published jobs to the Telegram channel.';

    public function handle(): int
    {
        $cfg = SocialPostService::settings();

        $enabled = filter_var($cfg['digest_enabled'] ?? false, FILTER_VALIDATE_BOOLEAN);
        if (! $enabled && ! $this->option('force')) {
            $this->info('Daily digest is disabled (social_post.digest_enabled).');
            return self::SUCCESS;
        }

        $channel = trim((string) ($cfg['telegram_channel'] ?? ''));
        $token   = TelegramService::botToken();
        if ($channel === '' || $token === '') {
            $this->warn('Telegram channel or bot token is not configured — nothing sent.');
            return self::SUCCESS;
        }

        $count = (int) ($cfg['digest_count'] ?? 10);
        $count = max(1, min(25, $count));

        $hours = max(1, (int) $this->option('hours'));
        $since = now()->subHours($hours);

        $jobs = Job::with(['company:id,name', 'location:id,name'])
            ->where('status', 'published')
            ->where('published_at', '>=', $since)
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->limit($count)
            ->get();

        if ($jobs->isEmpty()) {
            $this->info('No jobs published in the last ' . $hours . 'h — skipping (no empty digest).');
            return self::SUCCESS;
        }

        // How many matched in total, so the message can say "+N more" when we cap the list.
        $totalNew = Job::where('status', 'published')->where('published_at', '>=', $since)->count();

        $text = $this->buildDigest($jobs, $totalNew);

        if ($this->option('dry-run')) {
            $this->line("---- digest preview (" . $jobs->count() . " of " . $totalNew . " new) ----");
            $this->line($text);
            $this->line('---- end preview (not sent) ----');
            return self::SUCCESS;
        }

        $res = TelegramService::sendMessage($token, $channel, $text);

        if (empty($res['ok'])) {
            $this->error('Digest send failed: ' . ($res['error'] ?? 'unknown error'));
            return self::FAILURE;
        }

        $this->info('Digest posted to ' . $channel . ' (' . $jobs->count() . ' of ' . $totalNew . ' new jobs).');
        return self::SUCCESS;
    }

    private function buildDigest($jobs, int $totalNew): string
    {
        $e = fn ($s) => htmlspecialchars((string) $s, ENT_NOQUOTES, 'UTF-8');

        $lines = [];
        $lines[] = '🗞️ <b>New jobs on Krama today</b>';
        $lines[] = '📅 ' . now()->timezone('Asia/Phnom_Penh')->format('l, j M Y');
        $lines[] = '';

        $i = 0;
        foreach ($jobs as $job) {
            $i++;
            $url  = SocialPostService::jobUrl($job);
            $meta = array_filter([
                optional($job->company)->name,
                $job->is_remote ? 'Remote' : optional($job->location)->name,
                SocialPostService::salaryLabel($job),
            ]);
            $lines[] = $i . '. <a href="' . $e($url) . '"><b>' . $e($job->title) . '</b></a>';
            if ($meta) $lines[] = '    ' . $e(implode('  ·  ', $meta));
        }

        if ($totalNew > $jobs->count()) {
            $lines[] = '';
            $lines[] = '➕ and ' . ($totalNew - $jobs->count()) . ' more new roles today.';
        }

        $lines[] = '';
        $lines[] = '👉 <a href="' . $e(url('/?page=jobs')) . '">Browse all jobs on Krama</a>';
        $lines[] = '#Krama #Jobs #Cambodia #ការងារ';

        return implode("\n", $lines);
    }
}
