<?php

namespace App\Console\Commands;

use App\Models\Job;
use App\Models\Setting;
use App\Services\GoogleIndexingService;
use Illuminate\Console\Command;

/**
 * One-time (multi-day) backfill: push every already-published job URL to the Google Indexing
 * API so the existing catalogue gets recrawled. Google's default quota is ~200 URLs/day, so
 * this runs in daily batches:
 *   - Bounded to the ORIGINAL backlog (max published job id captured on first run) so it never
 *     competes with new jobs — those are pushed automatically at publish time.
 *   - Resumable: the last pushed id is saved after every success, so it picks up where it left off.
 *   - Quota-aware: a 429 (RESOURCE_EXHAUSTED) stops the run cleanly; tomorrow's run continues.
 * Scheduled daily; once last_id reaches the captured max it no-ops (backlog complete).
 */
class GoogleIndexAll extends Command
{
    protected $signature = 'google:index-all {--limit=180 : max URLs to push this run (stay under the ~200/day quota)} {--sleep=1 : seconds between pushes} {--reset : clear saved progress and re-capture the backlog}';

    protected $description = 'Backfill published job URLs to the Google Indexing API (resumable, quota-aware daily batches)';

    const STATE_LAST = 'google_index_backfill_last_id';
    const STATE_MAX  = 'google_index_backfill_max_id';

    public function handle(): int
    {
        if (! GoogleIndexingService::enabled()) {
            $this->error('Google Indexing is not enabled/configured (Admin → SEO).');
            return 1;
        }

        if ($this->option('reset')) {
            Setting::where('group', 'seo')->whereIn('key', [self::STATE_LAST, self::STATE_MAX])->delete();
            $this->info('Progress reset.');
        }

        // Capture the backlog ceiling once, so new jobs (id > maxId) are never touched here.
        $maxId = (int) (Setting::where('group', 'seo')->where('key', self::STATE_MAX)->value('value') ?? 0);
        if ($maxId === 0) {
            $maxId = (int) Job::where('status', 'published')->whereNotNull('slug')->max('id');
            Setting::updateOrInsert(['group' => 'seo', 'key' => self::STATE_MAX], ['value' => (string) $maxId]);
        }

        $lastId = (int) (Setting::where('group', 'seo')->where('key', self::STATE_LAST)->value('value') ?? 0);
        $limit  = max(1, (int) $this->option('limit'));
        $sleep  = max(0, (int) $this->option('sleep'));

        $base = Job::where('status', 'published')->whereNotNull('slug')
            ->where('id', '>', $lastId)->where('id', '<=', $maxId)->orderBy('id');
        $remaining = (clone $base)->count();

        if ($remaining === 0) {
            $this->info("Backlog complete — nothing to push (last_id={$lastId}, max_id={$maxId}).");
            return 0;
        }

        $this->info("Indexing backfill: {$remaining} of the original backlog remaining (after id {$lastId}, up to {$maxId}). Pushing up to {$limit} this run.");

        $done = 0; $ok = 0; $fail = 0; $quota = false;
        foreach ($base->limit($limit)->get() as $job) {
            $url    = url('/jobs/' . $job->slug);
            $status = GoogleIndexingService::publishStatus($url, 'URL_UPDATED');

            if ($status === 200) {
                $ok++;
                Setting::updateOrInsert(['group' => 'seo', 'key' => self::STATE_LAST], ['value' => (string) $job->id]);
            } elseif ($status === 429) {
                $this->warn("  #{$job->id} 429 — daily quota exhausted. Stopping; will resume next run.");
                $quota = true;
                break; // do NOT advance last_id — retry this job next run
            } else {
                $fail++;
                $this->warn("  #{$job->id} push returned {$status} (skipped, advancing).");
                Setting::updateOrInsert(['group' => 'seo', 'key' => self::STATE_LAST], ['value' => (string) $job->id]);
            }

            $done++;
            if ($done % 25 === 0) $this->info("  … {$done} processed ({$ok} ok, {$fail} failed)");
            if ($sleep > 0) sleep($sleep);
        }

        $left = (int) Job::where('status', 'published')->whereNotNull('slug')
            ->where('id', '>', (int) (Setting::where('group', 'seo')->where('key', self::STATE_LAST)->value('value') ?? 0))
            ->where('id', '<=', $maxId)->count();

        $this->info(($quota ? 'Stopped on quota' : 'Batch done') . ": {$ok} pushed, {$fail} skipped this run. {$left} of the backlog still remaining.");
        return 0;
    }
}
