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
                'status' => $c->status, 'scheduled_at' => $c->scheduled_at,
                'total_recipients' => $c->total_recipients,
                'sent_count' => $c->sent_count, 'failed_count' => $c->failed_count,
                'opens' => (int) ($c->opens ?? 0), 'clicks' => (int) ($c->clicks ?? 0),
                'created_at' => $c->created_at, 'sent_at' => $c->sent_at,
            ]),
            'smtp_configured' => MailConfig::isConfigured(),
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
        ]);

        $c = EmailCampaign::create([
            'subject'          => $data['subject'],
            'body'             => $data['body'],
            'audience'         => $data['audience'],
            'list_id'          => $data['audience'] === 'list' ? $data['list_id'] : null,
            'template_id'      => $data['template_id'] ?? null,
            'status'           => 'draft',
            'total_recipients' => 0,
            'created_by'       => $request->user()->id,
        ]);
        $c->update(['total_recipients' => $this->recipientCount($c)]);

        return response()->json(['message' => 'Campaign saved as draft.', 'id' => $c->id, 'total_recipients' => $c->total_recipients], 201);
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
        try {
            // Preview merge fields with the admin's own name + a sample org.
            $body = EmailCampaign::merge($c->body, $request->user()->name ?: 'there', 'Your Organization');
            $html = EmailTemplates::marketing($body, EmailCampaign::unsubUrl($request->user()->id));
            $subject = EmailCampaign::merge($c->subject, $request->user()->name ?: 'there', 'Your Organization');
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

        $c->update(['status' => 'sending', 'scheduled_at' => null, 'total_recipients' => $total, 'sent_count' => 0, 'failed_count' => 0]);
        SendCampaignJob::dispatch($c->id);

        return response()->json(['message' => "Sending to {$total} recipient(s). Delivery runs in the background.", 'total_recipients' => $total]);
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
        $c->update(['status' => 'scheduled', 'scheduled_at' => $when, 'total_recipients' => $total]);

        return response()->json(['message' => 'Scheduled for ' . $when->toDayDateTimeString() . '.', 'scheduled_at' => $when->toIso8601String()]);
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
}
