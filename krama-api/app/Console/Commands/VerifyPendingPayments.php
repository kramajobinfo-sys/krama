<?php

namespace App\Console\Commands;

use App\Models\Payment;
use App\Models\Setting;
use App\Services\PaymentService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class VerifyPendingPayments extends Command
{
    protected $signature = 'payments:verify-pending';
    protected $description = 'Confirm pending KHQR (Bakong) + ABA (PayWay) payments against their gateways and fulfill the paid ones';

    public function handle(): int
    {
        $pay       = Setting::where('group', 'payment')->pluck('value', 'key')->toArray();
        $token     = trim($pay['bakong_token'] ?? '');
        $abaMid    = trim($pay['aba_merchant_id'] ?? '');
        $abaKey    = trim($pay['aba_api_key'] ?? '');
        $stripeKey = trim($pay['stripe_secret_key'] ?? '');

        if ($token === '' && ($abaMid === '' || $abaKey === '') && $stripeKey === '') {
            $this->info('No live gateway configured — skipping.');
            return self::SUCCESS;
        }

        // Recent pending payments for the configured gateways.
        $pending = Payment::where('status', 'pending')
            ->where('created_at', '>=', now()->subDays(7))
            ->where(function ($q) {
                $q->whereNotNull('md5')->orWhere('method', 'aba')
                  ->orWhere(function ($c) { $c->where('method', 'card')->whereNotNull('gateway_ref'); });
            })
            ->get();

        $confirmed = 0;
        foreach ($pending as $payment) {
            $paid = false;
            if ($payment->method === 'aba' && $abaMid !== '' && $abaKey !== '') {
                $paid = PaymentService::abaIsPaid($payment->invoice_no, $abaMid, $abaKey);
            } elseif ($payment->method === 'card' && $payment->gateway_ref && $stripeKey !== '') {
                $paid = PaymentService::stripeSessionPaid($payment->gateway_ref, $stripeKey);
            } elseif ($payment->md5 && $token !== '') {
                $paid = PaymentService::bakongIsPaid($payment->md5, $token);
            }

            if ($paid && PaymentService::fulfill($payment)) {
                $confirmed++;
                Log::channel('audit')->info('payment.gateway_verified', [
                    'payment_id' => $payment->id,
                    'method'     => $payment->method,
                    'amount'     => $payment->amount,
                    'via'        => 'scheduled',
                ]);
            }
        }

        $this->info("Checked {$pending->count()} pending payment(s), confirmed {$confirmed}.");

        return self::SUCCESS;
    }
}
