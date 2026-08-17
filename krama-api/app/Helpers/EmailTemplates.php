<?php

namespace App\Helpers;

/**
 * Inline HTML email templates. No Blade views required.
 * All methods return a [subject, html] pair.
 */
class EmailTemplates
{
    // ── Candidate emails ─────────────────────────────────────────────────────

    public static function applicationStageChanged(string $candidateName, string $jobTitle, string $companyName, string $stage): array
    {
        $labels = [
            'reviewed'    => ['Reviewed',    'Your application is being reviewed by the hiring team.'],
            'shortlisted' => ['Shortlisted', 'Great news — you have been shortlisted for this role!'],
            'interview'   => ['Interview',   'You have been selected for an interview. The employer will be in touch with details.'],
            'offered'     => ['Offered',     'Congratulations! You have received a job offer for this position.'],
            'hired'       => ['Hired',       'Congratulations — you have been hired for this role! The employer will follow up with next steps.'],
            'rejected'    => ['Not selected','Thank you for applying. Unfortunately you were not selected for this role this time.'],
        ];

        [$label, $detail] = $labels[$stage] ?? [$stage, ''];

        $subject = "Application update: {$jobTitle} at {$companyName}";
        $color   = in_array($stage, ['offered', 'hired'], true) ? '#16a34a' : ($stage === 'rejected' ? '#dc2626' : '#0369a1');
        $html    = self::wrapper(
            "Application Update",
            "<p style='margin:0 0 12px'>Hello <strong>{$candidateName}</strong>,</p>
            <p style='margin:0 0 20px'>Your application for <strong>{$jobTitle}</strong> at <strong>{$companyName}</strong> has been updated.</p>
            <div style='background:{$color};color:#fff;border-radius:8px;padding:14px 20px;display:inline-block;font-size:15px;font-weight:600;margin-bottom:20px'>{$label}</div>
            <p style='margin:0 0 12px;color:#374151'>{$detail}</p>
            <p style='margin:0;color:#6b7280;font-size:13px'>Log in to your account to view your full application history.</p>"
        );

        return [$subject, $html];
    }

    public static function interviewScheduled(string $candidateName, string $jobTitle, $iv): array
    {
        $TYPE  = ['phone' => 'Phone interview', 'video' => 'Video interview', 'in_person' => 'In-person interview'];
        $label = $TYPE[$iv->type] ?? 'Interview';
        $when  = $iv->scheduled_at ? $iv->scheduled_at->format('l, j F Y \a\t H:i') : 'To be confirmed';
        $tz    = $iv->timezone ? ' (' . $iv->timezone . ')' : '';
        $where = $iv->type === 'in_person'
            ? ($iv->location ? ('<p style=\'margin:0 0 8px;color:#374151\'>📍 ' . htmlspecialchars($iv->location) . '</p>') : '')
            : ($iv->meeting_url ? ('<p style=\'margin:0 0 8px;color:#374151\'>🔗 <a href=\'' . htmlspecialchars($iv->meeting_url) . '\'>' . htmlspecialchars($iv->meeting_url) . '</a></p>') : '');

        $subject = "Interview scheduled: {$jobTitle}";
        $html = self::wrapper(
            'Interview Scheduled',
            "<p style='margin:0 0 12px'>Hello <strong>{$candidateName}</strong>,</p>
            <p style='margin:0 0 18px'>You have been scheduled for an interview for <strong>{$jobTitle}</strong>.</p>
            <div style='background:#0369a1;color:#fff;border-radius:8px;padding:14px 20px;display:inline-block;font-size:15px;font-weight:600;margin-bottom:18px'>{$label}</div>
            <p style='margin:0 0 8px;color:#374151'>🗓 {$when}{$tz}</p>
            {$where}
            <p style='margin:14px 0 0;color:#6b7280;font-size:13px'>Log in to your account for the full details. The employer may contact you to confirm.</p>"
        );

        return [$subject, $html];
    }

    public static function invitedToApply(string $candidateName, string $jobTitle, string $companyName, ?string $message): array
    {
        $note = $message ? "<div style='background:#f8fafc;border-left:3px solid #0369a1;border-radius:4px;padding:12px 16px;margin:0 0 18px;color:#374151;font-size:14px'>" . nl2br(htmlspecialchars($message)) . "</div>" : '';
        $subject = "You're invited to apply: {$jobTitle}";
        $html = self::wrapper(
            'Invitation to Apply',
            "<p style='margin:0 0 12px'>Hello <strong>{$candidateName}</strong>,</p>
            <p style='margin:0 0 18px'><strong>{$companyName}</strong> reviewed your profile and would like to invite you to apply for <strong>{$jobTitle}</strong>.</p>
            {$note}
            <p style='margin:0;color:#6b7280;font-size:13px'>Log in to your account to view the role and apply. This invitation expires in 30 days.</p>"
        );
        return [$subject, $html];
    }

