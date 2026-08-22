<?php

namespace App\Services;

use App\Models\CompanyJobFeed;
use App\Models\Job;
use App\Models\Location;
use App\Support\HtmlSanitizer;
use App\Support\SalaryParser;

/**
 * Imports an employer's OWN careers / ATS feed as NATIVE draft jobs under their
 * company (full content, apply on Krama). Legitimate because it is the company's
 * own consented content. Idempotent: each item maps to a job via `import_ref`, so
 * re-syncing updates the same row and never touches an employer's chosen status.
 * Never throws — records ok/error on the feed so one bad sync can't break anything.
 */
class CompanyJobFeedService
{
    public static function sync(CompanyJobFeed $feed): array
    {
        try {
            $body = (new FeedImportService())->fetch($feed->url);
            if (! $body) {
                return self::fail($feed, 'Could not fetch the feed URL (timeout or blocked).');
            }

            $items = $feed->format === 'json' ? self::parseJson($body) : self::parseXml($body);
            if (empty($items)) {
                return self::fail($feed, 'No job items found — check the URL and that the format matches.');
            }

            $company = $feed->company;
            $locMap = Location::get(['id', 'name'])->mapWithKeys(fn ($l) => [mb_strtolower($l->name) => $l->id])->all();

            $imported = $updated = $skipped = 0;
            foreach ($items as $it) {
                $ref   = $it['ref'];
                $title = trim($it['title'] ?? '');
                if ($ref === '' || $title === '') { $skipped++; continue; }

                $locName = trim($it['location'] ?? '');
                $locId   = $locName !== '' ? ($locMap[mb_strtolower($locName)] ?? null) : null;

                $fields = [
                    'title'        => mb_substr($title, 0, 190),
                    'description'  => self::html($it['description'] ?? ''),
                    'job_type'     => self::jobType($it['job_type'] ?? '') ?: 'full_time',
                    'location_id'  => $locId,
                    'map_location' => ($locId === null && $locName !== '') ? mb_substr($locName, 0, 500) : null,
                ];

                // Capture salary — an explicit feed field first, else parse it out of the body.
                $sal = SalaryParser::parse($it['salary'] ?? '') ?: SalaryParser::fromDescription($it['description'] ?? '');

                $existing = Job::where('company_id', $company->id)->where('import_ref', $ref)->first();
                if ($existing) {
                    // Refresh content only — never override the employer's status / edits to title-slug.
                    // Only fill salary when the row has none, so a manual entry is never clobbered.
                    if ($sal && $existing->salary_min === null && $existing->salary_max === null) {
                        $fields += self::salaryFields($sal);
                    }
                    $existing->fill($fields)->save();
                    $updated++;
                } else {
                    if ($sal) $fields += self::salaryFields($sal);
                    Job::create(array_merge($fields, [
                        'company_id' => $company->id,
                        'user_id'    => $company->user_id,
                        'import_ref' => $ref,
                        'slug'       => Job::generateSlug($title),
                        'status'     => 'draft',
                    ]));
                    $imported++;
                }
            }

            $total = Job::where('company_id', $company->id)->whereNotNull('import_ref')->count();
            $feed->forceFill(['last_synced_at' => now(), 'last_status' => 'ok', 'last_error' => null, 'imported_count' => $total])->save();

            return ['ok' => true, 'imported' => $imported, 'updated' => $updated, 'skipped' => $skipped, 'total' => $total, 'error' => null];
        } catch (\Throwable $e) {
            return self::fail($feed, mb_substr($e->getMessage(), 0, 180));
        }
    }

    private static function fail(CompanyJobFeed $feed, string $msg): array
    {
        $feed->forceFill(['last_synced_at' => now(), 'last_status' => 'error', 'last_error' => $msg])->save();
        return ['ok' => false, 'imported' => 0, 'updated' => 0, 'skipped' => 0, 'total' => (int) $feed->imported_count, 'error' => $msg];
    }

    // ── parsers (keep the FULL description — this is native content, not a snippet) ──

    private static function parseXml(string $body): array
    {
        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($body);
        if (! $xml) return [];
        $ns = $xml->getNamespaces(true);

        $entries = [];
        if (isset($xml->channel->item))       $entries = $xml->channel->item;   // RSS
        elseif (isset($xml->entry))            $entries = $xml->entry;           // Atom

        $items = [];
        foreach ($entries as $e) {
            $title = trim((string) $e->title);
            $link  = self::xmlLink($e);
            $id    = trim((string) ($e->guid ?? $e->id ?? '')) ?: ($link ?: $title);

            $desc = '';
            if (isset($ns['content'])) {
                $c = $e->children($ns['content']);
                if (isset($c->encoded)) $desc = (string) $c->encoded;
            }
            if ($desc === '') $desc = (string) ($e->description ?? $e->content ?? $e->summary ?? '');

            $items[] = [
                'ref'         => substr(hash('sha256', $id), 0, 40),
                'title'       => $title,
                'description' => $desc,
                'location'    => self::firstXml($e, ['location', 'region', 'city']),
                'job_type'    => self::firstXml($e, ['job_type', 'type', 'employmentType']),
                'salary'      => self::firstXml($e, ['salary', 'compensation', 'salary_text']),
            ];
        }
        return $items;
    }

