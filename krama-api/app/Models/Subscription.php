<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $table = 'subscriptions';
    public $timestamps = false;

    protected $fillable = [
        'company_id', 'plan_id', 'status', 'started_at', 'renews_at', 'job_post_limit', 'featured_credits_used',
    ];

    protected $casts = [
        'started_at'            => 'datetime',
        'renews_at'             => 'datetime',
        'featured_credits_used' => 'integer',
    ];

    /**
     * Expire every overdue active/trial subscription (renews_at in the past) and close the
     * published jobs tied to them, so lapsed listings leave the public site and don't linger
     * against a renewed plan's fresh quota. Idempotent; returns the number expired.
     */
    public static function expireOverdue(): int
    {
        $ids = static::whereIn('status', ['active', 'trial'])
            ->whereNotNull('renews_at')
            ->where('renews_at', '<', now())
            ->pluck('id');

        if ($ids->isEmpty()) {
            return 0;
        }

        \App\Models\Job::whereIn('subscription_id', $ids)
            ->where('status', 'published')
            ->update(['status' => 'closed']);

        static::whereIn('id', $ids)->update(['status' => 'expired']);

        return $ids->count();
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function latestPayment()
    {
        return $this->hasOne(Payment::class)->latestOfMany();
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
