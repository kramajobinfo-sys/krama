<?php

namespace App\Services;

use App\Models\Job;
use App\Models\JobScreeningQuestion;

// Screening-question persistence + answer normalisation + knockout evaluation.
class ScreeningService
{
    // Replace a job's screening questions from a validated array (match by id where present,
    // create new, delete removed). Passing null leaves the existing set untouched.
    public static function syncQuestions(Job $job, ?array $questions): void
    {
        if ($questions === null) {
            return;
        }

        $existing = $job->screeningQuestions()->get()->keyBy('id');
        $keep = [];

        foreach (array_values($questions) as $i => $q) {
            $payload = [
                'type'            => $q['type'],
                'label'           => trim((string) ($q['label'] ?? '')),
                'options'         => self::cleanOptions($q['options'] ?? null),
                'required'        => (bool) ($q['required'] ?? true),
                'knockout'        => (bool) ($q['knockout'] ?? false),
                'knockout_config' => ($q['knockout'] ?? false) ? ($q['knockout_config'] ?? null) : null,
                'sort_order'      => $i,
            ];
            if (! empty($q['id']) && $existing->has($q['id'])) {
                $existing[$q['id']]->update($payload);
                $keep[] = (int) $q['id'];
            } else {
                $keep[] = $job->screeningQuestions()->create($payload)->id;
            }
        }

        $job->screeningQuestions()->whereNotIn('id', $keep ?: [0])->delete();
    }

    private static function cleanOptions($options): ?array
    {
        if (! is_array($options)) {
            return null;
        }
        $out = array_values(array_filter(array_map(fn ($o) => trim((string) $o), $options), fn ($o) => $o !== ''));
        return $out ?: null;
    }

    // Human-readable answer stored for the employer (null = blank).
    public static function answerText(JobScreeningQuestion $q, $raw): ?string
    {
        if ($q->type === 'multi_choice') {
            $sel = is_array($raw) ? $raw : (strlen((string) $raw) ? [(string) $raw] : []);
            $sel = array_values(array_filter(array_map('strval', $sel), fn ($s) => $s !== ''));
            return $sel ? implode(', ', $sel) : null;
        }
        if ($raw === null || $raw === '' || $raw === []) {
            return null;
        }
        if ($q->type === 'yes_no') {
            return (in_array($raw, ['yes', 'Yes', '1', true, 1], true)) ? 'Yes' : 'No';
        }
        return is_scalar($raw) ? (string) $raw : json_encode($raw);
    }

    // Knockout result: null when not a knockout question (or not applicable), else pass/fail.
    public static function evaluate(JobScreeningQuestion $q, $raw): ?bool
    {
        if (! $q->knockout) {
            return null;
        }
        $cfg = $q->knockout_config ?: [];

        switch ($q->type) {
            case 'yes_no':
                if (! isset($cfg['equals'])) return null;
                $val = in_array($raw, ['yes', 'Yes', '1', true, 1], true) ? 'yes' : 'no';
                return $val === strtolower((string) $cfg['equals']);

            case 'single_choice':
                $accept = array_map('strval', $cfg['accept'] ?? []);
                return in_array((string) $raw, $accept, true);

            case 'multi_choice':
                $accept = array_map('strval', $cfg['accept'] ?? []);
                $sel = is_array($raw) ? array_map('strval', $raw) : [];
                foreach ($sel as $s) {
                    if (in_array($s, $accept, true)) return true;
                }
                return false;

            case 'number':
                if (! isset($cfg['op'], $cfg['value']) || ! is_numeric($raw)) return false;
                return self::compare((float) $raw, (string) $cfg['op'], (float) $cfg['value']);

            case 'date':
                if (! isset($cfg['op'], $cfg['value'])) return null;
                $a = strtotime((string) $raw);
                $b = strtotime((string) $cfg['value']);
                if ($a === false || $b === false) return false;
                return self::compare($a, (string) $cfg['op'], $b);

            default:
                return null; // text / textarea are never knockout
        }
    }

    private static function compare($a, string $op, $b): bool
    {
        switch ($op) {
            case '>=': return $a >= $b;
            case '<=': return $a <= $b;
            case '>':  return $a > $b;
            case '<':  return $a < $b;
            case '==': return $a == $b;
            default:   return false;
        }
    }
}
