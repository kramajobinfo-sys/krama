<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Job;
use App\Services\OgImageService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * Server-rendered, crawlable pages for search engines and social shares.
 *
 * The public site itself is a client-rendered React SPA (invisible to crawlers), so these
 * Blade pages give Google real HTML + per-page metadata + JSON-LD. The job pages emit the
 * schema.org JobPosting structured data required for Google for Jobs. Each page carries a
 * canonical URL and links into the SPA for the interactive apply flow.
 */
class SeoController extends Controller
{
    private const EMP_TYPE = [
        'full_time'  => 'FULL_TIME',
        'part_time'  => 'PART_TIME',
        'contract'   => 'CONTRACTOR',
        'internship' => 'INTERN',
        'temporary'  => 'TEMPORARY',
    ];

    private const SALARY_UNIT = [
        'hour' => 'HOUR', 'day' => 'DAY', 'month' => 'MONTH', 'year' => 'YEAR',
    ];

    /** GET /jobs/{slug} — one published job. */
    public function job(string $slug)
    {
        $job = Job::with(['company', 'location', 'category'])
            ->where('slug', $slug)
            ->where('status', 'published')
            ->first();
        abort_if(! $job, 404);

        $company   = $job->company;
        $canonical = url('/jobs/' . $job->slug);
        $applyUrl  = rtrim((string) config('app.frontend_url', url('/')), '/') . '?job=' . $job->id;
        $metaDesc  = self::excerpt($job->description) ?: trim($job->title . ' at ' . ($company->name ?? 'a verified employer') . '. Apply on Krama.');
        $ld        = $this->jobPostingLd($job, $company, $canonical);

        return view('seo.job', compact('job', 'company', 'canonical', 'applyUrl', 'metaDesc', 'ld'));
    }

    /** GET /companies/{id} — a company profile + its open jobs. */
    public function company(int $id)
    {
        $company = Company::where('id', $id)->where('status', 'approved')->first();
        abort_if(! $company, 404);

        $jobs = Job::with('location')
            ->where('company_id', $company->id)
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->limit(100)
            ->get();

        $canonical = url('/companies/' . $company->id);
        $metaDesc  = self::excerpt($company->description)
            ?: trim(($company->name ?? 'This company') . ' — company profile and ' . $jobs->count() . ' open job(s) on Krama.');

        $ld = array_filter([
            '@context' => 'https://schema.org',
            '@type'    => 'Organization',
            'name'     => $company->name,
            'url'      => $canonical,
            'logo'     => $company->logo_url ?: null,
            'sameAs'   => $company->website ?: null,
            'address'  => $company->address ? [
                '@type'          => 'PostalAddress',
                'streetAddress'  => $company->address,
                'addressCountry' => 'KH',
            ] : null,
        ], fn ($v) => $v !== null);

        return view('seo.company', compact('company', 'jobs', 'canonical', 'metaDesc', 'ld'));
    }

    /** GET /privacy — server-rendered Privacy Policy (public, crawlable; used for Facebook app review). */
    public function privacy()
    {
        return view('seo.privacy', [
            'canonical' => url('/privacy'),
            'metaDesc'  => 'How Krama Job collects, uses, and protects your information — our full Privacy Policy.',
            'ld'        => [],
        ]);
    }

    /** GET /terms — server-rendered Terms of Service (public, crawlable). */
    public function terms()
    {
        return view('seo.terms', [
            'canonical' => url('/terms'),
            'metaDesc'  => 'The Terms of Service for using Krama Job — the rules for candidates and employers.',
            'ld'        => [],
        ]);
    }

    /** GET /jobs/{slug}/og.png — dynamic 1200×630 social-share card for the job. */
    public function jobOg(string $slug)
    {
        $job = Job::with(['company', 'location'])
            ->where('slug', $slug)->where('status', 'published')->first();
        abort_if(! $job, 404);

        $key = 'og:job:' . $job->id . ':' . optional($job->updated_at)->timestamp;
        $png = Cache::get($key);
        if (! $png) {
            $png = app(OgImageService::class)->job($job, $job->company);
            if ($png) Cache::put($key, $png, now()->addDays(7));
        }

        return $this->pngResponse($png);
    }

    /** GET /companies/{id}/og.png — dynamic 1200×630 social-share card for the company. */
    public function companyOg(int $id)
    {
        $company = Company::where('id', $id)->where('status', 'approved')->first();
        abort_if(! $company, 404);

        $count = Job::where('company_id', $company->id)->where('status', 'published')->count();
        $key = 'og:company:' . $company->id . ':' . optional($company->updated_at)->timestamp . ':' . $count;
        $png = Cache::get($key);
        if (! $png) {
            $png = app(OgImageService::class)->company($company, $count);
            if ($png) Cache::put($key, $png, now()->addDays(7));
        }

        return $this->pngResponse($png);
    }

    private function pngResponse(?string $png)
    {
        abort_if(! $png, 500);

        return response($png, 200, [
            'Content-Type'   => 'image/png',
            'Content-Length' => (string) strlen($png),
            'Cache-Control'  => 'public, max-age=86400',
        ]);
    }

