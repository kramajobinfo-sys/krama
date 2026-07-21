<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumSubscription extends Model
{
    protected $table = 'forum_subscriptions';

    protected $fillable = [
        'user_id', 'thread_id', 'last_notified_at',
    ];

    protected $casts = [
        'last_notified_at' => 'datetime',
    ];

    public function thread()
    {
        return $this->belongsTo(ForumThread::class, 'thread_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
