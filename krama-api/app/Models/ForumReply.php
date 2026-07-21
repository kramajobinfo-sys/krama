<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumReply extends Model
{
    protected $table = 'forum_replies';

    protected $fillable = [
        'thread_id', 'user_id', 'parent_id', 'body', 'is_hidden', 'vote_score',
    ];

    protected $casts = [
        'is_hidden'  => 'boolean',
        'vote_score' => 'integer',
    ];

    public function thread()
    {
        return $this->belongsTo(ForumThread::class, 'thread_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
