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
        $this->requirePermission('manage_roles');

        $data = $request->validate([
            'role'     => 'sometimes|string|exists:roles,slug',
            'status'   => 'sometimes|in:active,suspended',
            'password' => 'sometimes|string|min:8',
        ]);

        $user = User::findOrFail($id);

        if (isset($data['role'])) {
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
}
