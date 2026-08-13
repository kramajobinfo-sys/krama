<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    protected $table = 'interviews';

    protected $fillable = [
        'application_id', 'company_id', 'scheduled_by', 'interviewer_id',
        'type', 'scheduled_at', 'duration_min', 'timezone', 'location', 'meeting_url', 'notes', 'status',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'duration_min' => 'integer',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function interviewer()
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }

    public function scorecards()
    {
        return $this->hasMany(InterviewScorecard::class)->orderByDesc('updated_at');
    }
}
