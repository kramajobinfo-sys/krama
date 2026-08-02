<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Job extends Model
{
    protected $table = 'jobs';

    protected $fillable = [
        'company_id', 'user_id', 'subscription_id', 'category_id', 'location_id', 'title', 'slug', 'import_ref',
        'job_type', 'experience_level', 'salary_min', 'salary_max',
        'salary_currency', 'salary_period', 'is_remote', 'description',
        'requirements', 'benefits', 'is_featured', 'featured_until', 'status',
        'rejection_reason', 'expires_at', 'published_at',
        'share_social', 'social_image', 'social_posted_at',
        'working_days', 'working_time', 'map_location',
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

    // Notify Google (Indexing API) when a job page becomes public or is taken down —
    // best-effort, deferred to after the response, and a no-op unless SEO indexing is
    // configured (see GoogleIndexingService). Keeps Google for Jobs fresh.
    protected static function booted(): void
    {
        static::created(function (self $job) {
            if ($job->status === 'published') self::pingGoogle($job->slug, 'URL_UPDATED');
        });
        static::updated(function (self $job) {
            if (! $job->wasChanged('status')) return;
            if ($job->status === 'published') {
                self::pingGoogle($job->slug, 'URL_UPDATED');
            } elseif ($job->getOriginal('status') === 'published') {
                self::pingGoogle($job->slug, 'URL_DELETED');
            }
        });
        static::deleted(function (self $job) {
            self::pingGoogle($job->slug, 'URL_DELETED');
        });
    }

    private static function pingGoogle(?string $slug, string $type): void
    {
        if (! $slug) return;
        app()->terminating(function () use ($slug, $type) {
            try { \App\Services\GoogleIndexingService::publish(url('/jobs/' . $slug), $type); } catch (\Throwable $e) {}
        });
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
