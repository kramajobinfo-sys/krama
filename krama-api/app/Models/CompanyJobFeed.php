<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyJobFeed extends Model
{
    protected $fillable = [
        'company_id', 'url', 'format', 'enabled',
        'last_synced_at', 'last_status', 'last_error', 'imported_count',
    ];

    protected $casts = [
        'enabled'        => 'boolean',
        'last_synced_at' => 'datetime',
        'imported_count' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
