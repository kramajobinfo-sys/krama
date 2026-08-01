<?php

namespace App\Services;

use App\Models\ExternalCompany;
use App\Models\ExternalJob;
use App\Models\FeedSource;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Aggregates external job/company listings from admin-configured feeds
 * (RSS / Atom / JSON-LD / JSON) into the `external_*` tables.
 *
 * Legally-defensible design: we store title + short SNIPPET + a link BACK to the
 * source (apply_url / profile_url), never the full copyrighted body, and every
 * item keeps its source attribution. Fetches identify themselves with a real
 * User-Agent and time out — only admin-added URLs are ever fetched.
 */
class FeedImportService
{
    private const USER_AGENT      = 'KramaJobBot/1.0 (+https://kramajob.com/about)';
    private const FETCH_TIMEOUT   = 20;   // seconds
    private const MAX_ITEMS       = 500;  // safety cap per run
    private const EXCERPT_CHARS    = 300; // snippet only — never the full description

    /**
     * Import one source: fetch → parse → upsert → deactivate vanished items.
     * Never throws — records the error on the source and returns a stats array,
     * so one bad feed can't break a batch run.
     *
     * @return array{ok:bool, imported:int, deactivated:int, error:?string}
     */
    public function import(FeedSource $source): array
    {
        try {
            $body = $this->fetch($source->url);
            if ($body === null) {
                return $this->markError($source, 'Could not fetch the feed (network/timeout/HTTP error).');
            }

            $items = $source->kind === 'companies'
                ? $this->parseCompanies($body, $source->format)
                : $this->parseJobs($body, $source->format);

            $items = array_slice($items, 0, self::MAX_ITEMS);

            $seen = [];
            foreach ($items as $it) {
                if (empty($it['external_id']) || empty($it['title'] ?? $it['name'] ?? null)) {
                    continue; // skip unusable rows
                }
                $seen[] = $it['external_id'];
                $this->upsert($source, $it);
            }

            // Anything previously imported from this source but absent now → mark inactive.
            $model = $source->kind === 'companies' ? ExternalCompany::class : ExternalJob::class;
            $deactivated = $model::where('feed_source_id', $source->id)
                ->when(count($seen) > 0, fn ($q) => $q->whereNotIn('external_id', $seen))
                ->where('is_active', true)
                ->update(['is_active' => false]);

            $source->update([
                'last_fetched_at' => now(),
                'last_status'     => 'ok',
                'last_error'      => null,
                'item_count'      => count($seen),
            ]);

            return ['ok' => true, 'imported' => count($seen), 'deactivated' => $deactivated, 'error' => null];
        } catch (\Throwable $e) {
            Log::warning('feed.import_failed', ['source' => $source->id, 'error' => $e->getMessage()]);
            return $this->markError($source, $e->getMessage());
        }
    }

    private function markError(FeedSource $source, string $msg): array
    {
        $source->update(['last_fetched_at' => now(), 'last_status' => 'error', 'last_error' => Str::limit($msg, 500)]);
        return ['ok' => false, 'imported' => 0, 'deactivated' => 0, 'error' => $msg];
    }

    /** Fetch raw feed body. Returns null on any failure (caller records the error). */
    public function fetch(string $url): ?string
    {
        try {
            $res = Http::timeout(self::FETCH_TIMEOUT)
                ->withHeaders(['User-Agent' => self::USER_AGENT, 'Accept' => '*/*'])
                ->get($url);
            return $res->successful() ? $res->body() : null;
        } catch (\Throwable $e) {
            Log::warning('feed.fetch_failed', ['url' => $url, 'error' => $e->getMessage()]);
            return null;
        }
    }

    // ---------------------------------------------------------------------
    //  Parsers — pure functions (no I/O), so they are unit-testable with a
    //  local sample body and no network.
    // ---------------------------------------------------------------------

