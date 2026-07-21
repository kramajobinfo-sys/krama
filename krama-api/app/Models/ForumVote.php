<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumVote extends Model
{
    protected $table = 'forum_votes';

    protected $fillable = [
        'user_id', 'votable_type', 'votable_id', 'value',
    ];

    protected $casts = [
        'value' => 'integer',
    ];
}
