<?php

namespace App\Services;

use App\Models\Resume;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Generates a clean, print-ready PDF résumé from a candidate's structured résumé data.
 * Uses mPDF (already bundled for invoices) with the Battambang Khmer font so mixed
 * Latin/Khmer content shapes correctly.
 */
class CvPdfService
{
    public static function filename(User $user): string
    {
        $slug = Str::slug($user->name) ?: 'cv';
        return $slug . '-cv.pdf';
    }

    public static function pdf(User $user, ?Resume $resume): string
    {
        $view = self::viewData($user, $resume);

        $tmp = storage_path('app/mpdf');
        if (! is_dir($tmp)) @mkdir($tmp, 0775, true);

        $defaultConfig     = (new \Mpdf\Config\ConfigVariables())->getDefaults();
        $defaultFontConfig = (new \Mpdf\Config\FontVariables())->getDefaults();

        $mpdf = new \Mpdf\Mpdf([
            'mode'             => 'utf-8',
            'format'           => 'A4',
            'tempDir'          => $tmp,
            'default_font'     => 'dejavusans',
            'margin_left'      => 0,
            'margin_right'     => 0,
            'margin_top'       => 0,
            'margin_bottom'    => 0,
            // Detect script runs (Latin/Khmer) and switch fonts so Khmer shapes correctly.
            'autoScriptToLang' => true,
            'autoLangToFont'   => true,
            'fontDir'  => array_merge($defaultConfig['fontDir'], [resource_path('fonts/khmer')]),
            'fontdata' => $defaultFontConfig['fontdata'] + [
                'khmer' => [
                    'R'      => 'Battambang-Regular.ttf',
                    'B'      => 'Battambang-Bold.ttf',
                    'useOTL' => 0xFF,
                ],
            ],
        ]);
        $mpdf->SetTitle($user->name . ' — CV');
        $mpdf->WriteHTML(view('pdf.cv', $view)->render());

        return $mpdf->Output('', \Mpdf\Output\Destination::STRING_RETURN);
    }

    /** Normalise the two résumé JSON shapes into structured arrays for the Blade template. */
    public static function viewData(User $user, ?Resume $resume): array
    {
        $data  = $resume ? (array) ($resume->data ?: []) : [];
        $about = $resume ? trim(strip_tags((string) $resume->summary)) : '';

        $pick = function (array $row, array $keys) {
            foreach ($keys as $k) {
                if (trim((string) ($row[$k] ?? '')) !== '') return trim((string) $row[$k]);
            }
            return '';
        };
        $entries = function ($list, array $titleKeys, array $orgKeys, array $whenKeys) use ($pick) {
            $out = [];
            foreach ((array) $list as $row) {
                if (is_string($row) || is_numeric($row)) {
                    $row = trim((string) $row);
                    if ($row !== '') $out[] = ['title' => $row, 'org' => '', 'when' => '', 'note' => null];
                    continue;
                }
                if (! is_array($row)) continue;
                $e = [
                    'title' => $pick($row, $titleKeys),
                    'org'   => $pick($row, $orgKeys),
                    'when'  => $pick($row, $whenKeys),
                    'note'  => trim(strip_tags((string) ($row['note'] ?? $row['description'] ?? ''))) ?: null,
                ];
                if ($e['title'] !== '' || $e['org'] !== '') $out[] = $e;
            }
            return $out;
        };

        $experience = $entries($data['experience'] ?? [], ['role', 'title', 'position'], ['org', 'company', 'employer'], ['years', 'period', 'dates']);
        $education  = $entries($data['education'] ?? [], ['degree', 'qualification', 'title'], ['school', 'institution', 'university'], ['years', 'period', 'dates']);
        $certs      = $entries($data['certifications'] ?? [], ['name', 'title'], [], ['year', 'years', 'date']);

        $flat = fn ($list) => array_values(array_filter(array_map(
            fn ($s) => trim(is_array($s) ? ($s['name'] ?? $s['title'] ?? '') : (string) $s),
            (array) $list
        ), fn ($s) => $s !== ''));

        $skills    = $flat($data['skills'] ?? []);
        $languages = $flat($data['languages'] ?? []);

        $bits     = preg_split('/\s+/', trim($user->name)) ?: [];
        $initials = mb_strtoupper(mb_substr($bits[0] ?? '', 0, 1) . (count($bits) > 1 ? mb_substr(end($bits), 0, 1) : ''));

        return [
            'name'       => $user->name,
            'headline'   => $resume ? $resume->headline : null,
            'email'      => $user->email,
            'phone'      => $user->phone,
            'initials'   => $initials,
            'about'      => $about,
            'experience' => $experience,
            'education'  => $education,
            'certs'      => $certs,
            'skills'     => $skills,
            'languages'  => $languages,
            'generated'  => now()->format('M Y'),
        ];
    }
}
