<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanyReview extends Model
{
    protected $fillable = [
        'company_id', 'candidate_id', 'rating', 'title', 'body', 'is_anonymous', 'status',
    ];

    protected $casts = [
        'rating'       => 'integer',
        'is_anonymous' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }
}
