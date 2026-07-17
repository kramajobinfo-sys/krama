<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExperienceLevel extends Model
{
    protected $table = 'experience_levels';
    public $timestamps = false;

    protected $fillable = ['name', 'slug', 'sort_order', 'status'];
}
