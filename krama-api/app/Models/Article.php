<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Article extends Model
{
    protected $fillable = [
        'title', 'slug', 'category', 'excerpt', 'body', 'cover_image',
        'author_name', 'meta_description', 'status', 'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    // Build a unique slug from a title, avoiding collisions (ignoring $ignoreId on update).
    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'article';
        $slug = $base;
        $i = 2;
        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
