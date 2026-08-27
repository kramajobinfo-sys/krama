<?php

namespace App\Jobs;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\EmailCampaign;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Sends a marketing campaign to its audience segment, in chunks, on the queue. Each email is
 * wrapped in the branded marketing shell with a per-recipient unsubscribe link. Skips users
 * who opted out / are inactive / have no email. Progress (sent/failed) is written as it goes.
 */
class SendCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 1800;

    public function __construct(public int $campaignId)
    {
    }

    public function handle(): void
    {
        $c = EmailCampaign::find($this->campaignId);
        if (! $c || $c->status !== 'sending') return;

        if (! MailConfig::isConfigured()) {
            $c->update(['status' => 'failed']);
            Log::warning("Campaign {$c->id} aborted: SMTP not configured.");
            return;
        }
        MailConfig::applyFromDb();

        // Counts accumulate across daily batches (see below), so start from what's stored.
        $sent = (int) $c->sent_count; $failed = (int) $c->failed_count;

        if ($c->audience === 'list') {
            $batch = (int) ($c->batch_size ?? 0);
            $cursor = (int) ($c->batch_cursor ?? 0);
            $base = \App\Models\EmailListRecipient::where('list_id', $c->list_id)->where('id', '>', $cursor)->orderBy('id');

            if ($batch > 0) {
                // Hourly batch: send the next $batch recipients, advancing the cursor past every
                // row we look at (incl. unsubscribed) so progress can't stall or repeat. Re-scheduled
                // +1h below until done — keeps the send under a host's per-hour email cap.
                $rows = (clone $base)->limit($batch)->select('id', 'email', 'name', 'org', 'unsubscribed')->get();
                foreach ($rows as $r) {
                    if (! $r->unsubscribed && $r->email) {
                        if ($this->deliver($c, $r->id, $r->email, $r->name, $r->org, \App\Models\EmailListRecipient::unsubUrl($r->id))) $sent++; else $failed++;
                        usleep(100000);
                    }
                    $cursor = $r->id;
                }
                $c->update(['sent_count' => $sent, 'failed_count' => $failed, 'batch_cursor' => $cursor]);

                if (\App\Models\EmailListRecipient::where('list_id', $c->list_id)->where('id', '>', $cursor)->exists()) {
                    // More to go — hand back to the scheduler for tomorrow.
                    $c->update(['status' => 'scheduled', 'scheduled_at' => now()->addHour()]);
                    Log::info("Campaign {$c->id} batch sent up to recipient {$cursor}; next batch ~1h.");
                    return;
                }
            } else {
                (clone $base)->where('unsubscribed', false)->select('id', 'email', 'name', 'org')->chunkById(100, function ($rows) use ($c, &$sent, &$failed) {
                    foreach ($rows as $r) {
                        if (! $r->email) continue;
                        if ($this->deliver($c, $r->id, $r->email, $r->name, $r->org, \App\Models\EmailListRecipient::unsubUrl($r->id))) $sent++; else $failed++;
                        usleep(100000);
                    }
                    $c->update(['sent_count' => $sent, 'failed_count' => $failed]);
                });
            }
        } else {
            self::audienceQuery($c->audience)->select('id', 'name', 'email', 'company_id')->chunkById(100, function ($users) use ($c, &$sent, &$failed) {
                $orgByUser = self::resolveOrgNames($users);   // {{org}} = the recipient's real company (employers); '' for candidates
                foreach ($users as $u) {
                    if (! $u->email) continue;
                    if ($this->deliver($c, $u->id, $u->email, $u->name, $orgByUser[$u->id] ?? '', EmailCampaign::unsubUrl($u->id))) $sent++; else $failed++;
                    usleep(100000); // ~10/sec — gentle on the SMTP gateway
                }
                $c->update(['sent_count' => $sent, 'failed_count' => $failed]);
            });
        }

        $c->update(['status' => 'sent', 'sent_at' => now(), 'sent_count' => $sent, 'failed_count' => $failed]);
        Log::info("Campaign {$c->id} sent: {$sent} ok, {$failed} failed.");
    }

    // Merge fields + tracking + branded shell, then send. Returns true on success.
    private function deliver(EmailCampaign $c, int $trackId, string $email, ?string $name, ?string $org, string $unsubUrl): bool
    {
        try {
            $subject = EmailCampaign::merge($c->subject, $name, $org);
            $body = \App\Support\EmailTracking::apply($c->id, $trackId, EmailCampaign::merge($c->body, $name, $org));
            $html = EmailTemplates::marketing($body, $unsubUrl);
            Mail::html($html, fn ($m) => $m->to($email, $name ?: null)->subject($subject));
            // Clear any prior failure for this recipient (e.g. a later batch/re-send that succeeded).
            \DB::table('email_campaign_failures')->where('campaign_id', $c->id)->where('email', $email)->delete();
            return true;
        } catch (\Throwable $e) {
            Log::warning("Campaign {$c->id} to {$email} failed: " . $e->getMessage());
            // Record the failed recipient so it can be exported + re-sent later. One row per
            // (campaign, email); updated if it fails again.
            \DB::table('email_campaign_failures')->updateOrInsert(
                ['campaign_id' => $c->id, 'email' => $email],
                ['name' => $name, 'org' => $org, 'error' => mb_substr($e->getMessage(), 0, 500), 'created_at' => now()]
            );
            return false;
        }
    }

    /**
     * Map user-id → their real company name, so {{org}} renders the actual organization for
     * employer recipients (candidates have none → left unset → merge() uses "your organization").
     * Owned company (companies.user_id) is preferred; team members fall back to users.company_id.
     * Two queries per 100-user chunk — no per-recipient N+1.
     */
    // Single user's company name (owned company preferred, else their linked company_id).
    // Used by the test-send preview so it shows the same {{org}} a real recipient would get.
    public static function orgNameForUser($user): string
    {
        $name = \App\Models\Company::where('user_id', $user->id)->value('name');
        if (! $name && ! empty($user->company_id)) $name = \App\Models\Company::whereKey($user->company_id)->value('name');
        return (string) $name;
    }

    private static function resolveOrgNames($users): array
    {
        $userIds    = $users->pluck('id')->all();
        $companyIds = $users->pluck('company_id')->filter()->unique()->values()->all();

        $owned = \App\Models\Company::whereIn('user_id', $userIds)->pluck('name', 'user_id'); // user_id => name
        $byId  = $companyIds ? \App\Models\Company::whereIn('id', $companyIds)->pluck('name', 'id') : collect(); // id => name

        $out = [];
        foreach ($users as $u) {
            $name = $owned[$u->id] ?? ($u->company_id ? ($byId[$u->company_id] ?? null) : null);
            if ($name) $out[$u->id] = $name;
        }
        return $out;
    }

    /**
     * User query for an audience segment — active, has an email, not opted out of marketing.
     * Shared by the send job and the admin recipient-count preview.
     */
    public static function audienceQuery(string $audience)
    {
        $q = User::query()
            ->whereNotNull('email')->where('email', '!=', '')
            ->where('status', 'active')
            ->where(function ($w) { $w->where('marketing_opt_out', false)->orWhereNull('marketing_opt_out'); });

        if ($audience === 'all_candidates') {
            $q->whereHas('role', fn ($r) => $r->where('slug', 'candidate'));
        } elseif ($audience === 'all_employers') {
            $q->whereHas('role', fn ($r) => $r->where('slug', 'employer'));
        } else { // all_users → candidates + employers (never admins/staff)
            $q->whereHas('role', fn ($r) => $r->whereIn('slug', ['candidate', 'employer']));
        }

        return $q;
    }
}
