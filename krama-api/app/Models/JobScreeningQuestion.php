<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobScreeningQuestion extends Model
{
    protected $table = 'job_screening_questions';

    protected $fillable = ['job_id', 'type', 'label', 'options', 'required', 'knockout', 'knockout_config', 'sort_order'];

    protected $casts = [
        'options'         => 'array',
        'knockout_config' => 'array',
        'required'        => 'boolean',
        'knockout'        => 'boolean',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