    // ── Employer emails ───────────────────────────────────────────────────────

    public static function newApplicationReceived(string $employerName, string $jobTitle, string $candidateName): array
    {
        $subject = "New application for: {$jobTitle}";
        $html    = self::wrapper(
            "New Application Received",
            "<p style='margin:0 0 12px'>Hello <strong>{$employerName}</strong>,</p>
            <p style='margin:0 0 20px'>A new candidate has applied for your job posting.</p>
            <table style='width:100%;border-collapse:collapse;margin-bottom:20px'>
              <tr><td style='padding:10px 14px;background:#f3f4f6;border-radius:6px 6px 0 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em'>Position</td></tr>
              <tr><td style='padding:10px 14px;border:1px solid #e5e7eb;border-radius:0 0 6px 6px;font-weight:600;color:#111827'>{$jobTitle}</td></tr>
            </table>
            <table style='width:100%;border-collapse:collapse;margin-bottom:24px'>
              <tr><td style='padding:10px 14px;background:#f3f4f6;border-radius:6px 6px 0 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em'>Applicant</td></tr>
              <tr><td style='padding:10px 14px;border:1px solid #e5e7eb;border-radius:0 0 6px 6px;font-weight:600;color:#111827'>{$candidateName}</td></tr>
            </table>
            <p style='margin:0;color:#6b7280;font-size:13px'>Log in to your employer dashboard to review the application and move it through your pipeline.</p>"
        );

        return [$subject, $html];
    }

    public static function jobApproved(string $employerName, string $jobTitle): array
    {
        $subject = "Your job is now live: {$jobTitle}";
        $html    = self::wrapper(
            "Job Published",
            "<p style='margin:0 0 12px'>Hello <strong>{$employerName}</strong>,</p>
            <p style='margin:0 0 20px'>Great news — your job posting has been approved and is now live on the platform.</p>
            <div style='background:#16a34a;color:#fff;border-radius:8px;padding:14px 20px;margin-bottom:20px'>
              <div style='font-size:12px;opacity:.8;margin-bottom:4px'>PUBLISHED</div>
              <div style='font-size:16px;font-weight:600'>{$jobTitle}</div>
            </div>
            <p style='margin:0;color:#6b7280;font-size:13px'>Candidates can now find and apply for your role. Log in to your employer dashboard to track applicants.</p>"
        );

        return [$subject, $html];
    }

    public static function jobRejected(string $employerName, string $jobTitle, string $reason): array
    {
        $subject = "Action required: {$jobTitle}";
        $html    = self::wrapper(
            "Job Not Approved",
            "<p style='margin:0 0 12px'>Hello <strong>{$employerName}</strong>,</p>
            <p style='margin:0 0 20px'>Your job posting requires some changes before it can be published.</p>
            <div style='background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px 20px;margin-bottom:20px'>
              <div style='font-size:12px;color:#dc2626;font-weight:600;margin-bottom:6px'>REASON</div>
              <div style='color:#374151'>" . htmlspecialchars($reason) . "</div>
            </div>
            <p style='margin:0;color:#6b7280;font-size:13px'>Please update your job posting and resubmit for approval. Log in to your employer dashboard to make changes.</p>"
        );

        return [$subject, $html];
    }

    // ── Password reset ───────────────────────────────────────────────────────

    public static function passwordReset(string $name, string $resetUrl): array
    {
        $subject = 'Reset your Krama password';
        $body = "
<p style='margin:0 0 18px;color:#374151'>Hi {$name},</p>
<p style='margin:0 0 20px;color:#374151'>We received a request to reset the password for your Krama account. Click the button below to choose a new password.</p>
<div style='text-align:center;margin-bottom:24px'>
  <a href='{$resetUrl}' style='display:inline-block;background:#0d9488;color:#fff;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px'>Reset password</a>
</div>
<p style='margin:0 0 16px;color:#6b7280;font-size:13px'>This link expires in 60 minutes. If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
<p style='margin:0;color:#9ca3af;font-size:12px;word-break:break-all'>If the button doesn't work, copy and paste this link into your browser:<br>{$resetUrl}</p>";

        return [$subject, self::wrapper('Reset your password', $body)];
    }

    // ── Shared wrapper ────────────────────────────────────────────────────────

