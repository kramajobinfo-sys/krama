<?php

namespace App\Models;

use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject, MustVerifyEmail
{
    use Notifiable, MustVerifyEmailTrait;

    protected $table = 'users';
    public $timestamps = false; // schema uses created_at/updated_at but not Laravel's format

    protected $fillable = [
        'role_id', 'company_id', 'company_role', 'name', 'email', 'password_hash',
        'phone', 'bio', 'cv_visibility', 'allow_candidate_messages', 'avatar_url', 'status',
        'telegram_chat_id', 'telegram_link_token',
    ];

    protected $hidden = ['password_hash', 'telegram_link_token'];

    protected $casts = [
        'email_verified_at'        => 'datetime',
        'last_active_at'           => 'datetime',
        'created_at'               => 'datetime',
        'updated_at'               => 'datetime',
        'allow_candidate_messages' => 'boolean',
    ];

    // jwt-auth requires these two methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return ['role' => $this->role ? $this->role->slug : null];
    }

    // Laravel auth uses getAuthPassword() — our column is password_hash
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function permissions()
    {
        return $this->role ? $this->role->permissions : collect();
    }

    public function hasPermission(string $slug): bool
    {
        return $this->role
            && $this->role->relationLoaded('permissions')
            && $this->role->permissions->contains('slug', $slug);
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'candidate_id');
    }

    public function authTokens()
    {
        return $this->hasMany(AuthToken::class);
    }
}