    /** @return array<int,array<string,mixed>> normalized job items */
    public function parseJobs(string $body, string $format): array
    {
        return match ($format) {
            'json'   => $this->mapJobs($this->decodeJson($body)),
            'jsonld' => $this->mapJobs($this->extractJsonLd($body, 'JobPosting')),
            default  => $this->parseXmlJobs($body),   // rss + atom
        };
    }

    /** @return array<int,array<string,mixed>> normalized company items */
    public function parseCompanies(string $body, string $format): array
    {
        return match ($format) {
            'json'   => $this->mapCompanies($this->decodeJson($body)),
            'jsonld' => $this->mapCompanies($this->extractJsonLd($body, 'Organization')),
            default  => $this->parseXmlCompanies($body),
        };
    }

    // ---- XML (RSS 2.0 + Atom) -------------------------------------------

    private function loadXml(string $body): ?\SimpleXMLElement
    {
        $prev = libxml_use_internal_errors(true);
        $xml  = simplexml_load_string(trim($body), \SimpleXMLElement::class, LIBXML_NOCDATA | LIBXML_NONET);
        libxml_clear_errors();
        libxml_use_internal_errors($prev);
        return $xml ?: null;
    }

    /** @return array<int,\SimpleXMLElement> */
    private function xmlEntries(\SimpleXMLElement $xml): array
    {
        // NB: iterator_to_array() keys SimpleXML siblings by node name, collapsing
        // same-named <item>/<entry> nodes — pass use_keys=false to keep them all.
        if (isset($xml->channel->item)) {              // RSS 2.0
            return iterator_to_array($xml->channel->item, false);
        }
        if (isset($xml->entry)) {                      // Atom
            return iterator_to_array($xml->entry, false);
        }
        return [];
    }

    private function parseXmlJobs(string $body): array
    {
        $xml = $this->loadXml($body);
        if (! $xml) return [];
        $out = [];
        foreach ($this->xmlEntries($xml) as $e) {
            $link  = $this->xmlLink($e);
            $title = trim((string) $e->title);
            if ($title === '') continue;
            $desc  = (string) ($e->description ?? $e->summary ?? $e->content ?? '');
            $out[] = [
                'external_id'         => $this->externalId($e, $link, $title),
                'title'               => Str::limit($title, 250, ''),
                'apply_url'           => $link,
                'company_name'        => $this->firstTag($e, ['company', 'creator', 'author', 'source']),
                'location_text'       => $this->firstTag($e, ['location', 'region', 'city']),
                'job_type'            => $this->firstTag($e, ['job_type', 'type', 'category']),
                'salary_text'         => $this->firstTag($e, ['salary', 'compensation']),
                'description_excerpt' => $this->excerpt($desc),
                'posted_at'           => $this->parseDate((string) ($e->pubDate ?? $e->published ?? $e->updated ?? '')),
            ];
        }
        return $out;
    }

    private function parseXmlCompanies(string $body): array
    {
        $xml = $this->loadXml($body);
        if (! $xml) return [];
        $out = [];
        foreach ($this->xmlEntries($xml) as $e) {
            $link = $this->xmlLink($e);
            $name = trim((string) $e->title);
            if ($name === '') continue;
            $desc = (string) ($e->description ?? $e->summary ?? $e->content ?? '');
            $out[] = [
                'external_id'         => $this->externalId($e, $link, $name),
                'name'                => Str::limit($name, 250, ''),
                'profile_url'         => $link,
                'logo_url'            => $this->firstTag($e, ['logo', 'image']),
                'industry'            => $this->firstTag($e, ['industry', 'category', 'sector']),
                'location_text'       => $this->firstTag($e, ['location', 'region', 'city']),
                'website'             => $this->firstTag($e, ['website', 'url']),
                'description_excerpt' => $this->excerpt($desc),
            ];
        }
        return $out;
    }

