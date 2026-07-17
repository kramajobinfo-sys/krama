<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_request_to_admin_endpoint_returns_401(): void
    {
        $this->getJson('/api/admin/candidates')->assertStatus(401);
    }

    public function test_candidate_cannot_access_admin_endpoints(): void
    {
        $role = Role::create(['name' => 'Candidate', 'slug' => 'candidate']);
        $user = $this->makeUser('cand@example.com', $role);
        $token = $this->tokenFor($user);

        $this->withToken($token)->getJson('/api/admin/candidates')->assertStatus(403);
    }

    public function test_admin_with_permission_can_access_admin_endpoint(): void
    {
        $perm = Permission::create(['slug' => 'site_settings', 'area' => 'admin', 'label' => 'Site Settings']);
        $suspendPerm = Permission::create(['slug' => 'suspend_users', 'area' => 'admin', 'label' => 'Suspend Users']);

        $adminRole = Role::create(['name' => 'Admin', 'slug' => 'admin']);
        $adminRole->permissions()->attach([$perm->id, $suspendPerm->id]);

        $admin = $this->makeUser('admin@example.com', $adminRole);
        $token = $this->tokenFor($admin);

        $this->withToken($token)->getJson('/api/admin/candidates')->assertOk();
    }

    private function makeUser(string $email, Role $role): User
    {
        $user = new User([
            'role_id'       => $role->id,
            'name'          => 'Test User',
            'email'         => $email,
            'password_hash' => Hash::make('Secret123!@#'),
        ]);
        $user->status     = 'active';
        $user->created_at = now();
        $user->updated_at = now();
        $user->save();
        return $user;
    }

    private function tokenFor(User $user): string
    {
        return $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'Secret123!@#',
        ])->json('access_token');
    }
}
