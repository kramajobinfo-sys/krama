<?php

namespace App\Services;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\Payment;
use App\Models\Setting;
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
        if ($cur === 'USD') return '$' . number_format((float) $amount, 2);
        // Khmer Riel has no minor unit — show a whole-riel amount. Use the "KHR " prefix (not the
        // ៛ glyph) so it renders in the invoice's Latin body font without needing the Khmer face.
        if ($cur === 'KHR') return 'KHR ' . number_format(round((float) $amount));
        return number_format((float) $amount, 2) . ' ' . $cur;
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

    // Brand logo as a self-contained data URI for embedding in the PDF (dompdf renders
    // data URIs even with remote fetching disabled). Prefers the admin-configured Brand
    // logo, falling back to the bundled KRAMA asset.
    private static function logoDataUri(): string
    {
        $brand = Setting::where('group', 'brand')->pluck('value', 'key')->toArray();
        $url   = (string) ($brand['logoUrl'] ?? '');
        if (strpos($url, 'data:image/') === 0) {
            return $url;
        }
        foreach ([base_path('../krama/assets/apple-touch-icon.png'), base_path('../krama/assets/krama-icon.png'), base_path('../krama/assets/LOGO KRAMA.jpg')] as $p) {
            if (is_file($p)) {
                $mime = preg_match('/\.jpe?g$/i', $p) ? 'image/jpeg' : 'image/png';
                return 'data:' . $mime . ';base64,' . base64_encode((string) file_get_contents($p));
            }
        }
        return '';
    }

    // USD → Khmer Riel string (whole riel) at the supplied rate. GDT requires the total
    // shown in KHR; the rate is snapshotted on the payment so the figure never drifts.
    private static function riel($usd, $rate): string
    {
        $khr = round(((float) $usd) * (float) $rate);
        return '៛' . number_format($khr);
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

        // Coupon snapshot — note it on the line item (always visible) and itemise it as a
        // discount row in the standard USD invoice below.
        $couponCode = trim((string) ($payment->coupon_code ?? ''));
        $couponDisc = (float) ($payment->coupon_discount ?? 0);
        $hasCoupon  = $couponCode !== '' && $couponDisc > 0;
        if ($hasCoupon) {
            $desc .= ' — coupon ' . $couponCode . ' applied';
        }

        $companyName    = $company->name ?? 'Customer';
        $companyAddress = $company->address ?? '';
        $ownerEmail     = optional(optional($company)->owner)->email ?? '';

        $e = fn ($s) => htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8');
        // Wrap Khmer text in the bundled Khmer font (Battambang) — dompdf picks one font per
        // element, so Khmer script must be isolated in its own span or it renders as tofu.
        $km = fn ($s) => "<span style=\"font-family:'khmer'\">" . htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8') . "</span>";
        $teal = '#0d9488';

        // Discount breakdown (e.g. a 20%-off Yearly plan): show the list price as the line item
        // plus a Discount row so the customer sees list − discount = total paid. Guarded so it only
        // shows when the plan's current effective price still reconciles with what was actually
        // paid (avoids a mismatched breakdown if the plan's discount was edited after payment).
        $invPlan = optional($payment->subscription)->plan;
        $paidAmt = (float) $payment->amount;
        $hasInvoiceDiscount = $invPlan && ! empty($invPlan->has_discount)
            && (float) $invPlan->price > $paidAmt
            && abs(((float) $invPlan->effective_price) - $paidAmt) < 0.01;
        $lineAmount = $hasInvoiceDiscount ? self::money($invPlan->price, $payment->currency) : $amount;
        $discountRow = '';
        if ($hasInvoiceDiscount) {
            $save = self::money($invPlan->price - $paidAmt, $payment->currency);
            $pct  = (int) $invPlan->discount_percent;
            $discountRow = "<tr><td style='padding:6px 12px;text-align:right;color:#6b7280'>Discount ({$pct}%)</td><td style='padding:6px 12px;text-align:right;color:#047857'>-" . $e($save) . "</td></tr>";
        }

        // Coupon discount row (standard USD invoice only — reconciles Subtotal − coupon = Total).
        // The tax/KHR invoices still apply the coupon (correct total) and note it on the line item.
        $couponRow = '';
        if ($hasCoupon && ! $payment->is_tax_invoice && strtoupper((string) $payment->currency) === 'USD') {
            $lineAmount = self::money(((float) $payment->amount) + $couponDisc, $payment->currency);
            $couponRow = "<tr><td style='padding:6px 12px;text-align:right;color:#6b7280'>Coupon (" . $e($couponCode) . ")</td><td style='padding:6px 12px;text-align:right;color:#047857'>-" . $e(self::money($couponDisc, $payment->currency)) . "</td></tr>";
        }

        // ── VAT / Tax invoice (Cambodia GDT — Prakas 723 / Instruction 1127). is_tax_invoice +
        // amounts + FX rate are snapshotted on the payment so the issued invoice is immutable.
        // Khmer is the primary language with English below (Khmer-language requirement); the
        // total is shown in Khmer Riel at the snapshotted rate (KHR-total requirement). ──
        $isTax      = (bool) $payment->is_tax_invoice;
        $docTitleKh = $isTax ? 'វិក្កយបត្រអាករ' : 'វិក្កយបត្រ';
        $docTitleEn = $isTax ? 'TAX INVOICE' : 'INVOICE';
        $taxSet     = Setting::where('group', 'tax')->pluck('value', 'key')->toArray();
        $supLegal   = $isTax ? (string) ($taxSet['supplier_legal_name'] ?? '') : '';
        $supLegalKh = $isTax ? (string) ($taxSet['supplier_legal_name_kh'] ?? '') : '';
        $supTin     = $isTax ? (string) ($taxSet['supplier_vat_tin'] ?? '') : '';
        $supAddr    = $isTax ? (string) ($taxSet['supplier_address'] ?? '') : '';
        $tinLabel   = $km('លេខអត្តសញ្ញាណកម្មសារពើពន្ធ') . " (VAT TIN)";
        $supLegalKhLine = $supLegalKh ? "<div style='margin-top:2px;font-weight:bold'>" . $km($supLegalKh) . "</div>" : '';
        $supLegalLine   = $supLegal   ? "<div style='margin-top:2px'>" . $e($supLegal) . "</div>" : '';
        $supTinLine     = $supTin     ? "<div style='color:#6b7280;margin-top:2px'>{$tinLabel}: " . $e($supTin) . "</div>" : '';
        $supAddrLine    = $supAddr    ? "<div style='color:#6b7280;margin-top:2px'>" . $e($supAddr) . "</div>" : '';
        $custTin   = (string) ($payment->customer_vat_tin ?? '');
        $custLegal = (string) ($payment->customer_legal_name ?? '');
        $custLegalLine = ($isTax && $custLegal && $custLegal !== $companyName) ? "<div style='margin-top:2px'>" . $e($custLegal) . "</div>" : '';
        $custTinLine   = ($isTax && $custTin) ? "<div style='color:#6b7280;margin-top:2px'>{$tinLabel}: " . $e($custTin) . "</div>" : '';

        if ($isTax) {
            $lineAmount = self::money($payment->subtotal, $payment->currency);
            $vatPct     = rtrim(rtrim(number_format((float) $payment->vat_rate, 2), '0'), '.');
            $vatMoney   = self::money($payment->vat_amount, $payment->currency);
            $fxRate     = (float) ($payment->fx_rate ?: ExchangeRateService::usdToKhr((float) ($taxSet['exchange_rate_khr'] ?? 0) ?: null));
            $totalKhr   = self::riel($payment->amount, $fxRate);
            $rateNote   = $km('អត្រាប្តូរប្រាក់') . ' / Exchange rate: ' . $km('៛' . number_format($fxRate)) . ' / US$1';
            $lblSub     = $km('សរុបរង (មិនរួមអាករ)') . '<div style=\'font-size:9px;color:#9ca3af\'>Subtotal (excl. VAT)</div>';
            $lblVat     = $km("អាករលើតម្លៃបន្ថែម ({$vatPct}%)") . '<div style=\'font-size:9px;color:#9ca3af\'>VAT (' . $vatPct . '%)</div>';
            $lblTot     = $km('សរុប (រួមអាករ)') . '<div style=\'font-size:9px;color:#d1fae5\'>Total (incl. VAT)</div>';
            $lblKhr     = $km('សរុបជាប្រាក់រៀល') . '<div style=\'font-size:9px;color:#9ca3af\'>Total in KHR</div>';
            $totalsTable = "<table style='width:100%;border-collapse:collapse;margin-top:10px'>
      <tr><td style='padding:5px 12px;text-align:right;color:#374151;width:70%;vertical-align:top'>{$lblSub}</td><td style='padding:5px 12px;text-align:right;vertical-align:top'>" . $e($lineAmount) . "</td></tr>
      <tr><td style='padding:5px 12px;text-align:right;color:#374151;vertical-align:top'>{$lblVat}</td><td style='padding:5px 12px;text-align:right;vertical-align:top'>" . $e($vatMoney) . "</td></tr>
      <tr><td style='padding:8px 12px;text-align:right;font-size:15px;font-weight:bold;color:#fff;background:{$teal};vertical-align:top'>{$lblTot}</td><td style='padding:8px 12px;text-align:right;font-size:15px;font-weight:bold;color:#fff;background:{$teal};vertical-align:top'>" . $e($amount) . "</td></tr>
      <tr><td style='padding:5px 12px;text-align:right;color:#374151;vertical-align:top'>{$lblKhr}</td><td style='padding:5px 12px;text-align:right;font-weight:bold;vertical-align:top'>{$km($totalKhr)}</td></tr>
    </table>
    <div style='text-align:right;color:#9ca3af;font-size:10px;margin-top:4px'>{$rateNote}</div>";
        } else {
            $totalsTable = "<table style='width:100%;border-collapse:collapse;margin-top:10px'>
      <tr><td style='padding:6px 12px;text-align:right;color:#6b7280;width:80%'>Subtotal</td><td style='padding:6px 12px;text-align:right'>" . $e($lineAmount) . "</td></tr>
      {$discountRow}
      {$couponRow}
      <tr><td style='padding:6px 12px;text-align:right;color:#6b7280'>Tax</td><td style='padding:6px 12px;text-align:right'>—</td></tr>
      <tr><td style='padding:10px 12px;text-align:right;font-size:15px;font-weight:bold;color:{$teal};border-top:2px solid #e5e7eb'>Total paid</td><td style='padding:10px 12px;text-align:right;font-size:15px;font-weight:bold;color:{$teal};border-top:2px solid #e5e7eb'>" . $e($amount) . "</td></tr>
    </table>";
        }

        $addrLine = $companyAddress ? "<div style='color:#6b7280;margin-top:2px'>" . $e($companyAddress) . "</div>" : '';
        $ownerLine = $ownerEmail ? "<div style='color:#6b7280;margin-top:2px'>" . $e($ownerEmail) . "</div>" : '';
        $fromEmailLine = $fromEmail ? "<div style='color:#6b7280;margin-top:2px'>" . $e($fromEmail) . "</div>" : '';
        $periodLine = $period ? "<div style='color:#6b7280;margin-top:3px;font-size:11px'>" . $e($period) . "</div>" : '';

        // Logo (data URI) + document title with Khmer primary / English secondary.
        $logo = self::logoDataUri();
        $logoBlock = $logo
            ? "<img src='" . $logo . "' alt='KRAMA' style='height:48px;display:block' />"
            : "<div style='font-size:24px;font-weight:bold;letter-spacing:3px;color:{$teal}'>KRAMA</div>";

        // Seller signature block — required on Cambodian tax invoices (name + signature of
        // seller). A signing space, then a rule, then the bilingual caption centred below it.
        $signatureBlock = $isTax ? "
    <table style='width:100%;border-collapse:collapse;margin-top:34px'>
      <tr>
        <td style='width:56%'></td>
        <td style='width:44%;vertical-align:bottom'>
          <div style='height:46px'></div>
          <div style='border-top:1px solid #9ca3af;padding-top:7px;text-align:center'>
            <div style='color:#374151'>{$km('ហត្ថលេខា និងឈ្មោះអ្នកលក់')}</div>
            <div style='color:#9ca3af;font-size:10px;margin-top:2px'>Seller's signature &amp; name</div>
          </div>
        </td>
      </tr>
    </table>" : "";

        $descHead = $km('បរិយាយ') . " / Description";
        $amtHead  = $km('ចំនួនទឹកប្រាក់') . " / Amount";
        $fromHead = $km('អ្នកផ្គត់ផ្គង់') . " / Supplier";
        $billHead = $km('អតិថិជន') . " / Bill to";
        $mLabel   = $km('មធ្យោបាយបង់ប្រាក់') . " / Payment method";
        $sLabel   = $km('ស្ថានភាព') . " / Status";
        $paidTxt  = $km('បានបង់') . " / PAID";
        $noLabel  = $km('លេខ') . " / No.";
        $dateLabel = $km('កាលបរិច្ឆេទ') . " / Date";
        $docNoteKh = $isTax ? $km('នេះជាវិក្កយបត្រអាករបង្កើតដោយកុំព្យូទ័រ។') : $km('នេះជាវិក្កយបត្រដែលបង្កើតដោយស្វ័យប្រវត្តិ។');
        $docNoteEn = $isTax ? 'This is a computer-generated tax invoice.' : 'This invoice was generated automatically.';

        return "<!DOCTYPE html><html><head><meta charset='utf-8'></head>
<body style='margin:0;font-family:Helvetica,Arial,sans-serif;color:#111827;font-size:12px'>
  <div style='padding:24px 42px'>
    <table style='width:100%;border-collapse:collapse'>
      <tr>
        <td style='vertical-align:top'>
          {$logoBlock}
          <div style='color:#6b7280;margin-top:6px'>Jobs &amp; Hiring — Cambodia</div>
        </td>
        <td style='vertical-align:top;text-align:right'>
          <div style='font-size:22px;font-weight:bold;color:{$teal}'>{$km($docTitleKh)}</div>
          <div style='font-size:15px;font-weight:bold;letter-spacing:2px;color:{$teal}'>{$docTitleEn}</div>
          <div style='margin-top:8px;font-weight:bold'>{$noLabel}: " . $e($no) . "</div>
          <div style='color:#6b7280'>{$dateLabel}: " . $e($dateStr) . "</div>
        </td>
      </tr>
    </table>

    <table style='width:100%;border-collapse:collapse;margin-top:16px'>
      <tr>
        <td style='vertical-align:top;width:50%'>
          <div style='color:#9ca3af;font-size:10px;letter-spacing:1px'>{$fromHead}</div>
          <div style='font-weight:bold;margin-top:4px'>" . $e($fromName) . "</div>
          {$supLegalKhLine}{$supLegalLine}{$supTinLine}{$supAddrLine}
          {$fromEmailLine}
        </td>
        <td style='vertical-align:top;width:50%'>
          <div style='color:#9ca3af;font-size:10px;letter-spacing:1px'>{$billHead}</div>
          <div style='font-weight:bold;margin-top:4px'>" . $e($companyName) . "</div>
          {$custLegalLine}{$custTinLine}
          {$addrLine}
          {$ownerLine}
        </td>
      </tr>
    </table>

    <div style='margin-top:18px'>
      <span style='color:#047857;border:2px solid #047857;padding:4px 14px;font-weight:bold;font-size:13px;border-radius:6px'>{$paidTxt}</span>
    </div>

    <table style='width:100%;border-collapse:collapse;margin-top:14px'>
      <tr>
        <th style='text-align:left;background:{$teal};color:#fff;padding:10px 12px;font-size:11px;letter-spacing:.5px'>{$descHead}</th>
        <th style='text-align:right;background:{$teal};color:#fff;padding:10px 12px;font-size:11px;letter-spacing:.5px'>{$amtHead}</th>
      </tr>
      <tr>
        <td style='padding:12px;border-bottom:1px solid #e5e7eb'>" . $e($desc) . "{$periodLine}</td>
        <td style='padding:12px;border-bottom:1px solid #e5e7eb;text-align:right'>" . $e($lineAmount) . "</td>
      </tr>
    </table>

    {$totalsTable}

    <table style='width:100%;border-collapse:collapse;margin-top:14px'>
      <tr><td style='padding:4px 12px;color:#6b7280'>{$mLabel}</td><td style='padding:4px 12px;text-align:right'>" . $e($method) . "</td></tr>
      <tr><td style='padding:4px 12px;color:#6b7280'>{$sLabel}</td><td style='padding:4px 12px;text-align:right'>{$paidTxt}</td></tr>
    </table>
    {$signatureBlock}

    <div style='margin-top:20px;padding-top:10px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:11px;line-height:1.7'>
      {$km('សូមអរគុណសម្រាប់ការជ្រើសរើសសេវាកម្ម Krama។')} Thank you for choosing Krama.<br>
      {$docNoteKh} " . $docNoteEn . ($fromEmail ? (' ' . $km('សម្រាប់ព័ត៌មានបន្ថែម សូមទាក់ទង') . ' / For enquiries, contact ' . $e($fromEmail) . '.') : '') . "
    </div>
  </div>
</body></html>";
    }

    // Render the invoice to PDF bytes with mPDF. mPDF is used (not dompdf) specifically
    // because Khmer is a complex script: it needs OpenType shaping — stacking subscript
    // consonants (coeng) and reordering pre-base vowels. dompdf places glyphs in logical
    // order with no shaping, so Khmer comes out broken; mPDF applies GSUB/GPOS (useOTL).
    public static function pdf(Payment $payment): string
    {
        $tmp = storage_path('app/mpdf');
        if (! is_dir($tmp)) {
            @mkdir($tmp, 0775, true);
        }

        $defaultConfig     = (new \Mpdf\Config\ConfigVariables())->getDefaults();
        $defaultFontConfig = (new \Mpdf\Config\FontVariables())->getDefaults();

        $mpdf = new \Mpdf\Mpdf([
            'mode'             => 'utf-8',
            'format'           => 'A4',
            'tempDir'          => $tmp,
            'default_font'     => 'helvetica',
            'margin_left'      => 0,
            'margin_right'     => 0,
            'margin_top'       => 0,
            'margin_bottom'    => 0,
            // Auto-detect script runs and shape them (safety net for any stray Khmer).
            'autoScriptToLang' => true,
            'autoLangToFont'   => true,
            // Register the bundled Battambang Khmer font (family "khmer") with OpenType
            // layout enabled so coeng/vowel shaping is applied. The `khmeros` family that
            // ships with mPDF is the built-in fallback.
            'fontDir'  => array_merge($defaultConfig['fontDir'], [resource_path('fonts/khmer')]),
            'fontdata' => $defaultFontConfig['fontdata'] + [
                'khmer' => [
                    'R'      => 'Battambang-Regular.ttf',
                    'B'      => 'Battambang-Bold.ttf',
                    'useOTL' => 0xFF,
                ],
            ],
        ]);
        $mpdf->WriteHTML(self::html($payment));

        return $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN);
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
