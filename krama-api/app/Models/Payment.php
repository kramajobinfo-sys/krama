<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $table = 'payments';
    public $timestamps = false;

    protected $fillable = [
        'company_id', 'subscription_id', 'purpose', 'job_id', 'invoice_no',
        'amount', 'currency', 'method', 'status', 'paid_at', 'khqr', 'md5', 'gateway_ref', 'credits',
    ];

    protected $casts = [
        'amount'     => 'float',
        'paid_at'    => 'datetime',
        'created_at' => 'datetime',
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
