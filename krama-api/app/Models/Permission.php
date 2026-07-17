<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    protected $table = 'permissions';
    public $timestamps = false;

    protected $fillable = ['slug', 'area', 'label'];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_permissions');
    }
}
