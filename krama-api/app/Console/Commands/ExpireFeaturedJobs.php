<?php

namespace App\Console\Commands;

use App\Models\Job;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireFeaturedJobs extends Command
{
    protected $signature = 'features:expire';
    protected $description = 'Clear the featured flag on jobs whose featured_until has passed';

    public function handle(): int
    {
        $unfeatured = Job::where('is_featured', true)
            ->whereNotNull('featured_until')
            ->where('featured_until', '<', now())
            ->update(['is_featured' => false]);

        if ($unfeatured > 0) {
            Log::channel('audit')->info('jobs.featured_expired', ['count' => $unfeatured]);
        }

        $this->info("Un-featured {$unfeatured} expired boost(s).");

        return self::SUCCESS;
    }
}
