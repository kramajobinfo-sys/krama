<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedSource extends Model
{
    protected $fillable = [
        'name', 'url', 'kind', 'format', 'enabled', 'mapping',
        'last_fetched_at', 'last_status', 'last_error', 'item_count',
    ];

    protected $casts = [
        'enabled'         => 'boolean',
        'mapping'         => 'array',
        'last_fetched_at' => 'datetime',
        'item_count'      => 'integer',
    ];

    public function externalJobs()
    {
        return $this->hasMany(ExternalJob::class);
    }

    public function externalCompanies()
    {
        return $this->hasMany(ExternalCompany::class);
    }
}
