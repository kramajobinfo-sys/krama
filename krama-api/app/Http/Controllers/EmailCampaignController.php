<?php

namespace App\Http\Controllers;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Jobs\SendCampaignJob;
use App\Models\EmailCampaign;
use App\Models\EmailListRecipient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/**
 * Admin email-marketing campaigns: compose an HTML message (or load a saved template),
 * pick an audience segment OR an uploaded recipient list, preview the count, send a test,
 * then send now or schedule for later. Delivery runs on the queue (SendCampaignJob) with
 * per-recipient unsubscribe honoured, {{name}}/{{org}} merge fields, and open/click tracking.
 */
class EmailCampaignController extends Controller
{
    private const AUDIENCES = ['all_candidates', 'all_employers', 'all_users', 'list'];

    // GET /api/admin/campaigns
    public function index()
    {
        $this->requirePermission('site_settings');

        $rows = EmailCampaign::orderByDesc('id')->limit(100)->get();

        return response()->json([
            'data' => $rows->map(fn ($c) => [
                'id' => $c->id, 'subject' => $c->subject, 'audience' => $c->audience,
                'list_id' => $c->list_id, 'template_id' => $c->template_id,
                'batch_size' => $c->batch_size,
                'status' => $c->status, 'scheduled_at' => $c->scheduled_at,
                'total_recipients' => $c->total_recipients,
                'sent_count' => $c->sent_count, 'failed_count' => $c->failed_count,
                'opens' => (int) ($c->opens ?? 0), 'clicks' => (int) ($c->clicks ?? 0),
                'created_at' => $c->created_at, 'sent_at' => $c->sent_at,
            ]),
            'smtp_configured' => MailConfig::isConfigured(),
        ]);
    }

    // GET /api/admin/campaigns/{id} — full record (incl. body) for duplicating into a new draft.
    public function show(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        $c = EmailCampaign::findOrFail($id);
        return response()->json([
            'id' => $c->id, 'subject' => $c->subject, 'body' => $c->body,
            'audience' => $c->audience, 'list_id' => $c->list_id,
            'template_id' => $c->template_id, 'batch_size' => $c->batch_size,
        ]);
    }

    // GET /api/admin/campaigns/audience-count?audience=…&list_id=…
    public function audienceCount(Request $request)
    {
        $this->requirePermission('site_settings');
        $audience = $request->query('audience', 'all_candidates');
        if ($audience === 'list') {
            $lid = (int) $request->query('list_id');
            return response()->json(['count' => $lid ? EmailListRecipient::where('list_id', $lid)->where('unsubscribed', false)->count() : 0]);
        }
        if (! in_array($audience, self::AUDIENCES, true)) return response()->json(['count' => 0]);
        return response()->json(['count' => SendCampaignJob::audienceQuery($audience)->count()]);
    }

    // Recipient count for a campaign, whichever source it uses.
    private function recipientCount(EmailCampaign $c): int
    {
        if ($c->audience === 'list') {
            return $c->list_id ? EmailListRecipient::where('list_id', $c->list_id)->where('unsubscribed', false)->count() : 0;
        }
        return SendCampaignJob::audienceQuery($c->audience)->count();
    }

