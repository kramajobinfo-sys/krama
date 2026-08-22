<?php

namespace App\Console\Commands;

use App\Models\Job;
use App\Support\SalaryParser;
use Illuminate\Console\Command;

/**
 * One-off (re-runnable) backfill: recover a structured salary from the description text of
 * jobs that have no salary set, using the same parser used at capture time. Only fills empty
 * rows — never overrides an existing salary. Run with --dry-run first to see the yield.
 */
class BackfillJobSalary extends Command
{
    protected $signature = 'jobs:backfill-salary {--dry-run : Report what would change without saving} {--limit=0 : Cap rows processed (0 = all)} {--all : Include non-published jobs too}';

    protected $description = 'Recover structured salary from job description text where the salary fields are empty.';

    public function handle(): int
    {
        $q = Job::whereNull('salary_min')->whereNull('salary_max');
        if (! $this->option('all')) $q->where('status', 'published');
        if (($limit = (int) $this->option('limit')) > 0) $q->limit($limit);

        $dry = (bool) $this->option('dry-run');
        $scanned = $found = 0;
        $samples = [];

        $q->orderByDesc('id')->chunkById(200, function ($jobs) use (&$scanned, &$found, &$samples, $dry) {
            foreach ($jobs as $j) {
                $scanned++;
                $sal = SalaryParser::fromDescription($j->description, $j->requirements, $j->benefits);
                if (! $sal) continue;
                $found++;
                if (count($samples) < 10) {
                    $samples[] = '#' . $j->id . ' ' . mb_substr((string) $j->title, 0, 40) . ' → '
                        . ($sal['min'] ?? '?') . '-' . ($sal['max'] ?? '?') . ' ' . $sal['currency'] . '/' . $sal['period'];
                }
                if (! $dry) {
                    $j->forceFill([
                        'salary_min'      => $sal['min'],
                        'salary_max'      => $sal['max'],
                        'salary_currency' => $sal['currency'],
                        'salary_period'   => $sal['period'],
                    ])->save();
                }
            }
        });

        foreach ($samples as $s) $this->line('  ' . $s);
        $this->info(($dry ? '[dry-run] ' : '') . "Scanned {$scanned} salary-less jobs, recovered {$found}.");

        return self::SUCCESS;
    }
}
