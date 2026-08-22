<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccountDeletionRequest extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'email', 'role', 'reason', 'status', 'created_at', 'handled_at'];
}