    private static function parseJson(string $body): array
    {
        $data = json_decode($body, true);
        if (! is_array($data)) return [];

        $rows = null;
        if (array_is_list($data)) {
            $rows = $data;
        } else {
            foreach (['jobs', 'data', 'postings', 'results', 'items'] as $k) {
                if (isset($data[$k]) && is_array($data[$k])) { $rows = $data[$k]; break; }
            }
        }
        if (! $rows) return [];

        $items = [];
        foreach ($rows as $r) {
            if (! is_array($r)) continue;
            $title = (string) ($r['title'] ?? $r['text'] ?? $r['name'] ?? '');
            $id    = (string) ($r['id'] ?? $r['shortcode'] ?? $r['absolute_url'] ?? $r['hostedUrl'] ?? $title);

            // Greenhouse: HTML-escaped 'content'; Lever: 'description' + structured 'lists'; generic: description/body.
            $desc = (string) ($r['content'] ?? $r['descriptionHtml'] ?? $r['description'] ?? $r['body'] ?? '');
            if (isset($r['content'])) $desc = html_entity_decode($desc, ENT_QUOTES | ENT_HTML5);
            if (isset($r['lists']) && is_array($r['lists'])) {
                foreach ($r['lists'] as $l) {
                    $desc .= '<p><strong>' . htmlspecialchars((string) ($l['text'] ?? '')) . '</strong></p>' . (string) ($l['content'] ?? '');
                }
            }

            $loc = '';
            if (isset($r['location'])) $loc = is_array($r['location']) ? (string) ($r['location']['name'] ?? '') : (string) $r['location'];
            elseif (isset($r['categories']['location'])) $loc = (string) $r['categories']['location'];

            $salary = '';
            if (isset($r['baseSalary']['value'])) {
                $v = $r['baseSalary']['value'];
                $salary = is_array($v) ? trim(($v['minValue'] ?? '') . '-' . ($v['maxValue'] ?? '') . ' ' . ($r['baseSalary']['currency'] ?? '') . ' /' . ($v['unitText'] ?? '')) : (string) $v;
            } elseif (isset($r['salary'])) {
                $salary = is_array($r['salary']) ? '' : (string) $r['salary'];
            }

            $items[] = [
                'ref'         => substr(hash('sha256', $id), 0, 40),
                'title'       => $title,
                'description' => $desc,
                'location'    => $loc,
                'job_type'    => (string) ($r['metadata']['employment_type'] ?? $r['categories']['commitment'] ?? ''),
                'salary'      => $salary,
            ];
        }
        return $items;
    }

    private static function xmlLink(\SimpleXMLElement $e): string
    {
        if (isset($e->link) && (string) $e->link !== '') return trim((string) $e->link);   // RSS
        if (isset($e->link['href'])) return trim((string) $e->link['href']);                 // Atom
        foreach ($e->link ?? [] as $l) {
            if (isset($l['href'])) return trim((string) $l['href']);
        }
        return '';
    }

    private static function firstXml(\SimpleXMLElement $e, array $names): string
    {
        foreach ($names as $n) {
            if (isset($e->{$n}) && trim((string) $e->{$n}) !== '') return trim((string) $e->{$n});
        }
        return '';
    }

    private static function html($v): ?string
    {
        $v = trim((string) $v);
        if ($v === '') return null;
        if (! preg_match('/<[a-z][\s\S]*>/i', $v)) $v = '<p>' . nl2br(e($v)) . '</p>';
        return HtmlSanitizer::clean($v);
    }

    /** Map a SalaryParser result to the Job's structured salary columns. */
    private static function salaryFields(array $sal): array
    {
        return [
            'salary_min'      => $sal['min'],
            'salary_max'      => $sal['max'],
            'salary_currency' => $sal['currency'],
            'salary_period'   => $sal['period'],
        ];
    }

    private static function jobType(string $v): ?string
    {
        $v = str_replace([' ', '-'], '_', mb_strtolower(trim($v)));
        $map = [
            'full_time' => 'full_time', 'fulltime' => 'full_time',
            'part_time' => 'part_time', 'parttime' => 'part_time',
            'contract' => 'contract', 'contractor' => 'contract', 'freelance' => 'contract',
            'internship' => 'internship', 'intern' => 'internship',
            'temporary' => 'temporary', 'temp' => 'temporary',
        ];
        return $map[$v] ?? null;
    }
}
