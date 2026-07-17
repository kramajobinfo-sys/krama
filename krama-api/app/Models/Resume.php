<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resume extends Model
{
    protected $table = 'resumes';

    protected $fillable = [
        'candidate_id', 'headline', 'summary', 'file_url', 'is_primary', 'data',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'data'       => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }
}
