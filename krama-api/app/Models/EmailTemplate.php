<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    public $timestamps = false;
    protected $fillable = ['name', 'subject', 'body', 'created_by', 'created_at', 'updated_at'];
}
