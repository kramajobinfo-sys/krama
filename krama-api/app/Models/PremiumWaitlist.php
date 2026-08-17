<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PremiumWaitlist extends Model
{
    protected $table = 'premium_waitlist';

    protected $fillable = ['company_id', 'notified_at'];

    protected $casts = [
        'notified_at' => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
