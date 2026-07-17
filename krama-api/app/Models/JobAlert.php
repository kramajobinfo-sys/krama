<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobAlert extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'candidate_id',
        'keyword',
        'category_id',
        'location_id',
        'job_type',
        'is_remote',
    ];

    protected $casts = [
        'is_remote'  => 'boolean',
        'created_at' => 'datetime',
    ];

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }
}
