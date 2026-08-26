<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Company;
use App\Models\Job;
use App\Services\OgImageService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
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

    // ── Digital CV (shareable public résumé page + QR) ──────────────────────────
    // The share token is {userId}-{HMAC(userId)} — stable, non-enumerable (you can't forge
    // the signature without APP_KEY), and reversible (the id is in the URL), so no DB column
    // or migration is needed. hash_equals() guards against timing attacks.
    public static function cvToken($userId): string
    {
        $sig = substr(hash_hmac('sha256', $userId . '|krama-cv', (string) config('app.key')), 0, 24);
        return $userId . '-' . $sig;
    }

    public static function cvShareUrl($userId): string
    {
        return url('/cv/' . self::cvToken($userId));
    }

    /** GET /cv/{token} — a candidate's public Digital CV. Private CVs are not shareable (404). */
    public function candidateCv(string $token)
    {
        [$id, $sig] = array_pad(explode('-', $token, 2), 2, '');
        abort_if(! ctype_digit($id) || ! hash_equals(self::cvToken($id), $token), 404);

        $user = \App\Models\User::whereHas('role', fn ($q) => $q->where('slug', 'candidate'))
            ->where('id', (int) $id)->where('status', 'active')->first();
        abort_if(! $user, 404);
        abort_if(($user->cv_visibility ?? 'employers') === 'private', 404);

        $resume = \App\Models\Resume::where('candidate_id', $user->id)->orderByDesc('is_primary')->orderByDesc('id')->first();

        $name      = $user->name;
        $headline  = $resume ? $resume->headline : null;
        $canonical = self::cvShareUrl($user->id);
        $metaDesc  = trim(($headline ? $headline . ' — ' : '') . $name . ' · CV on Krama');
        $ld        = array_filter([
            '@context' => 'https://schema.org',
            '@type'    => 'Person',
            'name'     => $name,
            'jobTitle' => $headline ?: null,
            'image'    => $user->avatar_url ?: null,
            'url'      => $canonical,
        ], fn ($v) => $v !== null && $v !== '');

        return view('seo.cv', compact('user', 'resume', 'canonical', 'metaDesc', 'ld', 'name', 'headline'));
    }

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

    /**
     * GET /salary — the Cambodia Salary Guide: median monthly pay by category and
     * experience level, aggregated from live published listings. A crawlable, uniquely
     * Krama data asset (schema.org Dataset) that answers high-intent "salary" queries.
     */
    /** GET /career — the career-advice hub: index of published articles, grouped by category. */
    public function careerList()
    {
        $articles = Article::where('status', 'published')
            ->orderByDesc('published_at')
            ->get(['id', 'title', 'slug', 'category', 'excerpt', 'cover_image', 'author_name', 'published_at']);

        $canonical = url('/career');
        $count = $articles->count();
        // Self-gate like the salary guide: don't invite Google to an empty hub.
        $robots = $count > 0 ? 'index, follow, max-image-preview:large' : 'noindex, follow';
        $metaDesc = 'Career advice for Cambodia — CV & résumé tips, interview prep, and job-search guidance from Krama.';

        $ld = [
            '@context' => 'https://schema.org',
            '@type'    => 'CollectionPage',
            'name'     => 'Career Advice — Krama',
            'url'      => $canonical,
            'about'    => 'Job search, CV and interview advice for Cambodia',
        ];

        return view('seo.career-list', compact('articles', 'canonical', 'metaDesc', 'ld', 'robots'));
    }

    /** GET /career/{slug} — a single published article with Article JSON-LD. */
    public function careerArticle(string $slug)
    {
        $article = Article::where('slug', $slug)->where('status', 'published')->first();
        abort_if(! $article, 404);

        // Best-effort view counter (never let it break the page).
        try { DB::table('articles')->where('id', $article->id)->increment('views'); } catch (\Throwable $e) {}

        $related = Article::where('status', 'published')
            ->where('id', '!=', $article->id)
            ->when($article->category, fn ($q) => $q->where('category', $article->category))
            ->orderByDesc('published_at')
            ->limit(3)
            ->get(['title', 'slug', 'category', 'excerpt', 'published_at']);

        $canonical = url('/career/' . $article->slug);
        $metaDesc = $article->meta_description
            ?: Str::limit(trim(strip_tags($article->excerpt ?: $article->body)), 155, '…');
        $img = $article->cover_image
            ? (Str::startsWith($article->cover_image, 'http') ? $article->cover_image : url(ltrim($article->cover_image, '/')))
            : url('/krama/assets/og-image.png');

        $ld = [
            '@context'      => 'https://schema.org',
            '@type'         => 'Article',
            'headline'      => $article->title,
            'description'   => $metaDesc,
            'image'         => $img,
            'author'        => ['@type' => 'Organization', 'name' => $article->author_name ?: 'Krama'],
            'publisher'     => ['@type' => 'Organization', 'name' => 'Krama', 'logo' => ['@type' => 'ImageObject', 'url' => url('/krama/assets/icon-192.png')]],
            'datePublished' => optional($article->published_at)->toIso8601String(),
            'dateModified'  => optional($article->updated_at)->toIso8601String(),
            'mainEntityOfPage' => $canonical,
        ];

        $robots = 'index, follow, max-image-preview:large';
        $ogImage = $img;

        return view('seo.career-article', compact('article', 'related', 'canonical', 'metaDesc', 'ld', 'robots', 'ogImage'));
    }

    public function salaryGuide()
    {
        $data = Cache::remember('seo.salary_guide.v1', 3600, fn () => app(\App\Services\SalaryGuideService::class)->build());

        $canonical = url('/salary');
        // Until there's a credible sample the page is a no-index "compiling…" state — we don't
        // want Google ranking (or users trusting) a median built from a handful of listings.
        $robots = ($data['sufficient'] ?? false) ? 'index, follow, max-image-preview:large' : 'noindex, follow';
        $metaDesc = ($data['sufficient'] ?? false)
            ? 'Cambodia salary guide — median monthly pay by job category and experience level, from '
                . number_format($data['total']) . ' live listings on Krama. Updated ' . $data['generated_at']->toFormattedDateString() . '.'
            : 'Cambodia salary insights, compiled from live job listings on Krama. Coming soon.';

        $ld = [
            '@context'    => 'https://schema.org',
            '@type'       => 'Dataset',
            'name'        => 'Cambodia Salary Guide',
            'description' => 'Median and typical monthly salary ranges across job categories and experience levels in Cambodia, aggregated from live job listings on Krama.',
            'url'         => $canonical,
            'creator'     => ['@type' => 'Organization', 'name' => 'Krama'],
            'dateModified' => $data['generated_at']->toDateString(),
            'spatialCoverage' => ['@type' => 'Place', 'name' => 'Cambodia'],
            'measurementTechnique' => 'Median monthly salary from published job listings, normalised to USD/month.',
        ];

        return view('seo.salary', compact('data', 'canonical', 'metaDesc', 'ld', 'robots'));
    }

    /** GET /account/delete — public account & data deletion page (the URL given to Google Play). */
    public function accountDelete()
    {
        $support = trim((string) (\App\Models\Setting::where('group', 'brand')->where('key', 'contactEmail')->value('value'))) ?: 'support@kramajob.com';

        return view('seo.account-delete', [
            'canonical' => url('/account/delete'),
            'metaDesc'  => 'How to delete your Krama account and personal data — in the app, or by request.',
            'ld'        => [],
            'support'   => $support,
        ]);
    }

    /** GET /unsubscribe/{token} — one-click marketing unsubscribe (token = {userId}-{HMAC}). */
    public function unsubscribe(string $token)
    {
        [$id, $sig] = array_pad(explode('-', $token, 2), 2, '');
        abort_if(! ctype_digit($id) || ! hash_equals(\App\Models\EmailCampaign::unsubToken($id), $token), 404);

        $user = \App\Models\User::find((int) $id);
        if ($user) $user->forceFill(['marketing_opt_out' => true])->save();

        return view('seo.unsubscribe', [
            'canonical' => url('/unsubscribe'),
            'metaDesc'  => 'Manage your Krama email preferences.',
            'ld'        => [],
            'ok'        => (bool) $user,
        ]);
    }

    // GET /unsubscribe-list/{token} — opt a custom-list recipient out of outreach emails.
    public function unsubscribeList(string $token)
    {
        [$id, $sig] = array_pad(explode('-', $token, 2), 2, '');
        abort_if(! ctype_digit($id) || ! hash_equals(\App\Models\EmailListRecipient::unsubToken($id), $token), 404);

        $r = \App\Models\EmailListRecipient::find((int) $id);
        if ($r) $r->forceFill(['unsubscribed' => true])->save();

        return view('seo.unsubscribe', [
            'canonical' => url('/unsubscribe'),
            'metaDesc'  => 'Manage your Krama email preferences.',
            'ld'        => [],
            'ok'        => (bool) $r,
        ]);
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

        // Include the company's timestamp so the card refreshes when the employer changes their
        // logo (the card now draws it), not only when the job itself is edited.
        // The ':v2' tag is the card-design version — bump it whenever OgImageService's rendering
        // changes so old cached PNGs are bypassed without a manual cache flush.
        $key = 'og:job:v2:' . $job->id . ':' . optional($job->updated_at)->timestamp . ':c' . optional(optional($job->company)->updated_at)->timestamp;
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
        $key = 'og:company:v2:' . $company->id . ':' . optional($company->updated_at)->timestamp . ':' . $count;
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

        // Only advertise the salary guide once it has real numbers (see salaryGuide()).
        $salary = Cache::get('seo.salary_guide.v1');
        if ($salary && ($salary['sufficient'] ?? false)) {
            $urls[] = ['loc' => url('/salary'), 'lastmod' => now()->toDateString(), 'priority' => '0.7'];
        }

        // Career-advice hub + each published article (only if the hub has content).
        $articles = Article::where('status', 'published')->select('slug', 'updated_at')->orderByDesc('published_at')->get();
        if ($articles->isNotEmpty()) {
            $urls[] = ['loc' => url('/career'), 'lastmod' => optional($articles->first()->updated_at)->toDateString(), 'priority' => '0.6'];
            foreach ($articles as $a) {
                if (! $a->slug) continue;
                $urls[] = ['loc' => url('/career/' . $a->slug), 'lastmod' => optional($a->updated_at)->toDateString(), 'priority' => '0.6'];
            }
        }

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
