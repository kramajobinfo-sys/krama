<?php

namespace App\Console\Commands;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Http\Controllers\PremiumSlotController;
use App\Models\Company;
use App\Models\PremiumWaitlist;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Daily upkeep for Premium Featured homepage slots:
 *   1. Email employers whose paid slot expires soon (once per cycle) to renew.
 *   2. When capacity frees up, email the next waitlisted employer(s) that a slot is open.
 * Expiry itself is implicit (public queries filter premium_until > now), so this command
 * only sends notifications — it never changes who is premium.
 */
class PremiumMaintain extends Command
{
    protected $signature = 'premium:maintain';
    protected $description = 'Send premium-slot renewal reminders and notify the waitlist when slots free up';

    const REMIND_WITHIN_DAYS = 5;

    public function handle(): int
    {
        if (! MailConfig::isConfigured()) {
            $this->info('SMTP not configured — skipping premium maintenance emails.');
            return self::SUCCESS;
        }
        MailConfig::applyFromDb();

        $base   = rtrim(config('app.frontend_url') ?: config('app.url'), '/');
        $manage = $base . '/krama/ui_kits/employer-dashboard/';

        $reminded = $this->sendRenewalReminders($manage);
        $notified = $this->notifyWaitlist($manage);

        $this->info("Premium maintenance: {$reminded} renewal reminder(s), {$notified} waitlist notification(s).");
        return self::SUCCESS;
    }

    private function sendRenewalReminders(string $manage): int
    {
        $sent = 0;
        Company::whereNotNull('premium_until')
            ->where('premium_until', '>', now())
            ->where('premium_until', '<=', now()->addDays(self::REMIND_WITHIN_DAYS))
            ->whereNull('premium_reminder_sent_at')
            ->with('owner:id,name,email')
            ->chunkById(100, function ($companies) use (&$sent, $manage) {
                foreach ($companies as $c) {
                    $owner = $c->owner;
                    if (! $owner || empty($owner->email)) continue;
                    $daysLeft = max(1, (int) now()->diffInDays($c->premium_until, false));
                    try {
                        [$subject, $html] = EmailTemplates::premiumRenewalReminder(
                            $owner->name ?: 'there',
                            $daysLeft,
                            $c->premium_until->format('j M Y'),
                            $manage
                        );
                        Mail::html($html, fn ($m) => $m->to($owner->email, $owner->name)->subject($subject));
                        $c->update(['premium_reminder_sent_at' => now()]);
                        $sent++;
                    } catch (\Throwable $e) {
                        Log::warning('Premium renewal reminder failed for company ' . $c->id . ': ' . $e->getMessage());
                    }
                }
            });
        return $sent;
    }

    private function notifyWaitlist(string $manage): int
    {
        $cfg  = PremiumSlotController::premiumConfig();
        $free = $cfg['limit'] - PremiumSlotController::occupiedCount($cfg);
        if ($free < 1) return 0;

        $sent = 0;
        PremiumWaitlist::whereNull('notified_at')
            ->orderBy('id')
            ->with('company.owner:id,name,email')
            ->limit($free)
            ->get()
            ->each(function ($w) use (&$sent, $manage) {
                $owner = $w->company ? $w->company->owner : null;
                if (! $owner || empty($owner->email)) {
                    // Can't reach them — mark notified so we move to the next in line.
                    $w->update(['notified_at' => now()]);
                    return;
                }
                try {
                    [$subject, $html] = EmailTemplates::premiumSlotAvailable($owner->name ?: 'there', $manage);
                    Mail::html($html, fn ($m) => $m->to($owner->email, $owner->name)->subject($subject));
                    $w->update(['notified_at' => now()]);
                    $sent++;
                } catch (\Throwable $e) {
                    Log::warning('Premium waitlist notify failed for company ' . $w->company_id . ': ' . $e->getMessage());
                }
            });
        return $sent;
    }
}
