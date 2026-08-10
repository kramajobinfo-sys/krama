<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $table = 'coupons';

    protected $fillable = [
        'code', 'label', 'kind', 'scope',
        'percent_off', 'amount_off', 'amount_currency', 'bonus_featured_credits', 'bonus_free_days', 'bonus_job_posts',
        'plan_id', 'min_amount', 'max_redemptions', 'redeemed_count',
        'starts_at', 'expires_at', 'is_active', 'created_by', 'owner_company_id',
    ];

    protected $casts = [
        'percent_off'            => 'integer',
        'amount_off'             => 'float',
        'bonus_featured_credits' => 'integer',
        'bonus_free_days'        => 'integer',
        'bonus_job_posts'        => 'integer',
        'plan_id'                => 'integer',
        'min_amount'             => 'float',
        'max_redemptions'        => 'integer',
        'redeemed_count'         => 'integer',
        'starts_at'              => 'datetime',
        'expires_at'             => 'datetime',
        'is_active'              => 'boolean',
    ];

    protected $appends = ['is_expired'];

    public function redemptions()
    {
        return $this->hasMany(CouponRedemption::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at && now()->greaterThan($this->expires_at);
    }
}
