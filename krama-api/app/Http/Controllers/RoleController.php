<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;

// Per-role permission management. Permissions are stored on the role (role_permissions
// pivot) and enforced by CheckPermission / requirePermission, so editing a role's
// permissions affects EVERY user with that role. Only holders of `manage_roles`
// (Super Admin) may read/write here.
class RoleController extends Controller
{
    public function index(Request $request)
    {
        $this->requirePermission('manage_roles');

        $roles = Role::with('permissions:id,slug')->orderBy('id')->get()->map(function ($r) {
            return [
                'id'          => $r->id,
                'slug'        => $r->slug,
                'name'        => $r->name,
                'permissions' => $r->permissions->pluck('slug')->values(),
            ];
        });

        return response()->json([
            'roles'   => $roles,
            'catalog' => $this->catalog(),
        ]);
    }

    public function updatePermissions(Request $request, $id)
    {
        $this->requirePermission('manage_roles');

        $role = Role::findOrFail($id);

        // Super Admin always holds every permission — it is the account of last resort,
        // so it is never editable (this also removes any way to lock everyone out).
        if ($role->slug === 'super_admin') {
            abort(422, 'The Super Admin role always has full access and cannot be changed.');
        }

        $data = $request->validate([
            'permissions'   => 'present|array',
            'permissions.*' => 'string|exists:permissions,slug',
        ]);

        $ids = Permission::whereIn('slug', $data['permissions'])->pluck('id')->toArray();
        $role->permissions()->sync($ids);

        $this->auditLog('role.permissions_updated', [
            'role'        => $role->slug,
            'permissions' => $data['permissions'],
        ]);

        return response()->json([
            'id'          => $role->id,
            'slug'        => $role->slug,
            'name'        => $role->name,
            'permissions' => $role->permissions()->pluck('slug')->values(),
        ]);
    }

    // The full permission catalogue, grouped + labelled for the admin UI. Order here drives
    // the on-screen order. Only slugs that actually exist in the DB are returned.
    private function catalog(): array
    {
        $labels = [
            'site_settings'     => 'Site settings & content',
            'manage_users'      => 'Manage users',
            'manage_roles'      => 'Manage roles & permissions',
            'approve_companies' => 'Approve companies',
            'approve_jobs'      => 'Approve jobs',
            'suspend_users'     => 'Suspend users',
            'moderate_forum'    => 'Moderate forum',
            'manage_payments'   => 'Manage payments',
            'manage_plans'      => 'Manage plans & coupons',
            'view_reports'      => 'View reports',
            'view_audit'        => 'View audit log',
            'post_jobs'         => 'Post jobs',
            'view_applicants'   => 'View applicants',
            'apply_jobs'        => 'Apply to jobs',
            'save_jobs'         => 'Save jobs',
        ];
        $groups = [
            'Administration & access' => ['site_settings', 'manage_users', 'manage_roles'],
            'Moderation'              => ['approve_companies', 'approve_jobs', 'suspend_users', 'moderate_forum'],
            'Commerce'                => ['manage_payments', 'manage_plans'],
            'Insights'                => ['view_reports', 'view_audit'],
            'Employer actions'        => ['post_jobs', 'view_applicants'],
            'Candidate actions'       => ['apply_jobs', 'save_jobs'],
        ];

        $existing = Permission::pluck('slug')->flip();
        $out = [];
        foreach ($groups as $group => $slugs) {
            $perms = [];
            foreach ($slugs as $slug) {
                if (isset($existing[$slug])) {
                    $perms[] = ['slug' => $slug, 'label' => $labels[$slug] ?? ucfirst(str_replace('_', ' ', $slug))];
                }
            }
            if ($perms) {
                $out[] = ['group' => $group, 'perms' => $perms];
            }
        }
        return $out;
    }
}
