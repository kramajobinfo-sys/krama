<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailListRecipient extends Model
{
    public $timestamps = false;
    protected $fillable = ['list_id', 'email', 'name', 'org', 'unsubscribed', 'created_at'];
    protected $casts = ['unsubscribed' => 'boolean'];

    // Unsubscribe token for a list recipient — {id}-{HMAC}, mirrors EmailCampaign::unsubToken.
    public static function unsubToken($id): string
    {
        $sig = substr(hash_hmac('sha256', $id . '|krama-list-unsub', (string) config('app.key')), 0, 24);
        return $id . '-' . $sig;
    }

    public static function unsubUrl($id): string
    {
        return url('/unsubscribe-list/' . self::unsubToken($id));
    }
}
