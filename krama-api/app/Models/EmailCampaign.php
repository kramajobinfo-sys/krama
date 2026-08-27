<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailCampaign extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'subject', 'body', 'audience', 'status',
        'template_id', 'list_id', 'scheduled_at', 'batch_size', 'batch_cursor',
        'total_recipients', 'sent_count', 'failed_count',
        'created_by', 'created_at', 'sent_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

    // Substitute merge fields in a subject/body. Tolerant of spacing + case + common aliases,
    // so {{name}}, {{ Name }}, {{full_name}}, {{org}}, {{organization}}, {{company}} all work.
    public static function merge(string $text, ?string $name, ?string $org): string
    {
        $name = trim((string) $name);
        $org  = trim((string) $org);
        $nameVal = $name !== '' ? $name : 'there';
        // No org for this recipient (e.g. a candidate, or an employer with no company on file)
        // → a neutral phrase. Never fall back to the person's name (that rendered "invite
        // {{org}}" as "invite <Person Name>").
        $orgVal  = $org !== '' ? $org : 'your organization';
        $text = preg_replace('/\{\{\s*(name|full[_ ]?name|contact[_ ]?name|contact)\s*\}\}/i', $nameVal, $text);
        $text = preg_replace('/\{\{\s*(org|organi[sz]ation|company)\s*\}\}/i', $orgVal, $text);
        return $text;
    }

    // Unsubscribe token — {userId}-{HMAC}, stable + non-enumerable, no DB column (same
    // pattern as the Digital-CV token). Verified with hash_equals in the unsubscribe route.
    public static function unsubToken($userId): string
    {
        $sig = substr(hash_hmac('sha256', $userId . '|krama-unsub', (string) config('app.key')), 0, 24);
        return $userId . '-' . $sig;
    }

    public static function unsubUrl($userId): string
    {
        return url('/unsubscribe/' . self::unsubToken($userId));
    }
}

