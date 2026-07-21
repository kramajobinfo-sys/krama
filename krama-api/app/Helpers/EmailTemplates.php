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
            'rejected'    => ['Not selected','Thank you for applying. Unfortunately you were not selected for this role this time.'],
        ];

        [$label, $detail] = $labels[$stage] ?? [$stage, ''];

        $subject = "Application update: {$jobTitle} at {$companyName}";
        $color   = $stage === 'offered' ? '#16a34a' : ($stage === 'rejected' ? '#dc2626' : '#0369a1');
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
