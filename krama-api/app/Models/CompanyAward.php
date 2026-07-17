<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyAward extends Model
{
    protected $table = 'company_awards';

    protected $fillable = ['company_id', 'title', 'year', 'description', 'image_url', 'sort_order'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
