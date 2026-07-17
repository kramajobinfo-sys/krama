<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 'companies';

    protected $fillable = [
        'user_id', 'name', 'registration_no', 'industry', 'website',
        'address', 'location_id', 'logo_url', 'description', 'about_image_url', 'social_links',
        'cover_banner_url', 'company_size', 'culture_values', 'benefits_tags',
    ];

    protected $casts = [
        'is_verified'   => 'boolean',
        'social_links'    => 'array',
        'culture_values'  => 'array',
        'benefits_tags'   => 'array',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    // Serialized as JSON key "gallery" to match the frontend.
    public function gallery()
    {
        return $this->hasMany(CompanyPhoto::class)->orderBy('sort_order')->orderBy('id');
    }

    public function awards()
    {
        return $this->hasMany(CompanyAward::class)->orderByDesc('year')->orderBy('id');
    }

    public function followers()
    {
        return $this->hasMany(CompanyFollower::class, 'company_id');
    }
}
