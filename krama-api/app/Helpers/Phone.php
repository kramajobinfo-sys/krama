<?php

namespace App\Helpers;

class Phone
{
    // Normalize a raw phone string to E.164 (+855…). Cambodia-aware:
    //   012 345 678 / 012345678 → +85512345678
    //   85512345678             → +85512345678
    //   +85512345678            → unchanged
    public static function normalize(?string $raw): ?string
    {
        if ($raw === null) {
            return null;
        }
        $s = preg_replace('/[^\d+]/', '', $raw); // keep digits and a leading +
        if ($s === '' || $s === '+') {
            return null;
        }
        if ($s[0] === '+') {
            return $s;
        }
        if (strpos($s, '855') === 0) {
            return '+' . $s;
        }
        if ($s[0] === '0') {
            return '+855' . substr($s, 1);
        }

        return '+855' . $s; // bare local number without the leading 0
    }

    public static function isValid(?string $e164): bool
    {
        return $e164 !== null && preg_match('/^\+\d{8,15}$/', $e164) === 1;
    }
}
