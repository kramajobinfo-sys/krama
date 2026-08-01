<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalCompany extends Model
{
    protected $fillable = [
        'feed_source_id', 'external_id', 'source_name', 'profile_url', 'name',
        'logo_url', 'industry', 'location_text', 'website',
        'description_excerpt', 'fetched_at', 'is_active',
    ];

    protected $casts = [
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
