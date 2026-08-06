<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponRedemption extends Model
{
    protected $table = 'coupon_redemptions';
    public $timestamps = false;

    protected $fillable = [
        'coupon_id', 'company_id', 'user_id', 'payment_id', 'subscription_id',
        'discount_amount', 'consumed_at', 'created_at',
    ];

    protected $casts = [
        'discount_amount' => 'float',
        'consumed_at'     => 'datetime',
        'created_at'      => 'datetime',
    ];

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
