<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumThread extends Model
{
    protected $table = 'forum_threads';

    protected $fillable = [
        'category_id', 'user_id', 'title', 'slug', 'body',
        'is_pinned', 'is_locked', 'is_hidden',
        'views', 'reply_count', 'vote_score', 'last_activity_at', 'last_reply_user_id',
    ];

    protected $casts = [
        'is_pinned'        => 'boolean',
        'is_locked'        => 'boolean',
        'is_hidden'        => 'boolean',
        'views'            => 'integer',
        'reply_count'      => 'integer',
        'vote_score'       => 'integer',
        'last_activity_at' => 'datetime',
    ];

    public function category()
    {
        return $this->belongsTo(ForumCategory::class, 'category_id');
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function replies()
    {
        return $this->hasMany(ForumReply::class, 'thread_id');
    }

    public function tags()
    {
        return $this->belongsToMany(ForumTag::class, 'forum_thread_tag', 'thread_id', 'tag_id');
    }
}
