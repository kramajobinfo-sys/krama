<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';
    protected $description = 'Mark overdue active subscriptions as expired';

    public function handle(): int
    {
        $expired = Subscription::expireOverdue();

        if ($expired > 0) {
            Log::channel('audit')->info('subscriptions.expired', ['count' => $expired]);
        }

        $this->info("Expired {$expired} subscription(s).");

        return self::SUCCESS;
    }
}
