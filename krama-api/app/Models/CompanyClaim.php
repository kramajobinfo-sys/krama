<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyClaim extends Model
{
    public $timestamps = false;

    protected $fillable = ['company_id', 'user_id', 'email', 'message', 'status', 'created_at', 'handled_at', 'handled_by'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