    // ── Company follower: new job posted ─────────────────────────────────────

    public static function newJobFromFollowedCompany(string $candidateName, string $companyName, string $jobTitle, string $location, string $jobType, string $jobUrl): array
    {
        $subject = "{$companyName} just posted a new job: {$jobTitle}";
        $typeLabel = ucwords(str_replace('_', ' ', $jobType));
        $body = "
<p style='margin:0 0 18px;color:#374151'>Hi {$candidateName},</p>
<p style='margin:0 0 18px;color:#374151'>A company you follow has just posted a new role:</p>
<div style='border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin-bottom:24px'>
  <div style='font-size:15px;color:#6b7280;font-weight:600;margin-bottom:4px'>{$companyName}</div>
  <div style='font-size:18px;font-weight:700;color:#111827;margin-bottom:4px'>{$jobTitle}</div>
  <div style='color:#9ca3af;font-size:14px;margin-bottom:14px'>" . ($location ? "{$location} &bull; " : "") . "{$typeLabel}</div>
  <a href='{$jobUrl}' style='display:inline-block;background:#0d9488;color:#fff;font-weight:600;text-decoration:none;padding:10px 22px;border-radius:8px;font-size:14px'>View job &rarr;</a>
</div>
<p style='margin:0;color:#9ca3af;font-size:13px'>You received this because you follow {$companyName} on Krama.</p>";
        return [$subject, self::wrapper("New job at {$companyName}", $body)];
    }

    // ── Job alert match ──────────────────────────────────────────────────────

    public static function jobAlertMatch(string $candidateName, string $jobTitle, string $companyName, string $location, string $jobType, string $jobUrl): array
    {
        $subject = "New job alert: {$jobTitle} at {$companyName}";
        $typeLabel = ucwords(str_replace('_', ' ', $jobType));
        $body = "
<p style='margin:0 0 18px;color:#374151'>Hi {$candidateName},</p>
<p style='margin:0 0 18px;color:#374151'>A new role matching your job alert has just been posted:</p>
<div style='border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin-bottom:24px'>
  <div style='font-size:18px;font-weight:700;color:#111827;margin-bottom:4px'>{$jobTitle}</div>
  <div style='color:#6b7280;font-size:14px;margin-bottom:12px'>{$companyName}" . ($location ? " &bull; {$location}" : "") . " &bull; {$typeLabel}</div>
  <a href='{$jobUrl}' style='display:inline-block;background:#0d9488;color:#fff;font-weight:600;text-decoration:none;padding:10px 22px;border-radius:8px;font-size:14px'>View job &rarr;</a>
</div>
<p style='margin:0;color:#9ca3af;font-size:13px'>You received this because you created a job alert on Krama. <a href='{$jobUrl}' style='color:#0d9488'>Manage alerts</a></p>";
        return [$subject, self::wrapper("New matching job posted", $body)];
    }

    // ── Forum digest ─────────────────────────────────────────────────────────

    // $threads: list of ['title' => string, 'url' => string, 'count' => int]
    public static function forumDigest(string $userName, array $threads): array
    {
        $total   = array_sum(array_column($threads, 'count'));
        $subject = "New activity in " . count($threads) . " " . (count($threads) === 1 ? 'thread' : 'threads') . " you follow";

        $rows = '';
        foreach ($threads as $t) {
            $n = (int) $t['count'];
            $label = $n . ' new ' . ($n === 1 ? 'reply' : 'replies');
            $rows .= "
<div style='border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:14px'>
  <div style='font-size:16px;font-weight:700;color:#111827;margin-bottom:4px'>" . e($t['title']) . "</div>
  <div style='color:#6b7280;font-size:14px;margin-bottom:12px'>{$label}</div>
  <a href='{$t['url']}' style='display:inline-block;background:#0d9488;color:#fff;font-weight:600;text-decoration:none;padding:9px 20px;border-radius:8px;font-size:14px'>View discussion &rarr;</a>
</div>";
        }

        $body = "
<p style='margin:0 0 18px;color:#374151'>Hi {$userName},</p>
<p style='margin:0 0 22px;color:#374151'>There " . ($total === 1 ? 'has' : 'have') . " been {$total} new " . ($total === 1 ? 'reply' : 'replies') . " in the community " . (count($threads) === 1 ? 'thread' : 'threads') . " you follow:</p>
{$rows}
<p style='margin:18px 0 0;color:#9ca3af;font-size:13px'>You received this because you follow " . (count($threads) === 1 ? 'this thread' : 'these threads') . " on Krama. Open a thread to unfollow it.</p>";

        return [$subject, self::wrapper('Community digest', $body)];
    }

