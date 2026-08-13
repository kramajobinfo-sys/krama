<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CandidateInvitation extends Model
{
    protected $table = 'candidate_invitations';

    protected $fillable = [
        'company_id', 'job_id', 'candidate_id', 'invited_by', 'message', 'status',
        'expires_at', 'viewed_at', 'responded_at',
    ];

    protected $casts = [
        'expires_at'   => 'datetime',
        'viewed_at'    => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    // Effective status, treating a lapsed sent/viewed invite as expired without a cron job.
    public function effectiveStatus(): string
    {
        if (in_array($this->status, ['sent', 'viewed'], true) && $this->expires_at && $this->expires_at->isPast()) {
            return 'expired';
        }
        return $this->status;
    }
}
