<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private Role $candidateRole;
    private Role $employerRole;

    protected function setUp(): void
    {
        parent::setUp();
        $this->candidateRole = Role::create(['name' => 'Candidate', 'slug' => 'candidate']);
        $this->employerRole  = Role::create(['name' => 'Employer',  'slug' => 'employer']);
    }

    // ── Registration ────────────────────────────────────────────────────────

    public function test_candidate_can_register(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'     => 'Jane Doe',
            'email'    => 'jane@example.com',
            'password' => 'Secret123!@#',
            'role'     => 'candidate',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user'          => ['id', 'name', 'email', 'role'],
                'access_token',
                'refresh_token',
                'expires_in',
            ]);

        $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        $this->createUser('jane@example.com');

        $response = $this->postJson('/api/auth/register', [
            'name'     => 'Jane Doe 2',
            'email'    => 'jane@example.com',
            'password' => 'Secret123!@#',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_registration_enforces_password_complexity(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name'     => 'Weak',
            'email'    => 'weak@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('password');
    }

    // ── Login ────────────────────────────────────────────────────────────────

    public function test_user_can_login_with_valid_credentials(): void
    {
        $this->createUser('john@example.com', 'Secret123!@#');

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'john@example.com',
            'password' => 'Secret123!@#',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['access_token', 'refresh_token', 'user']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->createUser('john@example.com', 'Secret123!@#');

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'john@example.com',
            'password' => 'WrongPassword1!',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_fails_for_suspended_account(): void
    {
        $user = $this->createUser('suspended@example.com', 'Secret123!@#');
        $user->status = 'suspended';
        $user->save();

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'suspended@example.com',
            'password' => 'Secret123!@#',
        ]);

        $response->assertStatus(401);
    }

    // ── Token refresh ────────────────────────────────────────────────────────

    public function test_refresh_token_returns_new_access_token(): void
    {
        $this->createUser('john@example.com');

        $login = $this->postJson('/api/auth/login', [
            'email'    => 'john@example.com',
            'password' => 'Secret123!@#',
        ]);

        $refresh = $this->postJson('/api/auth/refresh', [
            'refresh_token' => $login->json('refresh_token'),
        ]);

        $refresh->assertOk()->assertJsonStructure(['access_token', 'refresh_token']);
        $this->assertNotEquals($login->json('access_token'), $refresh->json('access_token'));
    }

    public function test_refresh_token_cannot_be_reused(): void
    {
        $this->createUser('john@example.com');

        $login = $this->postJson('/api/auth/login', [
            'email'    => 'john@example.com',
            'password' => 'Secret123!@#',
        ]);

        $oldRefresh = $login->json('refresh_token');

        // First refresh — should succeed
        $this->postJson('/api/auth/refresh', ['refresh_token' => $oldRefresh])->assertOk();

        // Second refresh with the same token — must fail (token rotated)
        $this->postJson('/api/auth/refresh', ['refresh_token' => $oldRefresh])->assertStatus(401);
    }

    // ── Me ────────────────────────────────────────────────────────────────────

    public function test_me_returns_authenticated_user(): void
    {
        $user  = $this->createUser('me@example.com');
        $token = $this->loginAndGetToken($user);

        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('email', 'me@example.com');
    }

    public function test_me_rejects_unauthenticated_request(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    // ── Logout ───────────────────────────────────────────────────────────────

    public function test_logout_invalidates_refresh_token(): void
    {
        $user  = $this->createUser('logout@example.com');
        $token = $this->loginAndGetToken($user, $refreshToken);

        $this->withToken($token)
            ->postJson('/api/auth/logout', ['refresh_token' => $refreshToken])
            ->assertOk();

        // After logout the refresh token must be invalid
        $this->postJson('/api/auth/refresh', ['refresh_token' => $refreshToken])
            ->assertStatus(401);
    }

    // ── Health check ─────────────────────────────────────────────────────────

    public function test_health_endpoint_returns_ok(): void
    {
        $this->getJson('/api/health')->assertOk()->assertJsonPath('status', 'ok');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function createUser(string $email = 'test@example.com', string $password = 'Secret123!@#'): User
    {
        $user = new User([
            'role_id'       => $this->candidateRole->id,
            'name'          => 'Test User',
            'email'         => $email,
            'password_hash' => Hash::make($password),
        ]);
        $user->status     = 'active';
        $user->created_at = now();
        $user->updated_at = now();
        $user->save();

        return $user;
    }

    private function loginAndGetToken(User $user, string &$refreshToken = null): string
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => $user->email,
            'password' => 'Secret123!@#',
        ]);

        $refreshToken = $response->json('refresh_token');

        return $response->json('access_token');
    }
}