    // Invoice / payment receipt. The PDF is attached to the email separately.
    public static function invoice(string $companyName, string $invoiceNo, string $description, string $amount, string $dateStr, string $method): array
    {
        $subject = 'Your Krama invoice ' . $invoiceNo;
        $company = htmlspecialchars($companyName, ENT_QUOTES, 'UTF-8');
        $desc    = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
        $meth    = htmlspecialchars($method, ENT_QUOTES, 'UTF-8');
        $row = function ($label, $value, $strong = false) {
            $vw = $strong ? 'font-weight:700;color:#111827' : 'color:#111827';
            return "<tr>
                <td style='padding:8px 0;color:#6b7280;font-size:14px'>{$label}</td>
                <td style='padding:8px 0;text-align:right;font-size:14px;{$vw}'>{$value}</td>
              </tr>";
        };
        $body = "
          <p style='margin:0 0 16px;color:#374151;font-size:14px;line-height:1.6'>Hi {$company}, thank you for your payment. Your invoice is confirmed and attached to this email as a PDF.</p>
          <div style='display:inline-block;background:#ecfdf5;color:#047857;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;margin-bottom:16px'>PAID</div>
          <table style='width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb'>
            " . $row('Invoice', $invoiceNo) . $row('Description', $desc) . $row('Payment method', $meth) . $row('Date', $dateStr) . $row('Amount', $amount, true) . "
          </table>
          <p style='margin:20px 0 0;color:#6b7280;font-size:13px;line-height:1.6'>You can also download this invoice anytime from your Employer Dashboard under <strong>Plan &amp; billing</strong>.</p>
        ";
        return [$subject, self::wrapper('Invoice ' . $invoiceNo, $body)];
    }

    // ── Premium homepage slot ────────────────────────────────────────────────

    public static function premiumRenewalReminder(string $employerName, int $daysLeft, string $untilDate, string $manageUrl): array
    {
        $d = $daysLeft . ' day' . ($daysLeft === 1 ? '' : 's');
        $subject = "Your Premium slot expires in {$d}";
        $html = self::wrapper(
            'Premium expiring soon',
            "<p style='margin:0 0 12px'>Hello <strong>" . htmlspecialchars($employerName) . "</strong>,</p>
            <p style='margin:0 0 20px'>Your company's <strong>Premium homepage placement</strong> ends on <strong>{$untilDate}</strong> — {$d} left. Renew now to keep your gold-highlighted spot above the Featured companies.</p>
            <p style='margin:0 0 24px'><a href='{$manageUrl}' style='display:inline-block;background:#0d7a68;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600'>Renew premium</a></p>
            <p style='margin:0;color:#6b7280;font-size:13px'>If it lapses, your company simply returns to the regular listings — you can re-purchase anytime.</p>"
        );
        return [$subject, $html];
    }

    public static function premiumSlotAvailable(string $employerName, string $manageUrl): array
    {
        $subject = 'A Premium slot just opened up';
        $html = self::wrapper(
            'Premium slot available',
            "<p style='margin:0 0 12px'>Hello <strong>" . htmlspecialchars($employerName) . "</strong>,</p>
            <p style='margin:0 0 20px'>Good news — a <strong>Premium homepage slot</strong> is now available and your company is near the top of the waitlist. Slots are limited and first-come, so claim it before someone else does.</p>
            <p style='margin:0 0 24px'><a href='{$manageUrl}' style='display:inline-block;background:#0d7a68;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600'>Get your premium slot</a></p>
            <p style='margin:0;color:#6b7280;font-size:13px'>Featured above the regular companies with a gold highlight.</p>"
        );
        return [$subject, $html];
    }

    private static function wrapper(string $heading, string $body): string
    {
        $fromName = config('mail.from.name', 'Krama');
        return "
<!DOCTYPE html>
<html>
<head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'></head>
<body style='margin:0;padding:0;background:#f3f4f6;font-family:system-ui,-apple-system,sans-serif'>
  <div style='max-width:600px;margin:40px auto;padding:0 16px'>
    <div style='background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)'>
      <div style='background:#0d9488;padding:24px 32px'>
        <div style='color:#fff;font-size:20px;font-weight:700'>{$fromName}</div>
      </div>
      <div style='padding:32px'>
        <h2 style='margin:0 0 20px;color:#111827;font-size:18px'>{$heading}</h2>
        {$body}
      </div>
      <div style='padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#9ca3af'>
        This is an automated message from {$fromName}. Please do not reply to this email.
      </div>
    </div>
  </div>
</body>
</html>";
    }
}
