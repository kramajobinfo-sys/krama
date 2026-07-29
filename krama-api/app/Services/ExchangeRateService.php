<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Official USD→KHR exchange rate from the National Bank of Cambodia (NBC).
 *
 * NBC publishes the official daily rate as a headline on its exchange-rate page
 * ("Official Exchange Rate : 4043 KHR / USD"). Cambodian tax invoices (GDT) must show
 * the KHR total at the NBC official rate, so we fetch it here rather than hard-coding.
 *
 * The rate is cached for the day; on any failure (NBC unreachable, layout change) it
 * falls back to the admin's manual `tax.exchange_rate_khr` setting (or 4100), so a tax
 * invoice is never blocked by a network hiccup.
 */
class ExchangeRateService
{
    private const NBC_URL   = 'https://www.nbc.gov.kh/english/economic_research/exchange_rate.php';
    private const CACHE_KEY = 'nbc.usd_khr_rate';
    // Durable last-known NBC rate. Deliberately a SEPARATE key from the admin's manual
    // `exchange_rate_khr` so the auto-sync never clobbers a human-entered override.
    private const AUTO_KEY  = 'exchange_rate_khr_auto';

    /**
     * Riel per US$1. Resolution order (fail-safe for a legal tax document):
     *   1) live/cached NBC official rate,
     *   2) most recent auto-synced NBC rate (survives a cache flush),
     *   3) the admin's manual override ($manualFallback),
     *   4) 4100 as a last resort.
     */
    public static function usdToKhr(?float $manualFallback = null): float
    {
        $manual = ($manualFallback && $manualFallback > 0) ? (float) $manualFallback : null;

        // 1) live/cached NBC — only successful fetches are cached, so a failure retries next call.
        $rate = Cache::get(self::CACHE_KEY);
        if (! $rate) {
            $rate = self::fetchFromNbc();
            if ($rate) {
                Cache::put(self::CACHE_KEY, $rate, now()->addHours(6));
                self::storeLastKnown($rate); // durable last-known (separate key — never touches the manual value)
            }
        }
        if ($rate && $rate > 0) {
            return (float) $rate;
        }

        // 2) NBC unavailable → most recent auto-synced value.
        $auto = (float) (\App\Models\Setting::where('group', 'tax')->where('key', self::AUTO_KEY)->value('value') ?: 0);
        if ($auto > 0) {
            return $auto;
        }

        // 3) admin manual override, else 4) hard default.
        return $manual ?? 4100.0;
    }

    /** Save the latest NBC rate to the auto-only key (does NOT overwrite the admin's manual override). */
    private static function storeLastKnown(float $rate): void
    {
        try {
            \App\Models\Setting::updateOrInsert(
                ['group' => 'tax', 'key' => self::AUTO_KEY],
                ['value' => (string) $rate]
            );
        } catch (\Throwable $e) {
            Log::warning('nbc.exchange_rate_store_failed', ['error' => $e->getMessage()]);
        }
    }

    /** The live NBC rate (float) or null on any failure. Public so admin can preview it. */
    public static function fetchFromNbc(): ?float
    {
        try {
            $resp = Http::withHeaders([
                'User-Agent' => 'Mozilla/5.0 (compatible; KramaBot/1.0; +https://kramajob.com)',
                'Accept'     => 'text/html',
            ])->timeout(8)->get(self::NBC_URL);

            if (! $resp->ok()) {
                return null;
            }

            // Headline on the page: "Official Exchange Rate : <font ...>4043</font> KHR / USD"
            if (preg_match('/Official\s*Exchange\s*Rate\s*:\s*<font[^>]*>\s*([\d.,]+)\s*<\/font>\s*KHR\s*\/\s*USD/i', $resp->body(), $m)) {
                $rate = (float) str_replace(',', '', $m[1]);
                // Sanity bound — the riel has traded ~3900–4200/USD for years.
                if ($rate > 1000 && $rate < 100000) {
                    return $rate;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('nbc.exchange_rate_fetch_failed', ['error' => $e->getMessage()]);
        }

        return null;
    }
}
