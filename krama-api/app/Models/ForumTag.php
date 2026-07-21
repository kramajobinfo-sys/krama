<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumTag extends Model
{
    protected $table = 'forum_tags';

    protected $fillable = [
        'name', 'slug', 'thread_count',
    ];

    protected $casts = [
        'thread_count' => 'integer',
    ];

    public function threads()
    {
        return $this->belongsToMany(ForumThread::class, 'forum_thread_tag', 'tag_id', 'thread_id');
    }
}
