<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ForumCategory extends Model
{
    protected $table = 'forum_categories';

    protected $fillable = [
        'name', 'slug', 'description', 'icon', 'color', 'sort_order', 'is_active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'is_active'  => 'boolean',
    ];

    public function threads()
    {
        return $this->hasMany(ForumThread::class, 'category_id');
    }
}
