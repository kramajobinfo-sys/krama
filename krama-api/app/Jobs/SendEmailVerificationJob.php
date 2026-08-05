<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendEmailVerificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function handle(): void
    {
        // Re-fetch in case status changed between dispatch and execution
        $fresh = $this->user->fresh();

        if (! $fresh || $fresh->hasVerifiedEmail()) {
            return;
        }

        // SMTP lives in the settings table, not config/mail.php, and is applied per send
        // site. Without this the job used config's placeholder host and every verification
        // email failed silently — it runs afterResponse(), so nothing surfaced to the user.
        if (! \App\Helpers\MailConfig::isConfigured()) {
            \Illuminate\Support\Facades\Log::warning(
                'Email verification not sent — SMTP is not configured.', ['user_id' => $fresh->id]
            );

            return;
        }
        \App\Helpers\MailConfig::applyFromDb();

        try {
            $fresh->sendEmailVerificationNotification();
        } catch (\Throwable $e) {
            // Never let a mail failure escape: this runs after the response, so an
            // exception here would only ever land in the log as an unexplained error.
            \Illuminate\Support\Facades\Log::warning(
                'Email verification send failed: ' . $e->getMessage(), ['user_id' => $fresh->id]
            );
        }
    }
}
