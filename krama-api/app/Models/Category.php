<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $table = 'categories';
    public $timestamps = false;

    protected $fillable = ['name', 'slug', 'icon', 'status'];

    public function jobs()
    {
        return $this->hasMany(\App\Models\Job::class, 'category_id');
    }
}
