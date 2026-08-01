<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Job;

/**
 * Renders 1200×630 social-share cards (og:image) for job and company pages
 * with PHP GD — no browser/canvas needed on the server. Brand: Banyan Teal
 * gradient, the krama logo mark, Sora-style DejaVu type (Battambang fallback
 * for Khmer). Output is a PNG binary the SeoController caches + serves.
 */
class OgImageService
{
    private const W = 1200;
    private const H = 630;

    // Brand palette
    private const TEAL600 = '#0C7E6B';
    private const SAFFRON = '#F26B1F';
    private const SAFF_LT = '#F7B58A';
    private const WHITE   = '#FFFFFF';
    private const TEAL100 = '#D0F5EA';
    private const TEAL200 = '#A3E9D6';

    public function job(Job $job, ?Company $company): string
    {
        $typeLabels = ['full_time' => 'Full-time', 'part_time' => 'Part-time', 'contract' => 'Contract', 'internship' => 'Internship', 'temporary' => 'Temporary'];
        $loc  = optional($job->location)->name ?: ($job->is_remote ? 'Remote' : null);
        $type = $typeLabels[$job->job_type] ?? null;
        $meta = array_filter([$loc, $type, $this->salary($job)]);

        $sub = $company ? $company->name . ($company->is_verified ? '   ·   Verified employer' : '') : null;

        return $this->render([
            'kicker' => 'JOB OPENING',
            'title'  => $job->title,
            'sub'    => $sub,
            'meta'   => $meta ? implode('     ·     ', $meta) : null,
        ]);
    }

    public function company(Company $company, int $jobCount): string
    {
        $meta = array_filter([$company->industry ?: null, $company->address ?: null]);

        return $this->render([
            'kicker' => $company->is_verified ? 'VERIFIED EMPLOYER' : 'EMPLOYER ON KRAMA',
            'title'  => $company->name,
            'sub'    => $jobCount > 0 ? ($jobCount . ' open position' . ($jobCount === 1 ? '' : 's')) : 'Company profile',
            'meta'   => $meta ? implode('     ·     ', $meta) : null,
        ]);
    }

    // ── rendering ────────────────────────────────────────────────────────────

    private function render(array $o): string
    {
        $im = imagecreatetruecolor(self::W, self::H);
        imagealphablending($im, true);
        imagesavealpha($im, true);

        // Diagonal Banyan-Teal gradient
        $this->diagonalGradient($im, ['#0B6557', '#0C413A', '#04221E']);

        // Faint hero logo mark, right side (watermark)
        $this->logoMark($im, 812, 150, 6.0, 0.08);

        $x = 80;
        $maxW = 1000;

        // Saffron accent bar
        $this->roundRect($im, $x, 86, 60, 7, 3, $this->color($im, self::SAFFRON));

        // Brand lockup: small mark + wordmark
        $this->logoMark($im, $x, 112, 1.25, 1.0);
        $this->text($im, 'bold', 30, $x + 78, 150, self::WHITE, 'krama');

        // Auto-fit the title, then vertically centre the whole text block within
        // a fixed band [210, 500] so nothing ever collides with the URL pill.
        [$size, $lines] = $this->fitTitle($o['title'], $maxW, 3);
        $lineH = (int) round($size * 1.16);

        $kickH  = ! empty($o['kicker']) ? 32 : 0;
        $titleH = count($lines) * $lineH;
        $subH   = ! empty($o['sub'])  ? 44 : 0;
        $metaH  = ! empty($o['meta']) ? 34 : 0;
        $gap    = ($subH || $metaH) ? 20 : 0;
        $total  = $kickH + $titleH + $gap + $subH + $metaH;

        $bandTop = 210; $band = 500 - $bandTop;
        $y = $bandTop + (int) max(0, ($band - $total) / 2);

        if ($kickH) {
            $this->text($im, 'bold', 18, $x, $y + 20, self::SAFF_LT, $this->spaced($o['kicker']));
            $y += $kickH;
        }
        foreach ($lines as $ln) {
            $this->text($im, 'bold', $size, $x, $y + (int) round($size * 0.80), self::WHITE, $ln, $this->hasKhmer($ln));
            $y += $lineH;
        }
        $y += $gap;
        if ($subH) {
            $this->text($im, 'bold', 26, $x, $y + 21, self::TEAL200, $this->ellipsize('bold', 26, $o['sub'], $maxW));
            $y += $subH;
        }
        if ($metaH) {
            $this->text($im, 'regular', 23, $x, $y + 19, self::TEAL100, $this->ellipsize('regular', 23, $o['meta'], $maxW));
        }

        // URL pill, bottom-left
        $label = 'kramajob.com';
        $pw = $this->textWidth('bold', 24, $label);
        $this->roundRect($im, $x, 524, $pw + 48, 44, 22, $this->color($im, self::SAFFRON));
        $this->text($im, 'bold', 24, $x + 24, 553, self::WHITE, $label);

        ob_start();
        imagepng($im, null, 9);
        $bin = ob_get_clean();
        imagedestroy($im);

        return $bin;
    }

