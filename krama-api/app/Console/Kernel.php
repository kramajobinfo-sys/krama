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
        $schedule->command('payments:verify-pending')->everyThreeMinutes()->withoutOverlapping();
        $schedule->command('forum:digest')->dailyAt('08:00');
        $schedule->command('queue:prune-failed', ['--hours' => 168])->weekly();
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
