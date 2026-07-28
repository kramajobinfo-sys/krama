<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $table = 'plans';
    public $timestamps = false;

    protected $fillable = [
        'name', 'price', 'discount_percent', 'currency', 'interval', 'job_post_limit', 'trial_days',
        'featured_credits', 'features_json', 'is_active', 'custom_pricing', 'sort_order',
    ];

    protected $casts = [
        'price'            => 'float',
        'discount_percent' => 'integer',
        'job_post_limit'   => 'integer',
        'trial_days'       => 'integer',
        'featured_credits' => 'integer',
        'features_json'    => 'array',
        'is_active'        => 'boolean',
        'custom_pricing'   => 'boolean',
        'sort_order'       => 'integer',
    ];

    // Expose computed pricing to every API consumer (public pricing, employer billing, admin).
    protected $appends = ['effective_price', 'has_discount'];

    /** Whether this plan is discounted (discount_percent between 1 and 100). */
    public function getHasDiscountAttribute(): bool
    {
        $d = (int) ($this->discount_percent ?? 0);
        return $d > 0 && $d <= 100;
    }

    /**
     * The price actually charged = list price minus the discount, rounded to cents.
     * Single source of truth for the amount billed — subscription payment, KHQR/ABA/Stripe,
     * and invoices all derive from it (via payment.amount, set in PaymentController::subscribe).
     */
    public function getEffectivePriceAttribute(): float
    {
        $price = (float) ($this->price ?? 0);
        $d = (int) ($this->discount_percent ?? 0);
        if ($d <= 0) {
            return round($price, 2);
        }
        $d = min(100, $d);
        return round($price * (100 - $d) / 100, 2);
    }
}
