<?php

namespace App\Console\Commands;

use App\Models\Job;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireJobs extends Command
{
    protected $signature = 'jobs:expire';
    protected $description = 'Close published job listings whose expires_at date has passed';

    public function handle(): int
    {
        $closed = Job::where('status', 'published')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now()->startOfDay())
            ->update(['status' => 'closed']);

        if ($closed > 0) {
            Log::channel('audit')->info('jobs.auto_closed', ['count' => $closed]);
        }

        $this->info("Closed {$closed} expired job(s).");

        return self::SUCCESS;
    }
}
