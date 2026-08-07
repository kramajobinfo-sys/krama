<?php

namespace App\Providers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // The server-rendered pages carry the same header/footer as the SPA, which reads its
        // wordmark and logo from the `brand` settings group. Read the same rows here so an
        // admin logo change reaches both, instead of hard-coding "KRAMA" in the Blade chrome.
        // Same cache key family as SettingController::publicGroup, so it is already warm.
        View::composer('seo.layout', function ($view) {
            $brand = Cache::remember('public.settings.brand.chrome', 3600, function () {
                $rows = \App\Models\Setting::where('group', 'brand')->pluck('value', 'key')->all();

                return [
                    'name' => $rows['brandName'] ?? 'Krama',
                    'logo' => $rows['logoUrl'] ?? null,
                ];
            });

            $view->with('brandName', $brand['name'])->with('brandLogo', $brand['logo']);
        });
    }
}
