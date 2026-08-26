<?php

namespace App\Console\Commands;

use App\Jobs\SendCampaignJob;
use App\Models\EmailCampaign;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

// Fires scheduled campaigns whose send time has arrived. Runs every minute; flips each due
// campaign to 'sending' (guarded so a second run can't double-dispatch) then queues delivery.
class DispatchDueCampaigns extends Command
{
    protected $signature = 'campaigns:dispatch-due';
    protected $description = 'Dispatch email campaigns whose scheduled send time has arrived';

    public function handle(): int
    {
        $due = EmailCampaign::where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->get();

        foreach ($due as $c) {
            // Compare-and-swap: only the caller that flips scheduled→sending dispatches.
            $claimed = EmailCampaign::where('id', $c->id)->where('status', 'scheduled')
                ->update(['status' => 'sending', 'sent_count' => 0, 'failed_count' => 0]);
            if ($claimed === 1) {
                SendCampaignJob::dispatch($c->id);
                Log::info("Scheduled campaign {$c->id} dispatched.");
            }
        }

        $this->info('Dispatched ' . $due->count() . ' due campaign(s).');
        return self::SUCCESS;
    }
}