    // ── drawing helpers ──────────────────────────────────────────────────────

    /** Diagonal (top-left → bottom-right) multi-stop gradient. */
    private function diagonalGradient($im, array $hexStops): void
    {
        $stops = array_map(fn ($h) => $this->hex2rgb($h), $hexStops);
        $max = self::W + self::H;
        for ($d = 0; $d < $max; $d++) {
            [$r, $g, $b] = $this->lerpStops($stops, $d / $max);
            $col = imagecolorallocate($im, $r, $g, $b);
            $x0 = min($d, self::W - 1); $y0 = $d - $x0;
            $x1 = max(0, $d - (self::H - 1)); $y1 = $d - $x1;
            imageline($im, $x0, $y0, $x1, $y1, $col);
        }
    }

    /** The krama logo mark (from krama-logo-light.svg), 48-unit grid × $s, at opacity $op. */
    private function logoMark($im, float $ox, float $oy, float $s, float $op): void
    {
        $this->roundRect($im, $ox, $oy, 48 * $s, 48 * $s, 12 * $s, $this->color($im, self::WHITE, $op));
        $saff = $this->color($im, self::SAFFRON, $op);
        $teal = $this->color($im, self::TEAL600, $op);
        $sq = fn ($cx, $cy, $col) => $this->roundRect($im, $ox + $cx * $s, $oy + $cy * $s, 5 * $s, 5 * $s, max(1, $s), $col);
        foreach ([[12, 8.5], [12, 15], [12, 21.5], [12, 28], [12, 34.5], [25, 15], [25, 28], [31.5, 8.5], [31.5, 34.5]] as $p) {
            $sq($p[0], $p[1], $saff);
        }
        $sq(18.5, 21.5, $teal);
    }

    private function roundRect($im, float $x, float $y, float $w, float $h, float $r, int $color): void
    {
        $x = (int) round($x); $y = (int) round($y); $w = (int) round($w); $h = (int) round($h); $r = (int) round($r);
        if ($r <= 0) { imagefilledrectangle($im, $x, $y, $x + $w, $y + $h, $color); return; }
        imagefilledrectangle($im, $x + $r, $y, $x + $w - $r, $y + $h, $color);
        imagefilledrectangle($im, $x, $y + $r, $x + $w, $y + $h - $r, $color);
        $d = $r * 2;
        imagefilledellipse($im, $x + $r, $y + $r, $d, $d, $color);
        imagefilledellipse($im, $x + $w - $r, $y + $r, $d, $d, $color);
        imagefilledellipse($im, $x + $r, $y + $h - $r, $d, $d, $color);
        imagefilledellipse($im, $x + $w - $r, $y + $h - $r, $d, $d, $color);
    }

    private function text($im, string $weight, int $size, float $x, float $baselineY, string $hex, string $str, bool $khmer = false): void
    {
        imagettftext($im, $size, 0, (int) round($x), (int) round($baselineY), $this->color($im, $hex), $this->font($weight, $khmer), $str);
    }

    // ── text measurement / fitting ───────────────────────────────────────────

    private function textWidth(string $weight, int $size, string $str, bool $khmer = false): float
    {
        $b = imagettfbbox($size, 0, $this->font($weight, $khmer), $str);
        return abs($b[2] - $b[0]);
    }

