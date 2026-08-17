<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('tokens:prune')->daily()->at('03:00');
        $schedule->command('subscriptions:expire')->hourly();
        $schedule->command('jobs:expire')->dailyAt('00:05');
        $schedule->command('features:expire')->dailyAt('00:10');
        $schedule->command('premium:maintain')->dailyAt('00:20');
        $schedule->command('payments:verify-pending')->everyThreeMinutes()->withoutOverlapping();
        $schedule->command('forum:digest')->dailyAt('08:00');
        $schedule->command('feeds:import')->everySixHours()->withoutOverlapping();
        // Employer careers/ATS feeds → refresh native draft jobs
        $schedule->call(function () {
            \App\Models\CompanyJobFeed::where('enabled', true)->get()->each(function ($feed) {
                try { \App\Services\CompanyJobFeedService::sync($feed); } catch (\Throwable $e) {}
            });
        // NOTE: name() MUST precede withoutOverlapping() on a closure task — a CallbackEvent
        // builds its mutex from the name, so calling withoutOverlapping() first throws
        // "A scheduled event name is required to prevent overlapping." That exception is
        // raised while BUILDING the schedule, so it killed schedule:run outright and every
        // scheduled task on the server stopped silently (see git history for the incident).
        })->name('company-feeds-sync')->everySixHours()->withoutOverlapping();
        $schedule->command('queue:prune-failed', ['--hours' => 168])->weekly();

        // Drain the queue every minute (shared-host pattern: no long-running worker daemon).
        // Processes NotifyJobPublished (post-publish email/social fan-out) and any other
        // queued jobs (e.g. SendEmailVerificationJob) shortly after they are dispatched.
        // --stop-when-empty + --max-time keep each run short; withoutOverlapping avoids pile-up.
        $schedule->command('queue:work --stop-when-empty --max-time=55 --tries=2 --sleep=1')
            ->everyMinute()
            ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