    /** GET /sitemap.xml — published jobs + approved companies + key static pages. */
    public function sitemap()
    {
        $urls = [];
        $urls[] = ['loc' => url('/'), 'priority' => '1.0'];

        Job::where('status', 'published')->select('slug', 'updated_at')->orderByDesc('updated_at')->chunk(500, function ($chunk) use (&$urls) {
            foreach ($chunk as $j) {
                if (! $j->slug) continue;
                $urls[] = ['loc' => url('/jobs/' . $j->slug), 'lastmod' => optional($j->updated_at)->toDateString(), 'priority' => '0.8'];
            }
        });

        Company::where('status', 'approved')->select('id', 'updated_at')->chunk(500, function ($chunk) use (&$urls) {
            foreach ($chunk as $c) {
                $urls[] = ['loc' => url('/companies/' . $c->id), 'lastmod' => optional($c->updated_at)->toDateString(), 'priority' => '0.6'];
            }
        });

        $xml  = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
        foreach ($urls as $u) {
            $xml .= '  <url><loc>' . htmlspecialchars($u['loc'], ENT_XML1) . '</loc>';
            if (! empty($u['lastmod'])) $xml .= '<lastmod>' . $u['lastmod'] . '</lastmod>';
            $xml .= '<priority>' . $u['priority'] . '</priority></url>' . "\n";
        }
        $xml .= '</urlset>' . "\n";

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    /** GET /api/admin/seo/overview — data for the admin SEO panel (counts + preview links). */
    public function adminOverview()
    {
        $base = rtrim(url('/'), '/');

        return response()->json([
            'base_url'      => $base,
            'is_local'      => (bool) preg_match('#localhost|127\.0\.0\.1#', $base),
            'sitemap_url'   => $base . '/sitemap.xml',
            'robots_url'    => $base . '/robots.txt',
            'job_count'     => Job::where('status', 'published')->count(),
            'company_count' => Company::where('status', 'approved')->count(),
            'jobs'          => Job::where('status', 'published')->whereNotNull('slug')
                ->orderByDesc('published_at')->limit(8)->get(['id', 'title', 'slug'])
                ->map(fn ($j) => ['title' => $j->title, 'url' => $base . '/jobs/' . $j->slug]),
            'companies'     => Company::where('status', 'approved')
                ->orderBy('name')->limit(8)->get(['id', 'name'])
                ->map(fn ($c) => ['name' => $c->name, 'url' => $base . '/companies/' . $c->id]),
        ]);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    /** Plain-text ~155-char excerpt from (possibly HTML) rich text, for meta descriptions. */
    private static function excerpt(?string $html): string
    {
        $text = trim(preg_replace('/\s+/', ' ', strip_tags((string) $html)));
        return $text === '' ? '' : Str::limit($text, 155);
    }

    /** Build the schema.org JobPosting structured data (Google for Jobs). */
    private function jobPostingLd(Job $job, ?Company $company, string $canonical): array
    {
        $ld = [
            '@context'    => 'https://schema.org/',
            '@type'       => 'JobPosting',
            'title'       => $job->title,
            'description' => $job->description ?: ('<p>' . e($job->title) . ' at ' . e($company->name ?? 'a verified employer on Krama') . '.</p>'),
            'datePosted'  => optional($job->published_at ?? $job->created_at)->toDateString(),
            'url'         => $canonical,
            'identifier'  => [
                '@type' => 'PropertyValue',
                'name'  => $company->name ?? 'Krama',
                'value' => (string) $job->id,
            ],
            'hiringOrganization' => array_filter([
                '@type'  => 'Organization',
                'name'   => $company->name ?? 'Krama',
                'sameAs' => $company->website ?? null,
                'logo'   => $company->logo_url ?? null,
            ], fn ($v) => $v !== null),
        ];

        if ($job->expires_at) {
            $ld['validThrough'] = $job->expires_at->toDateString();
        }
        if (isset(self::EMP_TYPE[$job->job_type])) {
            $ld['employmentType'] = self::EMP_TYPE[$job->job_type];
        }

        // Google needs jobLocation OR applicantLocationRequirements (for remote roles).
        if ($job->is_remote) {
            $ld['jobLocationType'] = 'TELECOMMUTE';
            $ld['applicantLocationRequirements'] = ['@type' => 'Country', 'name' => 'Cambodia'];
        }
        $locName = optional($job->location)->name;
        if ($locName || ! $job->is_remote) {
            $ld['jobLocation'] = [
                '@type'   => 'Place',
                'address' => array_filter([
                    '@type'           => 'PostalAddress',
                    'addressLocality' => $locName ?: null,
                    'addressCountry'  => 'KH',
                ], fn ($v) => $v !== null),
            ];
        }

        if ($job->salary_min || $job->salary_max) {
            $value = ['@type' => 'QuantitativeValue', 'unitText' => self::SALARY_UNIT[$job->salary_period] ?? 'MONTH'];
            if ($job->salary_min) $value['minValue'] = (float) $job->salary_min;
            if ($job->salary_max) $value['maxValue'] = (float) $job->salary_max;
            $ld['baseSalary'] = [
                '@type'    => 'MonetaryAmount',
                'currency' => $job->salary_currency ?: 'USD',
                'value'    => $value,
            ];
        }

        return $ld;
    }
}