    // POST /api/admin/campaigns  { subject, body, audience, list_id?, template_id? }
    public function store(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'subject'     => 'required|string|max:200',
            'body'        => 'required|string|max:100000',
            'audience'    => 'required|in:' . implode(',', self::AUDIENCES),
            'list_id'     => 'nullable|integer|required_if:audience,list',
            'template_id' => 'nullable|integer',
            'batch_size'  => 'nullable|integer|min:1|max:100000',
        ]);

        $c = EmailCampaign::create([
            'subject'          => $data['subject'],
            'body'             => $data['body'],
            'audience'         => $data['audience'],
            'list_id'          => $data['audience'] === 'list' ? $data['list_id'] : null,
            'template_id'      => $data['template_id'] ?? null,
            // Daily-batch sending only applies to custom lists.
            'batch_size'       => ($data['audience'] === 'list' && ! empty($data['batch_size'])) ? (int) $data['batch_size'] : null,
            'status'           => 'draft',
            'total_recipients' => 0,
            'created_by'       => $request->user()->id,
        ]);
        $c->update(['total_recipients' => $this->recipientCount($c)]);

        return response()->json(['message' => 'Campaign saved as draft.', 'id' => $c->id, 'total_recipients' => $c->total_recipients], 201);
    }

    // POST /api/admin/campaigns/preview — render the email exactly as recipients see it
    // (branded shell + merge fields filled with sample values). No draft is created/sent.
    public function preview(Request $request)
    {
        $this->requirePermission('site_settings');
        $data = $request->validate([
            'subject' => 'nullable|string|max:200',
            'body'    => 'required|string|max:100000',
        ]);

        $sampleName = $request->user()->name ?: 'Sok Dara';
        $sampleOrg  = 'Your Organization';
        $subject = EmailCampaign::merge((string) ($data['subject'] ?? ''), $sampleName, $sampleOrg);
        $body    = EmailCampaign::merge($data['body'], $sampleName, $sampleOrg);
        $html    = EmailTemplates::marketing($body, EmailCampaign::unsubUrl($request->user()->id));

        return response()->json(['subject' => $subject, 'html' => $html]);
    }

    // POST /api/admin/campaigns/{id}/test — send the campaign to the admin's own email.
    public function sendTest(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $c = EmailCampaign::findOrFail($id);
        $to = $request->user()->email;
        if (! $to) return response()->json(['message' => 'Your account has no email address.'], 422);
        if (! MailConfig::isConfigured()) return response()->json(['message' => 'SMTP is not configured (Email settings).'], 422);

        MailConfig::applyFromDb();

        // Merge with a REAL representative recipient so the test reflects an actual send:
        // the first person in the chosen list (list audience) or the first matching user
        // (with their real company for {{org}}). Falls back to the admin's own name.
        $sampleName = $request->user()->name ?: 'there';
        $sampleOrg  = '';
        if ($c->audience === 'list' && $c->list_id) {
            $r = EmailListRecipient::where('list_id', $c->list_id)->orderBy('id')->first();
            if ($r) { $sampleName = $r->name ?: $sampleName; $sampleOrg = (string) $r->org; }
        } else {
            $u = SendCampaignJob::audienceQuery($c->audience)->first();
            if ($u) { $sampleName = $u->name ?: $sampleName; $sampleOrg = SendCampaignJob::orgNameForUser($u); }
        }

        try {
            $body = EmailCampaign::merge($c->body, $sampleName, $sampleOrg);
            $html = EmailTemplates::marketing($body, EmailCampaign::unsubUrl($request->user()->id));
            $subject = EmailCampaign::merge($c->subject, $sampleName, $sampleOrg);
            Mail::html($html, fn ($m) => $m->to($to)->subject('[TEST] ' . $subject));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Test send failed: ' . $e->getMessage()], 502);
        }

        return response()->json(['message' => 'Test sent to ' . $to . '.']);
    }

    // POST /api/admin/campaigns/{id}/send — queue delivery now.
    public function send(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $c = EmailCampaign::findOrFail($id);
        if (! in_array($c->status, ['draft', 'scheduled'], true)) {
            return response()->json(['message' => 'This campaign has already been sent.'], 422);
        }
        if (! MailConfig::isConfigured()) {
            return response()->json(['message' => 'SMTP is not configured (Email settings).'], 422);
        }

        $total = $this->recipientCount($c);
        if ($total < 1) return response()->json(['message' => 'This campaign has no recipients.'], 422);

        $c->update(['status' => 'sending', 'scheduled_at' => null, 'total_recipients' => $total, 'sent_count' => 0, 'failed_count' => 0, 'batch_cursor' => 0]);
        SendCampaignJob::dispatch($c->id);

        $note = $c->batch_size ? " First batch of {$c->batch_size}/day starts now." : '';
        return response()->json(['message' => "Sending to {$total} recipient(s). Delivery runs in the background." . $note, 'total_recipients' => $total]);
    }

    // POST /api/admin/campaigns/{id}/schedule  { scheduled_at }
    public function schedule(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $c = EmailCampaign::findOrFail($id);
        if (! in_array($c->status, ['draft', 'scheduled'], true)) {
            return response()->json(['message' => 'This campaign can no longer be scheduled.'], 422);
        }
        if (! MailConfig::isConfigured()) {
            return response()->json(['message' => 'SMTP is not configured (Email settings).'], 422);
        }
        $data = $request->validate(['scheduled_at' => 'required|date|after:now']);

        $total = $this->recipientCount($c);
        if ($total < 1) return response()->json(['message' => 'This campaign has no recipients.'], 422);

        $when = \Illuminate\Support\Carbon::parse($data['scheduled_at']);
        $c->update(['status' => 'scheduled', 'scheduled_at' => $when, 'total_recipients' => $total, 'sent_count' => 0, 'failed_count' => 0, 'batch_cursor' => 0]);

        $note = $c->batch_size ? (' Then ' . $c->batch_size . '/day until all ' . $total . ' are sent.') : '';
        return response()->json(['message' => 'Scheduled for ' . $when->toDayDateTimeString() . '.' . $note, 'scheduled_at' => $when->toIso8601String()]);
    }

    // POST /api/admin/campaigns/{id}/cancel — revert a scheduled campaign to draft.
    public function cancel(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        $c = EmailCampaign::findOrFail($id);
        if ($c->status !== 'scheduled') {
            return response()->json(['message' => 'Only a scheduled campaign can be cancelled.'], 422);
        }
        $c->update(['status' => 'draft', 'scheduled_at' => null]);
        return response()->json(['message' => 'Schedule cancelled; back to draft.']);
    }

    // DELETE /api/admin/campaigns/{id} — remove a campaign (and its open/click events).
    // Blocked while actively sending so we don't yank a row out from under a running job;
    // cancel/finish first. Drafts, scheduled, sent and failed campaigns can all be deleted.
    public function destroy(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        $c = EmailCampaign::findOrFail($id);
        if ($c->status === 'sending') {
            return response()->json(['message' => 'This campaign is currently sending — wait until it finishes to delete it.'], 422);
        }
        \DB::table('email_campaign_events')->where('campaign_id', $c->id)->delete();
        $c->delete();
        return response()->json(['message' => 'Campaign deleted.']);
    }
}
