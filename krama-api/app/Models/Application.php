<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $table = 'applications';

    protected $fillable = [
        'job_id', 'candidate_id', 'resume_id', 'cover_note', 'stage',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    public function resume()
    {
        return $this->belongsTo(Resume::class);
    }

    public function notes()
    {
        return $this->hasMany(ApplicationNote::class)->orderByDesc('created_at');
    }

    public function tags()
    {
        return $this->hasMany(ApplicationTag::class)->orderBy('label');
    }

    public function answers()
    {
        return $this->hasMany(ApplicationAnswer::class);
    }

    public function interviews()
    {
        return $this->hasMany(Interview::class)->orderBy('scheduled_at');
    }
}
