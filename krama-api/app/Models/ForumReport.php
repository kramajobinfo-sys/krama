<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumReport extends Model
{
    protected $table = 'forum_reports';

    protected $fillable = [
        'reporter_id', 'reportable_type', 'reportable_id',
        'reason', 'note', 'status', 'resolved_by', 'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}
