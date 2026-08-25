<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ProfileView extends Model
{
    protected $table = 'profile_views';

    protected $fillable = ['candidate_id', 'company_id', 'view_count', 'first_viewed_at', 'last_viewed_at'];

    protected $casts = [
        'first_viewed_at' => 'datetime',
        'last_viewed_at'  => 'datetime',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    /**
     * Record that $companyId viewed $candidateId's profile. Upserts the (candidate, company)
     * row; the view_count only bumps when the last view was more than 6h ago, so repeatedly
     * opening the same profile in one session doesn't inflate the count.
     */
    public static function record(int $candidateId, int $companyId): void
    {
        if ($candidateId <= 0 || $companyId <= 0) return;

        $row = static::where('candidate_id', $candidateId)->where('company_id', $companyId)->first();
        $now = now();

        if (! $row) {
            static::create([
                'candidate_id'    => $candidateId,
                'company_id'      => $companyId,
                'view_count'      => 1,
                'first_viewed_at' => $now,
                'last_viewed_at'  => $now,
            ]);
            return;
        }

        $bump = ! $row->last_viewed_at || $row->last_viewed_at->lt($now->copy()->subHours(6));
        $row->forceFill([
            'last_viewed_at' => $now,
            'view_count'     => $row->view_count + ($bump ? 1 : 0),
        ])->save();
    }
}
