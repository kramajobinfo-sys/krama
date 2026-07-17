<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $table = 'banners';
    public $timestamps = false;

    protected $fillable = [
        'title', 'message', 'cta_label', 'cta_url', 'theme', 'icon',
        'image_url', 'image_fit', 'text_align', 'is_active',
        'starts_at', 'ends_at', 'sort_order',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'starts_at'  => 'date',
        'ends_at'    => 'date',
        'created_at' => 'datetime',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', now()));
    }
}
