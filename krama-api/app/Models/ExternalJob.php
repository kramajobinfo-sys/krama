<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalJob extends Model
{
    protected $fillable = [
        'feed_source_id', 'external_id', 'source_name', 'apply_url', 'title',
        'company_name', 'location_text', 'job_type', 'salary_text',
        'description_excerpt', 'posted_at', 'fetched_at', 'is_active',
    ];

    protected $casts = [
        'posted_at'  => 'datetime',
        'fetched_at' => 'datetime',
        'is_active'  => 'boolean',
    ];

    public function feedSource()
    {
        return $this->belongsTo(FeedSource::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
