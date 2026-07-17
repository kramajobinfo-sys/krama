<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyPhoto extends Model
{
    protected $table = 'company_photos';

    protected $fillable = ['company_id', 'url', 'caption', 'sort_order'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
