<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $table = 'plans';
    public $timestamps = false;

    protected $fillable = [
        'name', 'price', 'currency', 'interval', 'job_post_limit', 'trial_days',
        'featured_credits', 'features_json', 'is_active',
    ];

    protected $casts = [
        'price'            => 'float',
        'job_post_limit'   => 'integer',
        'trial_days'       => 'integer',
        'featured_credits' => 'integer',
        'features_json'    => 'array',
        'is_active'        => 'boolean',
    ];
}
