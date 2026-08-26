<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailCampaign extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'subject', 'body', 'audience', 'status',
        'template_id', 'list_id', 'scheduled_at',
        'total_recipients', 'sent_count', 'failed_count',
        'created_by', 'created_at', 'sent_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
    ];

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

