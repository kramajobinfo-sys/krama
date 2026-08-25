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
        'telegram_chat_id', 'telegram_link_token', 'referral_code', 'referred_by',
    ];

    protected $hidden = ['password_hash', 'telegram_link_token'];

    protected $casts = [
        'email_verified_at'        => 'datetime',
        'last_active_at'           => 'datetime',
        'created_at'               => 'datetime',
        'updated_at'               => 'datetime',
        'allow_candidate_messages' => 'boolean',
        'candidate_premium_until'  => 'datetime',
    ];

    // Candidate Premium is active while candidate_premium_until is in the future.
    public function isCandidatePremium(): bool
    {
        return $this->candidate_premium_until !== null && $this->candidate_premium_until->isFuture();
    }

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

    // ── Company-scoped RBAC ─────────────────────────────────────────────────────
    // A member's `company_role` maps to a set of capabilities that gate what they can do
    // WITHIN their company (on top of the global role permissions). The owner (company_role
    // null — they own the company) and 'company_admin' get everything; other roles are scoped.
    // 'recruitment' is the legacy slug for 'recruiter'. See TeamController / the requireCompanyCapability
    // helper on the base Controller.
    public const COMPANY_ROLE_CAPS = [
        'company_admin'  => ['manage_jobs', 'approve_jobs', 'view_applicants', 'manage_applicants', 'manage_billing', 'manage_company', 'manage_team'],
        'recruiter'      => ['manage_jobs', 'view_applicants', 'manage_applicants'],
        'recruitment'    => ['manage_jobs', 'view_applicants', 'manage_applicants'], // legacy alias
        'hiring_manager' => ['view_applicants', 'manage_applicants'],
        'viewer'         => ['view_applicants'],
    ];

    // All capabilities, granted to the owner and to company_admin.
    public const COMPANY_ALL_CAPS = ['manage_jobs', 'approve_jobs', 'view_applicants', 'manage_applicants', 'manage_billing', 'manage_company', 'manage_team'];

    // The capabilities this user holds within their company.
    public function companyCapabilities(): array
    {
        // Owner: no company_role set but linked to / owning a company → full control.
        if (empty($this->company_role)) {
            return self::COMPANY_ALL_CAPS;
        }
        return self::COMPANY_ROLE_CAPS[$this->company_role] ?? [];
    }

    public function companyCan(string $capability): bool
    {
        return in_array($capability, $this->companyCapabilities(), true);
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
