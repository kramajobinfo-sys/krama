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

        $sent = 0; $failed = 0;

        if ($c->audience === 'list') {
            // Custom uploaded list (e.g. 700 organizations). Track/unsubscribe by recipient id.
            \App\Models\EmailListRecipient::where('list_id', $c->list_id)->where('unsubscribed', false)
                ->select('id', 'email', 'name', 'org')->chunkById(100, function ($rows) use ($c, &$sent, &$failed) {
                    foreach ($rows as $r) {
                        if (! $r->email) continue;
                        $unsub = \App\Models\EmailListRecipient::unsubUrl($r->id);
                        if ($this->deliver($c, $r->id, $r->email, $r->name, $r->org, $unsub)) $sent++; else $failed++;
                        usleep(100000);
                    }
                    $c->update(['sent_count' => $sent, 'failed_count' => $failed]);
                });
        } else {
            self::audienceQuery($c->audience)->select('id', 'name', 'email')->chunkById(100, function ($users) use ($c, &$sent, &$failed) {
                foreach ($users as $u) {
                    if (! $u->email) continue;
                    if ($this->deliver($c, $u->id, $u->email, $u->name, '', EmailCampaign::unsubUrl($u->id))) $sent++; else $failed++;
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
            return true;
        } catch (\Throwable $e) {
            Log::warning("Campaign {$c->id} to {$email} failed: " . $e->getMessage());
            return false;
        }
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
