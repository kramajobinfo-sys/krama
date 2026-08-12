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

    /**
     * Slug uniqueness is guaranteed two ways: generateSlug() picks a free slug before insert,
     * and the DB unique index (jobs_slug_unique) is the hard backstop. Between that pre-check
     * and the actual INSERT there is a millisecond race where two same-titled jobs could grab
     * the same slug — the database then rejects the second row. Catch that here and retry the
     * insert with a randomly-suffixed slug, so a collision never surfaces as a 500 to the
     * person posting. Only INSERTs and only the slug-unique violation are retried.
     */
    public function save(array $options = [])
    {
        $inserting = ! $this->exists;
        for ($attempt = 0; ; $attempt++) {
            try {
                return parent::save($options);
            } catch (\Illuminate\Database\QueryException $e) {
                $dupSlug = $inserting
                    && $attempt < 3
                    && (int) ($e->errorInfo[1] ?? 0) === 1062                 // MySQL ER_DUP_ENTRY
                    && stripos((string) $e->getMessage(), 'slug') !== false;
                if (! $dupSlug) {
                    throw $e;
                }
                $base = Str::slug((string) $this->title) ?: 'job';
                $this->slug = $base . '-' . Str::lower(Str::random(5));
            }
        }
    }
}
