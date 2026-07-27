<?php

namespace App\Services;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\Payment;
use App\Models\Setting;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Builds a professional Krama invoice PDF for a paid Payment and delivers it
 * (email with the PDF attached + Telegram document to the admin channel and,
 * if set, the employer's own chat). Also used by the download endpoint.
 */
class InvoiceService
{
    // Human display number for the invoice.
    public static function number(Payment $payment): string
    {
        return $payment->invoice_no ?: ('#' . $payment->id);
    }

    public static function filename(Payment $payment): string
    {
        $no = $payment->invoice_no ?: ('PAY-' . $payment->id);
        return 'Krama-Invoice-' . preg_replace('/[^A-Za-z0-9\-]/', '', $no) . '.pdf';
    }

    // [description, sub-line] for the single invoice line, per payment purpose.
    private static function lineItem(Payment $payment): array
    {
        if ($payment->purpose === 'featured_boost') {
            $title = optional($payment->job)->title;
            return ['Featured job boost', $title ? ('Job: ' . $title) : ''];
        }
        if ($payment->purpose === 'cv_credits') {
            $n = (int) ($payment->credits ?: 0);
            return [($n ? $n . ' × ' : '') . 'CV-match credits', ''];
        }
        // Subscription (default)
        $plan = optional($payment->subscription)->plan;
        $intervalMap = ['month' => 'Monthly', 'year' => 'Yearly', 'once' => 'One-time'];
        $interval = $plan ? ($intervalMap[$plan->interval] ?? ucfirst((string) $plan->interval)) : '';
        $desc = ($plan->name ?? 'Krama') . ' plan' . ($interval ? ' — ' . $interval : '');
        $period = '';
        $sub = $payment->subscription;
        if ($sub && $sub->started_at) {
            $start = \Illuminate\Support\Carbon::parse($sub->started_at)->format('M j, Y');
            $end   = $sub->renews_at ? \Illuminate\Support\Carbon::parse($sub->renews_at)->format('M j, Y') : null;
            $period = 'Billing period: ' . $start . ($end ? ' – ' . $end : '');
        }
        return [$desc, $period];
    }

    private static function money($amount, $currency): string
    {
        $cur = strtoupper((string) ($currency ?: 'USD'));
        $num = number_format((float) $amount, 2);
        return $cur === 'USD' ? ('$' . $num) : ($num . ' ' . $cur);
    }

    private static function methodLabel($m): string
    {
        $map = [
            'khqr' => 'KHQR (Bakong)', 'bakong' => 'KHQR (Bakong)', 'aba' => 'ABA PayWay',
            'stripe' => 'Card (Stripe)', 'card' => 'Card', 'wing' => 'Wing', 'cash' => 'Cash',
            'cod' => 'Cash on delivery', 'manual' => 'Manual / Admin', 'free' => 'Free',
        ];
        $key = strtolower((string) $m);
        return $map[$key] ?? ($m ? ucfirst((string) $m) : 'Online');
    }

    // The invoice document as HTML (dompdf-compatible: tables + inline styles).
    public static function html(Payment $payment): string
    {
        $payment->loadMissing('company.owner', 'subscription.plan', 'job');
        $company = $payment->company;

        $smtp      = Setting::where('group', 'smtp')->pluck('value', 'key')->toArray();
        $fromName  = $smtp['from_name'] ?? 'Krama';
        $fromEmail = $smtp['from_address'] ?? '';

        $no       = self::number($payment);
        $dateStr  = optional($payment->paid_at ?: $payment->created_at)->format('F j, Y') ?: date('F j, Y');
        $amount   = self::money($payment->amount, $payment->currency);
        $method   = self::methodLabel($payment->method);
        [$desc, $period] = self::lineItem($payment);

        $companyName    = $company->name ?? 'Customer';
        $companyAddress = $company->address ?? '';
        $ownerEmail     = optional(optional($company)->owner)->email ?? '';

        $e = fn ($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
        $teal = '#0d9488';

        $addrLine = $companyAddress ? "<div style='color:#6b7280;margin-top:2px'>" . $e($companyAddress) . "</div>" : '';
        $ownerLine = $ownerEmail ? "<div style='color:#6b7280;margin-top:2px'>" . $e($ownerEmail) . "</div>" : '';
        $fromEmailLine = $fromEmail ? "<div style='color:#6b7280;margin-top:2px'>" . $e($fromEmail) . "</div>" : '';
        $periodLine = $period ? "<div style='color:#6b7280;margin-top:3px;font-size:11px'>" . $e($period) . "</div>" : '';

        return "<!DOCTYPE html><html><head><meta charset='utf-8'></head>
<body style='margin:0;font-family:Helvetica,Arial,sans-serif;color:#111827;font-size:12px'>
  <div style='padding:38px 42px'>
    <table style='width:100%;border-collapse:collapse'>
      <tr>
        <td style='vertical-align:top'>
          <div style='font-size:24px;font-weight:bold;letter-spacing:3px;color:{$teal}'>KRAMA</div>
          <div style='color:#6b7280;margin-top:4px'>Jobs &amp; Hiring — Cambodia</div>
        </td>
        <td style='vertical-align:top;text-align:right'>
          <div style='font-size:26px;font-weight:bold;letter-spacing:2px;color:{$teal}'>INVOICE</div>
          <div style='margin-top:6px;font-weight:bold'>" . $e($no) . "</div>
          <div style='color:#6b7280'>" . $e($dateStr) . "</div>
        </td>
      </tr>
    </table>

    <table style='width:100%;border-collapse:collapse;margin-top:30px'>
      <tr>
        <td style='vertical-align:top;width:50%'>
          <div style='color:#9ca3af;text-transform:uppercase;font-size:10px;letter-spacing:1px'>From</div>
          <div style='font-weight:bold;margin-top:4px'>" . $e($fromName) . "</div>
          {$fromEmailLine}
        </td>
        <td style='vertical-align:top;width:50%'>
          <div style='color:#9ca3af;text-transform:uppercase;font-size:10px;letter-spacing:1px'>Bill to</div>
          <div style='font-weight:bold;margin-top:4px'>" . $e($companyName) . "</div>
          {$addrLine}
          {$ownerLine}
        </td>
      </tr>
    </table>

    <div style='margin-top:26px'>
      <span style='color:#047857;border:2px solid #047857;padding:4px 14px;font-weight:bold;font-size:13px;border-radius:6px'>PAID</span>
    </div>

    <table style='width:100%;border-collapse:collapse;margin-top:18px'>
      <tr>
        <th style='text-align:left;background:{$teal};color:#fff;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.5px'>Description</th>
        <th style='text-align:right;background:{$teal};color:#fff;padding:10px 12px;font-size:11px;text-transform:uppercase;letter-spacing:.5px'>Amount</th>
      </tr>
      <tr>
        <td style='padding:12px;border-bottom:1px solid #e5e7eb'>" . $e($desc) . "{$periodLine}</td>
        <td style='padding:12px;border-bottom:1px solid #e5e7eb;text-align:right'>" . $e($amount) . "</td>
      </tr>
    </table>

    <table style='width:100%;border-collapse:collapse;margin-top:10px'>
      <tr><td style='padding:6px 12px;text-align:right;color:#6b7280;width:80%'>Subtotal</td><td style='padding:6px 12px;text-align:right'>" . $e($amount) . "</td></tr>
      <tr><td style='padding:6px 12px;text-align:right;color:#6b7280'>Tax</td><td style='padding:6px 12px;text-align:right'>—</td></tr>
      <tr>
        <td style='padding:10px 12px;text-align:right;font-size:15px;font-weight:bold;color:{$teal};border-top:2px solid #e5e7eb'>Total paid</td>
        <td style='padding:10px 12px;text-align:right;font-size:15px;font-weight:bold;color:{$teal};border-top:2px solid #e5e7eb'>" . $e($amount) . "</td>
      </tr>
    </table>

    <table style='width:100%;border-collapse:collapse;margin-top:18px'>
      <tr><td style='padding:4px 12px;color:#6b7280'>Payment method</td><td style='padding:4px 12px;text-align:right'>" . $e($method) . "</td></tr>
      <tr><td style='padding:4px 12px;color:#6b7280'>Status</td><td style='padding:4px 12px;text-align:right'>Paid</td></tr>
    </table>

    <div style='margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:11px;line-height:1.7'>
      Thank you for choosing Krama. Payments are accepted via KHQR, ABA, and Wing.<br>
      This invoice was generated automatically. " . ($fromEmail ? ('For questions, contact ' . $e($fromEmail) . '.') : '') . "
    </div>
  </div>
</body></html>";
    }

    // Render the invoice to PDF bytes (dompdf 3.x, used directly — the Laravel wrapper
    // requires Laravel 9+). Remote/file fetching is disabled: the invoice HTML is
    // self-contained (no images/URLs), which also sidesteps dompdf's SVG/data-URI issues.
    public static function pdf(Payment $payment): string
    {
        $options = new Options();
        $options->set('isRemoteEnabled', false);
        $options->set('isPhpEnabled', false);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml(self::html($payment));
        $dompdf->setPaper('a4');
        $dompdf->render();

        return (string) $dompdf->output();
    }

    // Deliver a paid invoice: email (PDF attached) + Telegram (admin channel + employer chat).
    // Never throws — logs and swallows each channel independently.
    public static function deliver(Payment $payment): void
    {
        $payment->loadMissing('company.owner', 'subscription.plan', 'job');
        $company = $payment->company;
        if (! $company) return;

        try {
            $pdf = self::pdf($payment);
        } catch (\Throwable $e) {
            Log::warning('Invoice PDF generation failed: ' . $e->getMessage());
            return;
        }
        $filename = self::filename($payment);
        [$desc] = self::lineItem($payment);
        $amount  = self::money($payment->amount, $payment->currency);
        $dateStr = optional($payment->paid_at ?: $payment->created_at)->format('F j, Y') ?: date('F j, Y');
        $method  = self::methodLabel($payment->method);

        // 1) Email the company owner with the PDF attached.
        try {
            $owner = $company->owner;
            if ($owner && $owner->email && MailConfig::isConfigured()) {
                MailConfig::applyFromDb();
                [$subject, $bodyHtml] = EmailTemplates::invoice($company->name, self::number($payment), $desc, $amount, $dateStr, $method);
                Mail::html($bodyHtml, function ($m) use ($owner, $subject, $pdf, $filename) {
                    $m->to($owner->email, $owner->name)->subject($subject)
                      ->attachData($pdf, $filename, ['mime' => 'application/pdf']);
                });
            }
        } catch (\Throwable $e) {
            Log::warning('Invoice email failed: ' . $e->getMessage());
        }

        // 2) Telegram — admin channel + optional employer chat id (shared bot).
        try {
            $caption = "🧾 <b>Invoice " . htmlspecialchars(self::number($payment), ENT_QUOTES, 'UTF-8') . "</b>\n"
                . htmlspecialchars((string) $company->name, ENT_QUOTES, 'UTF-8') . " — " . htmlspecialchars($amount, ENT_QUOTES, 'UTF-8')
                . " (" . htmlspecialchars($method, ENT_QUOTES, 'UTF-8') . ")";
            TelegramService::sendDocumentTo(TelegramService::adminChatId(), $pdf, $filename, $caption);
            if (! empty($company->telegram_chat_id)) {
                TelegramService::sendDocumentTo($company->telegram_chat_id, $pdf, $filename, $caption);
            }
        } catch (\Throwable $e) {
            Log::warning('Invoice telegram failed: ' . $e->getMessage());
        }
    }
}