    private function xmlLink(\SimpleXMLElement $e): string
    {
        // RSS: <link>text</link>. Atom: <link href="..."/> (prefer rel="alternate").
        if (isset($e->link) && (string) $e->link !== '') {
            return trim((string) $e->link);
        }
        if (isset($e->link['href'])) {
            return trim((string) $e->link['href']);
        }
        foreach ($e->link ?? [] as $l) {
            if ((string) ($l['rel'] ?? 'alternate') === 'alternate') {
                return trim((string) $l['href']);
            }
        }
        return '';
    }

    /** First non-empty value among candidate child-tag names (case-insensitive-ish). */
    private function firstTag(\SimpleXMLElement $e, array $names): ?string
    {
        foreach ($names as $n) {
            if (isset($e->{$n}) && trim((string) $e->{$n}) !== '') {
                return Str::limit(trim(strip_tags((string) $e->{$n})), 200, '');
            }
        }
        return null;
    }

    private function externalId(\SimpleXMLElement $e, string $link, string $fallback): string
    {
        $guid = trim((string) ($e->guid ?? $e->id ?? ''));
        $raw  = $guid !== '' ? $guid : ($link !== '' ? $link : $fallback);
        return substr(hash('sha256', $raw), 0, 40); // stable, index-friendly length
    }

    // ---- JSON / JSON-LD -------------------------------------------------

    private function decodeJson(string $body): array
    {
        $data = json_decode($body, true);
        if (! is_array($data)) return [];
        // Accept a bare array, or {jobs|companies|data|items:[...]}
        foreach (['jobs', 'companies', 'data', 'items', 'results'] as $k) {
            if (isset($data[$k]) && is_array($data[$k])) return $data[$k];
        }
        return array_is_list($data) ? $data : [$data];
    }

    /** Pull ld+json <script> blocks from an HTML body and collect nodes of the given @type. */
    private function extractJsonLd(string $html, string $type): array
    {
        if (! preg_match_all('#<script[^>]+application/ld\+json[^>]*>(.*?)</script>#is', $html, $m)) {
            return [];
        }
        $out = [];
        foreach ($m[1] as $block) {
            $data = json_decode(trim($block), true);
            if (! is_array($data)) continue;
            $nodes = isset($data['@graph']) && is_array($data['@graph']) ? $data['@graph']
                : (array_is_list($data) ? $data : [$data]);
            foreach ($nodes as $node) {
                $t = $node['@type'] ?? null;
                $types = is_array($t) ? $t : [$t];
                if (in_array($type, $types, true)) $out[] = $node;
            }
        }
        return $out;
    }

    private function mapJobs(array $rows): array
    {
        $out = [];
        foreach ($rows as $r) {
            if (! is_array($r)) continue;
            $title = (string) ($r['title'] ?? $r['name'] ?? '');
            $link  = (string) ($r['apply_url'] ?? $r['url'] ?? $r['link'] ?? ($r['hiringOrganization']['sameAs'] ?? ''));
            if ($title === '') continue;
            $org = $r['hiringOrganization']['name'] ?? $r['company'] ?? $r['employer'] ?? null;
            $out[] = [
                'external_id'         => substr(hash('sha256', (string) ($r['identifier']['value'] ?? $r['id'] ?? $link ?: $title)), 0, 40),
                'title'               => Str::limit($title, 250, ''),
                'apply_url'           => $link,
                'company_name'        => $org ? Str::limit((string) $org, 200, '') : null,
                'location_text'       => $this->jsonLocation($r),
                'job_type'            => isset($r['employmentType']) ? Str::limit((string) (is_array($r['employmentType']) ? implode(',', $r['employmentType']) : $r['employmentType']), 40, '') : ($r['job_type'] ?? null),
                'salary_text'         => isset($r['baseSalary']['value']['value']) ? (string) $r['baseSalary']['value']['value'] : ($r['salary'] ?? null),
                'description_excerpt' => $this->excerpt((string) ($r['description'] ?? '')),
                'posted_at'           => $this->parseDate((string) ($r['datePosted'] ?? $r['date'] ?? $r['posted_at'] ?? '')),
            ];
        }
        return $out;
    }

