<?php

namespace App\Services;

use App\Models\Job;
use App\Models\Setting;

/**
 * Builds the Cambodia Salary Guide from live published job listings.
 *
 * Every listing's pay is normalised to a common basis — monthly USD — so figures across
 * currencies (USD/KHR) and periods (hour/day/week/month/year) are comparable, then
 * aggregated into robust statistics (median + inter-quartile range) per category and
 * per experience level. Median/quartiles, not mean, so a few outliers can't skew a row.
 *
 * This is a data asset unique to Krama: the numbers come straight from what employers are
 * actually offering right now, and refresh as new jobs are published.
 */
class SalaryGuideService
{
    // Minimum listings for a category/level row to be shown — below this a single posting
    // would define the "market rate", which is misleading.
    private const MIN_SAMPLE = 3;

    // Sanity band for a normalised monthly-USD figure. Filters data-entry mistakes (e.g. an
    // annual salary typed into the monthly field, or a stray 0) without touching real pay.
    private const MIN_MONTHLY = 30;
    private const MAX_MONTHLY = 50000;

    // The guide only goes "live" (real numbers, indexable) once there's a credible sample.
    // Below this it renders a no-index "compiling…" state — publishing a median off a handful
    // of listings would be misleading. Raise as coverage grows.
    private const MIN_TOTAL = 25;

    // Tighter band for a salary parsed out of free-text (noisier than a structured field):
    // Cambodian monthly pay realistically sits in this window.
    private const TEXT_MIN = 50;
    private const TEXT_MAX = 6000;

    // Experience-level rows are rendered in this order (jobs.experience_level is a slug).
    private const LEVEL_ORDER = [
        'entry'      => 'Entry level',
        'junior'     => 'Junior',
        'mid'        => 'Mid level',
        'senior'     => 'Senior',
        'lead'       => 'Lead',
        'manager'    => 'Manager',
        'executive'  => 'Executive',
    ];

    /** @return array the full guide payload consumed by the Blade view + JSON-LD. */
    public function build(): array
    {
        $fx = (float) (Setting::where('group', 'tax')->where('key', 'exchange_rate_khr')->value('value') ?: 4100);
        if ($fx <= 0) $fx = 4100;

        // All published jobs — we use the structured salary field when present, and fall back
        // to parsing the advertised pay out of the listing text when it isn't.
        $jobs = Job::query()
            ->where('status', 'published')
            ->with('category:id,name')
            ->get(['id', 'category_id', 'experience_level', 'salary_min', 'salary_max', 'salary_currency', 'salary_period', 'description', 'requirements', 'benefits']);

        $all = [];                 // every normalised monthly-USD midpoint
        $byCat = [];               // categoryName => [midpoints]
        $byLevel = [];             // levelSlug   => [midpoints]

        foreach ($jobs as $j) {
            $usd = $this->monthlyUsd($j, $fx);
            if ($usd === null) $usd = $this->fromText($j);
            if ($usd === null) continue;

            $all[] = $usd;

            $cat = optional($j->category)->name;
            if ($cat) $byCat[$cat][] = $usd;

            $lvl = strtolower(trim((string) $j->experience_level));
            if ($lvl !== '') $byLevel[$lvl][] = $usd;
        }

        $categories = [];
        foreach ($byCat as $name => $vals) {
            if (count($vals) < self::MIN_SAMPLE) continue;
            $categories[] = array_merge(['name' => $name, 'count' => count($vals)], $this->stats($vals));
        }
        usort($categories, fn ($a, $b) => $b['count'] <=> $a['count'] ?: ($b['median'] <=> $a['median']));

        $levels = [];
        foreach (self::LEVEL_ORDER as $slug => $label) {
            $vals = $byLevel[$slug] ?? [];
            if (count($vals) < self::MIN_SAMPLE) continue;
            $levels[] = array_merge(['key' => $slug, 'label' => $label, 'count' => count($vals)], $this->stats($vals));
        }

        return [
            'generated_at' => now(),
            'total'        => count($all),
            'sufficient'   => count($all) >= self::MIN_TOTAL,
            'min_total'    => self::MIN_TOTAL,
            'currency'     => 'USD',
            'period'       => 'month',
            'fx_rate'      => $fx,
            'overall'      => $all ? $this->stats($all) : ['median' => 0, 'p25' => 0, 'p75' => 0, 'min' => 0, 'max' => 0],
            'by_category'  => $categories,
            'by_level'     => $levels,
        ];
    }

