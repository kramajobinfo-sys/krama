<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'notifications';
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'type', 'title', 'body', 'link', 'read_at', 'created_at',
    ];

    protected $casts = [
        'read_at'    => 'datetime',
        'created_at' => 'datetime',
    ];

    // Create a notification for a user. Safe no-op if $userId is empty.
    // The frontend derives its navigation target from `type`.
    // (Named record() rather than push() — Eloquent\Model already has an instance push().)
    public static function record($userId, string $type, string $title, ?string $body = null, ?string $link = null): void
    {
        if (! $userId) return;

        static::create([
            'user_id'    => $userId,
            'type'       => $type,
            'title'      => $title,
            'body'       => $body,
            'link'       => $link,
            'created_at' => now(),
        ]);
    }

    // Create the same notification for every platform admin (super_admin + admin roles).
    // Used for admin-queue events like a new company or payment awaiting review.
    public static function recordAdmins(string $type, string $title, ?string $body = null, ?string $link = null): void
    {
        $adminIds = User::whereHas('role', function ($q) {
            $q->whereIn('slug', ['super_admin', 'admin']);
        })->pluck('id');

        $now  = now();
        $rows = [];
        foreach ($adminIds as $id) {
            $rows[] = [
                'user_id'    => $id,
                'type'       => $type,
                'title'      => $title,
                'body'       => $body,
                'link'       => $link,
                'read_at'    => null,
                'created_at' => $now,
            ];
        }

        if ($rows) {
            static::insert($rows);
        }
    }
}