    /** Pick the largest size (from a ladder) whose wrapped title fits within $maxLines. */
    private function fitTitle(string $title, float $maxW, int $maxLines): array
    {
        $khmer = $this->hasKhmer($title);
        foreach ([56, 48, 42, 37, 32] as $size) {
            $lines = $this->wrap('bold', $size, $title, $maxW, $khmer);
            if (count($lines) <= $maxLines) {
                return [$size, $lines];
            }
        }
        // Too long even at the smallest size: truncate to $maxLines with an ellipsis.
        $lines = $this->wrap('bold', 32, $title, $maxW, $khmer);
        $lines = array_slice($lines, 0, $maxLines);
        $last = count($lines) - 1;
        while ($last >= 0 && $this->textWidth('bold', 32, $lines[$last] . '…', $khmer) > $maxW) {
            $lines[$last] = preg_replace('/\s*\S+$/u', '', $lines[$last]) ?: $lines[$last];
            if (! preg_match('/\s/u', $lines[$last])) break;
        }
        $lines[$last] = rtrim($lines[$last]) . '…';
        return [32, $lines];
    }

    /** Greedy word-wrap to a pixel width. */
    private function wrap(string $weight, int $size, string $text, float $maxW, bool $khmer = false): array
    {
        $words = preg_split('/\s+/u', trim($text)) ?: [];
        $lines = [];
        $cur = '';
        foreach ($words as $w) {
            $try = $cur === '' ? $w : $cur . ' ' . $w;
            if ($this->textWidth($weight, $size, $try, $khmer) <= $maxW) {
                $cur = $try;
            } else {
                if ($cur !== '') $lines[] = $cur;
                $cur = $w;
            }
        }
        if ($cur !== '') $lines[] = $cur;
        return $lines ?: [''];
    }

    /** Single-line truncate with trailing ellipsis to a pixel width. */
    private function ellipsize(string $weight, int $size, string $str, float $maxW): string
    {
        $khmer = $this->hasKhmer($str);
        if ($this->textWidth($weight, $size, $str, $khmer) <= $maxW) return $str;
        while ($str !== '' && $this->textWidth($weight, $size, $str . '…', $khmer) > $maxW) {
            $str = function_exists('mb_substr') ? mb_substr($str, 0, -1) : substr($str, 0, -1);
        }
        return rtrim($str) . '…';
    }

    // ── low-level utils ──────────────────────────────────────────────────────

    private function font(string $weight, bool $khmer = false): string
    {
        if ($khmer) {
            return resource_path('fonts/khmer/' . ($weight === 'bold' ? 'Battambang-Bold.ttf' : 'Battambang-Regular.ttf'));
        }
        return resource_path('fonts/og/' . ($weight === 'bold' ? 'DejaVuSans-Bold.ttf' : 'DejaVuSans.ttf'));
    }

    private function hasKhmer(string $s): bool
    {
        return (bool) preg_match('/[\x{1780}-\x{17FF}]/u', $s);
    }

    /** Letter-space a short string for the kicker (GD has no tracking). */
    private function spaced(string $s): string
    {
        return implode(' ', mb_str_split($s));
    }

    private function salary(Job $job): ?string
    {
        if (! $job->salary_min && ! $job->salary_max) return null;
        $cur = $job->salary_currency ?: 'USD';
        $per = $job->salary_period ?: 'month';
        $fmt = fn ($n) => ($cur === 'USD' ? '$' : '') . number_format((float) $n) . ($cur !== 'USD' ? ' ' . $cur : '');
        $s = $job->salary_min && $job->salary_max
            ? $fmt($job->salary_min) . '–' . $fmt($job->salary_max)
            : $fmt($job->salary_min ?: $job->salary_max);
        return $s . '/' . $per;
    }

    private function color($im, string $hex, float $op = 1.0): int
    {
        [$r, $g, $b] = $this->hex2rgb($hex);
        if ($op >= 1.0) return imagecolorallocate($im, $r, $g, $b);
        return imagecolorallocatealpha($im, $r, $g, $b, (int) round(127 * (1 - $op)));
    }

    private function hex2rgb(string $hex): array
    {
        $hex = ltrim($hex, '#');
        return [hexdec(substr($hex, 0, 2)), hexdec(substr($hex, 2, 2)), hexdec(substr($hex, 4, 2))];
    }

    private function lerpStops(array $stops, float $t): array
    {
        $n = count($stops) - 1;
        $seg = max(0.0, min(1.0, $t)) * $n;
        $i = (int) floor($seg);
        if ($i >= $n) return $stops[$n];
        $f = $seg - $i;
        return [
            (int) round($stops[$i][0] + ($stops[$i + 1][0] - $stops[$i][0]) * $f),
            (int) round($stops[$i][1] + ($stops[$i + 1][1] - $stops[$i][1]) * $f),
            (int) round($stops[$i][2] + ($stops[$i + 1][2] - $stops[$i][2]) * $f),
        ];
    }
}
