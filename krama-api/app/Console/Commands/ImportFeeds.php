<?php

namespace App\Console\Commands;

use App\Models\FeedSource;
use App\Services\FeedImportService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ImportFeeds extends Command
{
    protected $signature = 'feeds:import {--id= : Import only this feed source id} {--kind= : Limit to jobs|companies}';
    protected $description = 'Fetch admin-configured external feeds and aggregate their job/company listings';

    public function handle(FeedImportService $service): int
    {
        $query = FeedSource::where('enabled', true);
        if ($this->option('id'))   $query->where('id', $this->option('id'));
        if ($this->option('kind')) $query->where('kind', $this->option('kind'));

        $sources = $query->get();
        if ($sources->isEmpty()) {
            $this->info('No enabled feed sources to import.');
            return self::SUCCESS;
        }

        $totalImported = 0;
        $failed = 0;
        foreach ($sources as $source) {
            $r = $service->import($source);
            $totalImported += $r['imported'];
            if (! $r['ok']) {
                $failed++;
                $this->warn("  [{$source->id}] {$source->name}: ERROR — {$r['error']}");
            } else {
                $this->info("  [{$source->id}] {$source->name} ({$source->kind}): {$r['imported']} imported, {$r['deactivated']} deactivated");
            }
        }

        Log::channel('audit')->info('feeds.imported', [
            'sources' => $sources->count(), 'imported' => $totalImported, 'failed' => $failed,
        ]);
        $this->info("Done: {$sources->count()} source(s), {$totalImported} item(s) imported, {$failed} failed.");

        return self::SUCCESS;
    }
}
