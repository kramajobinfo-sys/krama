<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';
    public $timestamps = false;

    protected $fillable = [
        'company_id', 'candidate_id', 'subscription_id', 'purpose', 'job_id', 'invoice_no',
        'amount', 'currency', 'method', 'status', 'paid_at', 'khqr', 'md5', 'gateway_ref', 'credits',
        'is_tax_invoice', 'subtotal', 'vat_rate', 'vat_amount', 'customer_vat_tin', 'customer_legal_name', 'fx_rate',
        'coupon_code', 'coupon_discount', 'coupon_credits', 'coupon_free_days', 'coupon_job_posts',
    ];

    protected $casts = [
        'amount'           => 'float',
        'subtotal'         => 'float',
        'vat_rate'         => 'float',
        'vat_amount'       => 'float',
        'fx_rate'          => 'float',
        'is_tax_invoice'   => 'boolean',
        'coupon_discount'  => 'float',
        'coupon_credits'   => 'integer',
        'coupon_free_days' => 'integer',
        'coupon_job_posts' => 'integer',
        'paid_at'          => 'datetime',
        'created_at'       => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
