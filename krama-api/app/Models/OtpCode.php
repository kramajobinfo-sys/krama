<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    protected $table = 'otp_codes';
    public $timestamps = false;

    protected $fillable = ['phone', 'code_hash', 'purpose', 'expires_at', 'attempts', 'created_at'];

    protected $casts = [
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'attempts'   => 'integer',
    ];
}
