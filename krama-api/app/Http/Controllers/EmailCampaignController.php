<?php

namespace App\Http\Controllers;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Jobs\SendCampaignJob;
use App\Models\EmailCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

/**
 * Admin email-marketing campaigns: compose an HTML message, pick an audience segment,
 * preview the recipient count, send a test, then send. Delivery runs on the queue
 * (SendCampaignJob) with per-recipient unsubscribe + marketing opt-out honoured.
 */
class EmailCampaignController extends Controller
{
    private const AUDIENCES = ['all_candidates', 'all_employers', 'all_users'];

    // GET /api/admin/campaigns
    public function index()
    {
        $this->requirePermission('site_settings');

        $rows = EmailCampaign::orderByDesc('id')->limit(100)->get();

        return response()->json([
            'data' => $rows->map(fn ($c) => [
                'id' => $c->id, 'subject' => $c->subject, 'audience' => $c->audience,
                'status' => $c->status, 'total_recipients' => $c->total_recipients,
                'sent_count' => $c->sent_count, 'failed_count' => $c->failed_count,
                'opens' => (int) ($c->opens ?? 0), 'clicks' => (int) ($c->clicks ?? 0),
                'created_at' => $c->created_at, 'sent_at' => $c->sent_at,
            ]),
            'smtp_configured' => MailConfig::isConfigured(),
        ]);
    }

    // GET /api/admin/campaigns/audience-count?audience=all_candidates
    public function audienceCount(Request $request)
    {
        $this->requirePermission('site_settings');
        $audience = $request->query('audience', 'all_candidates');
        if (! in_array($audience, self::AUDIENCES, true)) return response()->json(['count' => 0]);

        return response()->json(['count' => SendCampaignJob::audienceQuery($audience)->count()]);
    }

    // POST /api/admin/campaigns  { subject, body, audience }
    public function store(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'subject'  => 'required|string|max:200',
            'body'     => 'required|string|max:100000',
            'audience' => 'required|in:' . implode(',', self::AUDIENCES),
        ]);

        $c = EmailCampaign::create([
            'subject'          => $data['subject'],
            'body'             => $data['body'],
            'audience'         => $data['audience'],
            'status'           => 'draft',
            'total_recipients' => SendCampaignJob::audienceQuery($data['audience'])->count(),
            'created_by'       => $request->user()->id,
        ]);

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
            $html = EmailTemplates::marketing($c->body, EmailCampaign::unsubUrl($request->user()->id));
            Mail::html($html, fn ($m) => $m->to($to)->subject('[TEST] ' . $c->subject));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Test send failed: ' . $e->getMessage()], 502);
        }

        return response()->json(['message' => 'Test sent to ' . $to . '.']);
    }

    // POST /api/admin/campaigns/{id}/send — queue delivery to the whole segment.
    public function send(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $c = EmailCampaign::findOrFail($id);
        if ($c->status !== 'draft') {
            return response()->json(['message' => 'This campaign has already been sent.'], 422);
        }
        if (! MailConfig::isConfigured()) {
            return response()->json(['message' => 'SMTP is not configured (Email settings).'], 422);
        }

        $total = SendCampaignJob::audienceQuery($c->audience)->count();
        $c->update(['status' => 'sending', 'total_recipients' => $total, 'sent_count' => 0, 'failed_count' => 0]);
        SendCampaignJob::dispatch($c->id);

        return response()->json(['message' => "Sending to {$total} recipient(s). Delivery runs in the background.", 'total_recipients' => $total]);
    }
}