    private function mapCompanies(array $rows): array
    {
        $out = [];
        foreach ($rows as $r) {
            if (! is_array($r)) continue;
            $name = (string) ($r['name'] ?? '');
            $link = (string) ($r['profile_url'] ?? $r['url'] ?? $r['sameAs'] ?? $r['link'] ?? '');
            if ($name === '') continue;
            $out[] = [
                'external_id'         => substr(hash('sha256', (string) ($r['id'] ?? $link ?: $name)), 0, 40),
                'name'                => Str::limit($name, 250, ''),
                'profile_url'         => $link,
                'logo_url'            => (string) ($r['logo'] ?? $r['logo_url'] ?? $r['image'] ?? '') ?: null,
                'industry'            => isset($r['industry']) ? Str::limit((string) $r['industry'], 120, '') : null,
                'location_text'       => $this->jsonLocation($r),
                'website'             => (string) ($r['website'] ?? $r['url'] ?? '') ?: null,
                'description_excerpt' => $this->excerpt((string) ($r['description'] ?? '')),
            ];
        }
        return $out;
    }

    private function jsonLocation(array $r): ?string
    {
        $loc = $r['jobLocation']['address'] ?? $r['address'] ?? $r['location'] ?? null;
        if (is_array($loc)) {
            $parts = array_filter([$loc['addressLocality'] ?? null, $loc['addressRegion'] ?? null, $loc['addressCountry'] ?? null]);
            $loc = implode(', ', $parts);
        }
        $loc = trim((string) $loc);
        return $loc !== '' ? Str::limit($loc, 200, '') : null;
    }

    // ---- shared helpers -------------------------------------------------

    private function excerpt(string $html): ?string
    {
        $text = trim(preg_replace('/\s+/', ' ', strip_tags(html_entity_decode($html))));
        return $text !== '' ? Str::limit($text, self::EXCERPT_CHARS) : null;
    }

    private function parseDate(string $raw): ?Carbon
    {
        $raw = trim($raw);
        if ($raw === '') return null;
        // Strip a leading weekday token (e.g. "Mon, ") — it's redundant with the
        // numeric date and a wrong one (some feeds emit them) would skew strtotime.
        $raw = preg_replace('/^[A-Za-z]{3,9},\s*/', '', $raw);
        try {
            return Carbon::parse($raw);
        } catch (\Throwable) {
            return null;
        }
    }

    private function upsert(FeedSource $source, array $it): void
    {
        $common = [
            'source_name'         => $source->name,
            'description_excerpt' => $it['description_excerpt'] ?? null,
            'fetched_at'          => now(),
            'is_active'           => true,
        ];

        if ($source->kind === 'companies') {
            ExternalCompany::updateOrCreate(
                ['feed_source_id' => $source->id, 'external_id' => $it['external_id']],
                $common + [
                    'name'          => $it['name'],
                    'profile_url'   => $it['profile_url'] ?? '',
                    'logo_url'      => $it['logo_url'] ?? null,
                    'industry'      => $it['industry'] ?? null,
                    'location_text' => $it['location_text'] ?? null,
                    'website'       => $it['website'] ?? null,
                ]
            );
            return;
        }

        ExternalJob::updateOrCreate(
            ['feed_source_id' => $source->id, 'external_id' => $it['external_id']],
            $common + [
                'title'         => $it['title'],
                'apply_url'     => $it['apply_url'] ?? '',
                'company_name'  => $it['company_name'] ?? null,
                'location_text' => $it['location_text'] ?? null,
                'job_type'      => $it['job_type'] ?? null,
                'salary_text'   => $it['salary_text'] ?? null,
                'posted_at'     => $it['posted_at'] ?? null,
            ]
        );
    }
}
