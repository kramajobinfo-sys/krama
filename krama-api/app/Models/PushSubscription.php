<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    public $timestamps = false; // created_at is filled by the DB (useCurrent)

    protected $fillable = ['user_id', 'endpoint', 'endpoint_hash', 'p256dh', 'auth', 'ua'];
}
