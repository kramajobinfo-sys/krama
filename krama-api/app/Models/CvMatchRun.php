<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CvMatchRun extends Model
{
    protected $table = 'cv_match_runs';

    protected $fillable = [
        'company_id', 'user_id', 'reference_id', 'reference_name', 'reference_headline',
        'engine', 'mode', 'cost', 'candidate_count', 'top_score', 'results',
    ];

    protected $casts = [
        'results'         => 'array',
        'cost'            => 'integer',
        'candidate_count' => 'integer',
        'top_score'       => 'integer',
        'created_at'      => 'datetime',
        'updated_at'      => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
