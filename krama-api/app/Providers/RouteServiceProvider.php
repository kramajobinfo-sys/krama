<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to the "home" route for your application.
     *
     * This is used by Laravel authentication to redirect users after login.
     *
     * @var string
     */
    public const HOME = '/home';

    /**
     * The controller namespace for the application.
     *
     * When present, controller route declarations will automatically be prefixed with this namespace.
     *
     * @var string|null
     */
    // protected $namespace = 'App\\Http\\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        $this->configureRateLimiting();

        $this->routes(function () {
            Route::prefix('api')
                ->middleware('api')
                ->namespace($this->namespace)
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->namespace($this->namespace)
                ->group(base_path('routes/web.php'));
        });
    }

    /**
     * Configure the rate limiters for the application.
     *
     * @return void
     */
    protected function configureRateLimiting()
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(optional($request->user())->id ?: $request->ip());
        });

        // Stricter limiter for credential endpoints (login, register, refresh).
        // 5 attempts per minute per IP prevents brute-force password attacks.
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // ── Candidate-database reads (employer talent search) ────────────────────────────
        // The searchable candidate pool is the asset employers pay for, so these reads are
        // metered to make bulk scraping impractical while staying invisible to real recruiters.
        //
        // Each limiter uses its OWN key prefix on purpose. Laravel's plain `throttle:N,1`
        // resolves an authenticated request's signature to the user ID *alone* — no route — so
        // every unprefixed limit shares one counter per user, and a burst of searches would
        // silently eat the CV-download budget. Distinct prefixes keep the buckets independent.
        $employerKey = fn (Request $request) => optional($request->user())->id ?: $request->ip();

        // Searching and filtering the pool. Generous for a human refining a query; at 30/min a
        // scraper still can't walk a large catalogue quickly.
        RateLimiter::for('candidate-search', function (Request $request) use ($employerKey) {
            return Limit::perMinute(30)->by('cand-search:' . $employerKey($request));
        });

        // Opening individual profiles — clicked through one at a time in normal use.
        RateLimiter::for('candidate-profile', function (Request $request) use ($employerKey) {
            return Limit::perMinute(60)->by('cand-profile:' . $employerKey($request));
        });

        // CV downloads are the highest-value target: a downloaded CV is a permanent copy of
        // someone's name, phone and email. The per-minute cap stops a fast burst; the DAILY cap
        // is what actually bounds bulk exfiltration, since a patient scraper simply waits out a
        // per-minute limit. 100/day is far above any real recruiter's usage.
        RateLimiter::for('candidate-cv', function (Request $request) use ($employerKey) {
            $key = $employerKey($request);
            return [
                Limit::perMinute(20)->by('cand-cv-min:' . $key),
                Limit::perDay(100)->by('cand-cv-day:' . $key),
            ];
        });
    }
}
