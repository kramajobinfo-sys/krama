<?php

namespace App\Support;

/**
 * Extracts a structured salary (min / max / currency / period) from free text —
 * a job description, a feed's salary field, or a pasted range. Conservative: returns
 * null unless it finds a currency-tagged amount in a plausible band, so it never invents
 * a "salary" from an unrelated number (a bonus, a phone number, a year).
 *
 * Handles the shapes Cambodian listings actually use, e.g.:
 *   "$500-$800", "500$ - 800$", "USD 500 to 800", "$1,200/month", "up to $1500",
 *   "from $300", "$300+", "ប្រាក់ខែ 300$–500$", "800 USD per month", "négociable" → null.
 */
class SalaryParser
{
    // Plausible monthly-equivalent bands per currency (raw value in that currency, before
    // period normalisation). Wide enough for hourly→yearly figures, tight enough to reject junk.
    private const USD_MIN = 20;
    private const USD_MAX = 500000;    // covers annual USD salaries
    private const KHR_MIN = 80000;     // ~$20
    private const KHR_MAX = 2000000000; // covers annual KHR

    /**
     * Parse salary out of a long free-text body (a job description). Safer than parse() on
     * long text: it only looks in a window right after a salary cue word, so a "$5 discount"
     * elsewhere in the copy can't masquerade as pay. Returns null when no cue is present.
     *
     * @return array{min:?float,max:?float,currency:string,period:string}|null
     */
    public static function fromDescription(?string ...$parts): ?array
    {
        $t = strtolower(strip_tags(implode(' ', array_filter($parts))));
        if (trim($t) === '') return null;

        // Split on salary cues; every segment after a cue starts where the value would be.
        $segs = preg_split('/salary|compensat|remunerat|\bwage\b|\bpay\b|ប្រាក់ខែ/u', $t);
        if (! is_array($segs) || count($segs) < 2) return null;

        for ($i = 1; $i < count($segs); $i++) {
            $r = self::parse(mb_substr(trim($segs[$i]), 0, 80));
            if (! $r) continue;

            // Free-text guards (prose is noisy — big numbers near a cue are usually targets or
            // revenue, not pay): reject annual quotes, and cap the monthly figure. Cambodian
            // salaries are quoted per month; an "$86,000/year" in a description is a false hit.
            if ($r['period'] === 'year') continue;
            $peak = max((float) ($r['min'] ?? 0), (float) ($r['max'] ?? 0));
            $cap  = $r['currency'] === 'KHR' ? 40000000 : 10000;
            if ($peak > $cap) continue;

            return $r;
        }
        return null;
    }

    /** @return array{min:?float,max:?float,currency:string,period:string}|null */
    public static function parse(?string $text): ?array
    {
        $t = strtolower((string) $text);
        if (trim($t) === '') return null;

        // Currency: explicit $ / USD, or KHR / riel / ៛. Default USD (dominant locally) but
        // only once we've confirmed there IS a currency marker OR a $-amount below.
        $isUsd = str_contains($t, '$') || preg_match('/\busd\b|\bus\$/', $t);
        $isKhr = preg_match('/\bkhr\b|riel|៛/u', $t);
        if (! $isUsd && ! $isKhr) return null; // no currency marker → don't guess
        $currency = $isKhr && ! $isUsd ? 'KHR' : 'USD';

        // Period.
        $period = 'month';
        if (preg_match('/\b(hour|hr|hourly|\/h)\b|per hour|\/hr/u', $t)) $period = 'hour';
        elseif (preg_match('/\b(day|daily)\b|per day|\/day/u', $t)) $period = 'day';
        elseif (preg_match('/\b(year|yr|yearly|annual|annually|p\.?a\.?|per annum)\b|\/year|\/yr/u', $t)) $period = 'year';
        elseif (preg_match('/\b(month|monthly|\/mo|per month|\/month)\b/u', $t)) $period = 'month';

        $lo = $currency === 'KHR' ? self::KHR_MIN : self::USD_MIN;
        $hi = $currency === 'KHR' ? self::KHR_MAX : self::USD_MAX;
        $inBand = fn ($n) => $n !== null && $n >= $lo && $n <= $hi;

        $num = '([0-9][0-9,\.]*)';
        $cur = '(?:\$|usd|៛|khr|riel)';
        $sep = '(?:-|–|—|to)';

        $min = $max = null;

        // 1) A currency-anchored RANGE — the currency marker may sit on either side
        //    ("$500-$800", "USD 500 to 800", "500-800 USD", "KHR 1,500,000 - 2,000,000").
        if (preg_match('/' . $cur . '\s*' . $num . '\s*' . $sep . '\s*' . $cur . '?\s*' . $num . '/u', $t, $mm)
            || preg_match('/' . $num . '\s*' . $sep . '\s*' . $num . '\s*' . $cur . '/u', $t, $mm)) {
            $a = self::toNumber($mm[1]);
            $b = self::toNumber($mm[2]);
            if ($inBand($a) && $inBand($b)) {
                $min = min($a, $b);
                $max = max($a, $b);
            }
        }

        // 2) No range → collect single currency-adjacent numbers and apply floor/ceiling cues.
        if ($min === null && $max === null) {
            $nums = [];
            if (preg_match_all('/' . $cur . '\s*' . $num . '|' . $num . '\s*' . $cur . '/u', $t, $m, PREG_SET_ORDER)) {
                foreach ($m as $set) {
                    $raw = ($set[1] ?? '') !== '' ? $set[1] : ($set[2] ?? '');
                    $n = self::toNumber($raw);
                    if ($inBand($n)) $nums[] = $n;
                }
            }
            if (! $nums) return null;
            $nums = array_values(array_unique($nums));
            sort($nums);

            if (count($nums) === 1) {
                $only = $nums[0];
                if (preg_match('/up to|maximum|max\.?|មិនលើស/u', $t)) $max = $only;
                elseif (preg_match('/from|starting|minimum|min\.?|ចាប់ពី|\+/u', $t)) $min = $only;
                else $min = $only;
            } else {
                $min = $nums[0];
                $max = $nums[count($nums) - 1];
            }
        }

        if ($min === null && $max === null) return null;

        return [
            'min'      => $min,
            'max'      => $max,
            'currency' => $currency,
            'period'   => $period,
        ];
    }

    /** "1,200" / "1.200" / "1200" → 1200.0, or null if not a real number. */
    private static function toNumber(string $raw): ?float
    {
        $raw = trim($raw, " \t.,");
        if ($raw === '') return null;
        // Thousands separators (either . or ,) — strip them; there are no cents in job salaries.
        $digits = preg_replace('/[.,]/', '', $raw);
        if ($digits === '' || ! ctype_digit($digits)) return null;
        return (float) $digits;
    }
}
