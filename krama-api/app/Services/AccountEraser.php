<?php

namespace App\Services;

use App\Models\Resume;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Deletes a user's personal data and anonymises the account, in one transaction.
 *
 * Purges CV files, résumé, alerts, saved jobs, follows and push subscriptions, revokes
 * all tokens, and scrubs the user row (name/email/phone/photo). Application, message and —
 * for employers — company/job/invoice records are intentionally kept (employers legitimately
 * hold them, and finance records may be legally required), but they no longer carry the
 * person's identity. Used by both candidate self-service deletion and the admin panel.
 */
class AccountEraser
{
    public static function erase(User $user): void
    {
        // Remove stored CV file(s) before deleting the résumé rows.
        foreach (Resume::where('candidate_id', $user->id)->get() as $resume) {
            if ($resume->file_url && ! str_starts_with($resume->file_url, 'http')) {
                try { Storage::disk('local')->delete($resume->file_url); } catch (\Throwable $e) {}
            }
        }
        // Remove the avatar file.
        if ($user->avatar_url && str_contains($user->avatar_url, '/storage/avatars/')) {
            try { Storage::disk('public')->delete(str_replace(url('/storage') . '/', '', $user->avatar_url)); } catch (\Throwable $e) {}
        }

        DB::transaction(function () use ($user) {
            $id = $user->id;
            DB::table('resumes')->where('candidate_id', $id)->delete();
            DB::table('job_alerts')->where('candidate_id', $id)->delete();
            DB::table('company_followers')->where('candidate_id', $id)->delete();
            DB::table('saved_jobs')->where('candidate_id', $id)->delete();
            DB::table('push_subscriptions')->where('user_id', $id)->delete();
            $user->authTokens()->delete();

            $user->forceFill([
                'name'          => 'Deleted user',
                'email'         => 'deleted_' . $id . '@krama.deleted',
                'phone'         => null,
                'bio'           => null,
                'avatar_url'    => null,
                'password_hash' => Hash::make(Str::random(40)),
                'status'        => 'suspended', // deactivated; PII above is scrubbed
            ])->save();
        });
    }
}
