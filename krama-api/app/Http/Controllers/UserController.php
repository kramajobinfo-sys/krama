<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    // GET /api/admin/candidates — paginated candidate users with filters
    public function adminCandidates(Request $request)
    {
        $this->requirePermission('suspend_users');

        $q = User::query()
            ->select(['id', 'name', 'email', 'phone', 'avatar_url', 'status',
                       'role_id', 'email_verified_at', 'last_active_at', 'created_at'])
            ->whereHas('role', fn ($r) => $r->where('slug', 'candidate'))
            ->withCount('applications');

        if ($request->filled('status') && $request->status !== 'all') {
            $q->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $q->where(function ($query) use ($term) {
                $query->where('name', 'like', $term)
                      ->orWhere('email', 'like', $term);
            });
        }

        $q->orderBy('created_at', 'desc');

        $perPage = min(100, max(1, (int) $request->input('per_page', 10)));

        return response()->json($q->paginate($perPage));
    }

    // PATCH /api/admin/candidates/{id}/status — suspend or reactivate
    public function setStatus(Request $request, $id)
    {
        $this->requirePermission('suspend_users');

        $data = $request->validate(['status' => 'required|in:active,suspended']);

        $user = User::whereHas('role', fn ($r) => $r->where('slug', 'candidate'))->findOrFail($id);
        $prev = $user->status;
        $user->forceFill(['status' => $data['status']])->save();

        $this->auditLog('user.status_changed', [
            'user_id' => $user->id, 'user_email' => $user->email,
            'from' => $prev, 'to' => $data['status'],
        ]);

        return response()->json(['message' => 'Candidate ' . $data['status'] . '.', 'status' => $data['status']]);
    }

    // GET /api/admin/users — all users across all roles
    public function adminUsers(Request $request)
    {
        $this->requirePermission('manage_users');

        $q = User::with('role:id,slug,name')
            ->select(['id', 'name', 'email', 'avatar_url', 'status', 'role_id', 'last_active_at', 'created_at']);

        if ($request->filled('role') && $request->role !== 'all') {
            $q->whereHas('role', fn ($r) => $r->where('slug', $request->role));
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $q->where(fn ($q) => $q->where('name', 'like', $term)->orWhere('email', 'like', $term));
        }

        $perPage = min(200, max(1, (int) $request->input('per_page', 50)));

        return response()->json($q->orderBy('created_at', 'desc')->paginate($perPage));
    }

    // POST /api/admin/users — create a new user directly (no email invite)
    /** Role hierarchy rank — higher = more privileged. Unknown roles rank 0. */
    private static function roleRank(?string $slug): int
    {
        $ranks = ['candidate' => 1, 'employer' => 2, 'admin' => 3, 'super_admin' => 4];
        return $ranks[$slug] ?? 0;
    }

    public function adminCreateUser(Request $request)
    {
        $this->requirePermission('manage_users');

        $data = $request->validate([
            'name'     => 'required|string|max:120',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'string', Password::min(8)],
            'role'     => 'required|string|exists:roles,slug',
            'status'   => 'in:active,suspended,pending',
        ]);

        $role = Role::where('slug', $data['role'])->firstOrFail();

        // Privilege-escalation guard: you can only create a user whose role is at or
        // below your own rank, and only a Super Admin can mint a Super Admin. So an
        // Admin can create Candidate/Employer/Admin accounts, never a Super Admin.
        $actorSlug = optional(auth()->user()->role)->slug;
        if (self::roleRank($data['role']) > self::roleRank($actorSlug)) {
            abort(403, 'You cannot create a user with a role higher than your own.');
        }
        if ($data['role'] === 'super_admin' && $actorSlug !== 'super_admin') {
            abort(403, 'Only a Super Admin can create a Super Admin account.');
        }

        $user = User::create([
            'role_id'            => $role->id,
            'name'               => $data['name'],
            'email'              => $data['email'],
            'password_hash'      => Hash::make($data['password']),
            'status'             => $data['status'] ?? 'active',
            'email_verified_at'  => now(),
        ]);

        $this->auditLog('user.created', [
            'user_id' => $user->id, 'user_email' => $user->email, 'role' => $data['role'],
        ]);

        return response()->json($user->fresh()->load('role:id,slug,name'), 201);
    }

    // PATCH /api/admin/users/{id} — update role and/or status
    public function adminUpdateUser(Request $request, $id)
    {
        $this->requirePermission('manage_users');

        $data = $request->validate([
            'role'     => 'sometimes|string|exists:roles,slug',
            'status'   => 'sometimes|in:active,suspended',
            'password' => 'sometimes|string|min:8',
        ]);

        $actor     = $request->user();
        $actorSlug = optional($actor->role)->slug;
        $actorRank = self::roleRank($actorSlug);

        $user       = User::with('role:id,slug')->findOrFail($id);
        $targetSlug = optional($user->role)->slug;

        // Hierarchy guard: you may only manage users at or below your own rank, and a
        // Super Admin account can only be touched by another Super Admin. Protects role,
        // status AND password changes so an Admin can never act on a Super Admin.
        if ((int) $actor->id !== (int) $user->id) {
            if (self::roleRank($targetSlug) > $actorRank
                || ($targetSlug === 'super_admin' && $actorSlug !== 'super_admin')) {
                abort(403, 'You do not have authority over this account.');
            }
        }

        if (isset($data['role'])) {
            // No self role change — prevents self-lockout and self-escalation.
            if ((int) $actor->id === (int) $user->id && $data['role'] !== $targetSlug) {
                abort(403, 'You cannot change your own role.');
            }
            // Cannot grant a role above your own rank; only a Super Admin grants Super Admin.
            if (self::roleRank($data['role']) > $actorRank) {
                abort(403, 'You cannot assign a role higher than your own.');
            }
            if ($data['role'] === 'super_admin' && $actorSlug !== 'super_admin') {
                abort(403, 'Only a Super Admin can grant the Super Admin role.');
            }
            $role = Role::where('slug', $data['role'])->firstOrFail();
            $user->update(['role_id' => $role->id]);
        }

        if (isset($data['status'])) {
            $user->forceFill(['status' => $data['status']])->save();
        }

        if (isset($data['password'])) {
            $user->forceFill(['password_hash' => bcrypt($data['password'])])->save();
        }

        $this->auditLog('user.updated', [
            'user_id' => $user->id, 'user_email' => $user->email, 'changes' => array_keys($data),
        ]);

        return response()->json($user->fresh()->load('role:id,slug,name'));
    }

    // DELETE /api/admin/users/{id} — permanently delete an account (e.g. test cleanup).
    // Guards: can't delete yourself or an admin/super-admin; refuses if the account has
    // related data (company/jobs/applications) so real data is never cascaded away.
    public function adminDeleteUser(Request $request, $id)
    {
        $this->requirePermission('manage_users');

        $actor = $request->user();
        $user  = User::with('role:id,slug')->findOrFail($id);

        if ((int) $user->id === (int) $actor->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }
        if (in_array(optional($user->role)->slug, ['admin', 'super_admin'], true)) {
            return response()->json(['message' => 'Admin accounts cannot be deleted here.'], 422);
        }

        $email = $user->email;
        try {
            $user->delete();
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'message' => 'This account has related data (company, jobs, or applications) and cannot be deleted. Suspend it instead.',
            ], 422);
        }

        $this->auditLog('user.deleted', ['user_id' => (int) $id, 'user_email' => $email]);

        return response()->json(['message' => 'Account deleted.']);
    }
}
