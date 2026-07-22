<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Job extends Model
{
    protected $table = 'jobs';

    protected $fillable = [
        'company_id', 'user_id', 'subscription_id', 'category_id', 'location_id', 'title', 'slug',
        'job_type', 'experience_level', 'salary_min', 'salary_max',
        'salary_currency', 'salary_period', 'is_remote', 'description',
        'requirements', 'benefits', 'is_featured', 'featured_until', 'status',
        'rejection_reason', 'expires_at', 'published_at',
        'share_social', 'social_posted_at',
    ];

    protected $casts = [
        'salary_min'    => 'float',
        'salary_max'    => 'float',
        'is_remote'     => 'boolean',
        'is_featured'   => 'boolean',
        'share_social'  => 'boolean',
        'featured_until'=> 'datetime',
        'expires_at'    => 'date',
        'published_at'  => 'datetime',
        'social_posted_at' => 'datetime',
        'created_at'    => 'datetime',
        'updated_at'    => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function poster()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public static function generateSlug(string $title): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;
        while (static::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