    /**
     * Best-effort salary from the listing text when the structured field is empty. Conservative
     * by design: only $-tagged amounts that sit near a salary cue, within a plausible monthly
     * band, so unrelated figures (bonuses, fees) don't leak in. Returns a monthly-USD midpoint
     * or null. (Most Cambodian posts write e.g. "ប្រាក់ខែ $250–$400" or "Salary: $500".)
     */
    private function fromText(Job $j): ?float
    {
        $t = strtolower(strip_tags((string) $j->description . ' ' . (string) $j->requirements . ' ' . (string) $j->benefits));
        if ($t === '' || ! preg_match('/salary|remunerat|wage|\bpay\b|ប្រាក់ខែ/u', $t)) return null;

        if (! preg_match_all('/\$\s?([0-9][0-9,\.]{1,6})/', $t, $m)) return null;

        $nums = [];
        foreach ($m[1] as $raw) {
            $n = (float) preg_replace('/[^0-9]/', '', $raw);
            if ($n >= self::TEXT_MIN && $n <= self::TEXT_MAX) $nums[] = $n;
        }
        if (! $nums) return null;

        $mid = (min($nums) + max($nums)) / 2;
        return ($mid >= self::MIN_MONTHLY && $mid <= self::MAX_MONTHLY) ? $mid : null;
    }

    /**
     * Normalise one job's pay to a monthly-USD midpoint, or null if it can't be trusted.
     * Uses the midpoint of the range when both ends are present.
     */
    private function monthlyUsd(Job $j, float $fx): ?float
    {
        $min = is_numeric($j->salary_min) ? (float) $j->salary_min : null;
        $max = is_numeric($j->salary_max) ? (float) $j->salary_max : null;

        $vals = array_values(array_filter([$min, $max], fn ($v) => $v !== null && $v > 0));
        if (! $vals) return null;
        $mid = array_sum($vals) / count($vals);

        // Currency → USD.
        $cur = strtoupper(trim((string) ($j->salary_currency ?: 'USD')));
        if ($cur === 'KHR') {
            $mid = $mid / $fx;
        } elseif ($cur !== 'USD' && $cur !== '') {
            return null; // unknown currency — don't guess
        }

        // Period → month.
        $mult = [
            'hour' => 22 * 8, 'hourly' => 22 * 8,
            'day' => 22, 'daily' => 22,
            'week' => 52 / 12, 'weekly' => 52 / 12,
            'month' => 1, 'monthly' => 1,
            'year' => 1 / 12, 'yearly' => 1 / 12, 'annual' => 1 / 12, 'annually' => 1 / 12,
        ][strtolower(trim((string) ($j->salary_period ?: 'month')))] ?? 1;
        $mid = $mid * $mult;

        if ($mid < self::MIN_MONTHLY || $mid > self::MAX_MONTHLY) return null;

        return $mid;
    }

    /** Median + inter-quartile range (p25–p75) + min/max, rounded to whole dollars. */
    private function stats(array $vals): array
    {
        sort($vals);
        return [
            'median' => (int) round($this->percentile($vals, 0.50)),
            'p25'    => (int) round($this->percentile($vals, 0.25)),
            'p75'    => (int) round($this->percentile($vals, 0.75)),
            'min'    => (int) round($vals[0]),
            'max'    => (int) round($vals[count($vals) - 1]),
        ];
    }

    /** Linear-interpolation percentile over an already-sorted array. */
    private function percentile(array $sorted, float $p): float
    {
        $n = count($sorted);
        if ($n === 0) return 0.0;
        if ($n === 1) return $sorted[0];

        $rank = $p * ($n - 1);
        $lo = (int) floor($rank);
        $hi = (int) ceil($rank);
        if ($lo === $hi) return $sorted[$lo];

        return $sorted[$lo] + ($rank - $lo) * ($sorted[$hi] - $sorted[$lo]);
    }
}
