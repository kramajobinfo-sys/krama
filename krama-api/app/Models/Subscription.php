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
