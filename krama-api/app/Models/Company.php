<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 'companies';

    protected $fillable = [
        'user_id', 'name', 'registration_no', 'industry', 'website',
        'address', 'phone', 'contact_name', 'contact_email', 'location_id', 'logo_url', 'description', 'about_image_url', 'social_links',
        'cover_banner_url', 'company_size', 'culture_values', 'benefits_tags',
        'telegram_chat_id', 'vat_tin', 'vat_legal_name', 'vat_address',
        'premium_until', 'premium_reminder_sent_at',
    ];

    // org_doc_path is the raw on-disk filename of the proof document — never expose it;
    // the document is reached only through the auth-gated org-document route.
    protected $hidden = ['org_doc_path'];

    protected $casts = [
        'is_verified'   => 'boolean',
        // org_status / org_type are set only by the admin review endpoint (forceFill), never
        // mass-assigned — an employer must not be able to self-verify for the free org plan.
        'org_verified_at' => 'datetime',
        'social_links'    => 'array',
        'culture_values'  => 'array',
        'benefits_tags'   => 'array',
        'premium_until'   => 'datetime',
        'premium_reminder_sent_at' => 'datetime',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    // Exposed on every company payload so the public homepage can pick out the paid
    // "Premium featured" tier without a second query. True while the paid slot is unexpired.
    protected $appends = ['is_premium'];

    public function getIsPremiumAttribute(): bool
    {
        return $this->premium_until !== null && $this->premium_until->isFuture();
    }

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
