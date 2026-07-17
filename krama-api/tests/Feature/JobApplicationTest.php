<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Category;
use App\Models\Company;
use App\Models\Job;
use App\Models\Location;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class JobApplicationTest extends TestCase
{
    use RefreshDatabase;

    private User $candidate;
    private User $employer;
    private Job  $job;
    private string $candidateToken;
    private string $employerToken;

    protected function setUp(): void
    {
        parent::setUp();

        // Roles
        $applyPerm   = Permission::create(['slug' => 'apply_jobs',     'area' => 'candidate', 'label' => 'Apply to jobs']);
        $savePerm    = Permission::create(['slug' => 'save_jobs',      'area' => 'candidate', 'label' => 'Save jobs']);
        $postPerm    = Permission::create(['slug' => 'post_jobs',      'area' => 'employer',  'label' => 'Post jobs']);
        $viewPerm    = Permission::create(['slug' => 'view_applicants','area' => 'employer',  'label' => 'View applicants']);

        $candidateRole = Role::create(['name' => 'Candidate', 'slug' => 'candidate']);
        $candidateRole->permissions()->attach([$applyPerm->id, $savePerm->id]);

        $employerRole = Role::create(['name' => 'Employer', 'slug' => 'employer']);
        $employerRole->permissions()->attach([$postPerm->id, $viewPerm->id]);

        // Users
        $this->candidate = $this->makeUser('cand@example.com', $candidateRole, true);
        $this->employer  = $this->makeUser('emp@example.com',  $employerRole, false);

        // Company + Job
        $company = Company::create([
            'user_id' => $this->employer->id,
            'name'    => 'ACME Corp',
            'status'  => 'approved',
        ]);

        $this->job = Job::create([
            'company_id'  => $company->id,
            'title'       => 'Software Engineer',
            'slug'        => 'software-engineer',
            'job_type'    => 'full_time',
            'status'      => 'published',
            'published_at'=> now(),
        ]);

        $this->candidateToken = $this->tokenFor($this->candidate);
        $this->employerToken  = $this->tokenFor($this->employer);
    }

    // ── Apply ─────────────────────────────────────────────────────────────────

    public function test_candidate_can_apply_to_published_job(): void
    {
        $this->withToken($this->candidateToken)
            ->postJson("/api/jobs/{$this->job->id}/apply", ['cover_note' => 'Excited!'])
            ->assertStatus(201)
            ->assertJsonPath('stage', 'applied');

        $this->assertDatabaseHas('applications', [
            'job_id'       => $this->job->id,
            'candidate_id' => $this->candidate->id,
        ]);
    }

    public function test_candidate_cannot_apply_twice(): void
    {
        Application::create([
            'job_id'       => $this->job->id,
            'candidate_id' => $this->candidate->id,
            'stage'        => 'applied',
        ]);

        $this->withToken($this->candidateToken)
            ->postJson("/api/jobs/{$this->job->id}/apply")
            ->assertStatus(422);
    }

    public function test_unverified_candidate_can_still_apply(): void
    {
        // Email verification is intentionally NOT enforced on applying: SMTP is
        // optional, and requiring verification would lock out every candidate
        // until email is configured. This documents the current (allowed) behavior.
        $unverified = $this->makeUser('unv@example.com', Role::where('slug', 'candidate')->first(), false);
        $token = $this->tokenFor($unverified);

        $this->withToken($token)
            ->postJson("/api/jobs/{$this->job->id}/apply")
            ->assertStatus(201);
    }

    public function test_unauthenticated_user_cannot_apply(): void
    {
        $this->postJson("/api/jobs/{$this->job->id}/apply")
            ->assertStatus(401);
    }

    // ── Withdraw ──────────────────────────────────────────────────────────────

    public function test_candidate_can_withdraw_applied_application(): void
    {
        $app = Application::create([
            'job_id'       => $this->job->id,
            'candidate_id' => $this->candidate->id,
            'stage'        => 'applied',
        ]);

        $this->withToken($this->candidateToken)
            ->deleteJson("/api/applications/{$app->id}")
            ->assertOk();

        $this->assertDatabaseMissing('applications', ['id' => $app->id]);
    }

    public function test_candidate_cannot_withdraw_reviewed_application(): void
    {
        $app = Application::create([
            'job_id'       => $this->job->id,
            'candidate_id' => $this->candidate->id,
            'stage'        => 'reviewed',
        ]);

        $this->withToken($this->candidateToken)
            ->deleteJson("/api/applications/{$app->id}")
            ->assertStatus(422);
    }

    // ── Save/Unsave ────────────────────────────────────────────────────────────

    public function test_candidate_can_save_and_unsave_a_job(): void
    {
        $this->withToken($this->candidateToken)
            ->postJson("/api/jobs/{$this->job->id}/save")
            ->assertStatus(201);

        $this->assertDatabaseHas('saved_jobs', [
            'job_id'       => $this->job->id,
            'candidate_id' => $this->candidate->id,
        ]);

        $this->withToken($this->candidateToken)
            ->deleteJson("/api/jobs/{$this->job->id}/save")
            ->assertOk();

        $this->assertDatabaseMissing('saved_jobs', [
            'job_id'       => $this->job->id,
            'candidate_id' => $this->candidate->id,
        ]);
    }

    // ── Employer pipeline ─────────────────────────────────────────────────────

    public function test_employer_can_view_applicants(): void
    {
        Application::create([
            'job_id'       => $this->job->id,
            'candidate_id' => $this->candidate->id,
            'stage'        => 'applied',
        ]);

        $this->withToken($this->employerToken)
            ->getJson("/api/employer/jobs/{$this->job->id}/applications")
            ->assertOk()
            ->assertJsonPath('applications.total', 1);
    }

    public function test_employer_can_advance_application_stage(): void
    {
        $app = Application::create([
            'job_id'       => $this->job->id,
            'candidate_id' => $this->candidate->id,
            'stage'        => 'applied',
        ]);

        $this->withToken($this->employerToken)
            ->patchJson("/api/applications/{$app->id}/stage", ['stage' => 'shortlisted'])
            ->assertOk()
            ->assertJsonPath('stage', 'shortlisted');
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function makeUser(string $email, Role $role, bool $verified = false): User
    {
        $user = new User([
            'role_id'       => $role->id,
            'name'          => 'User',
            'email'         => $email,
            'password_hash' => Hash::make('Secret123!@#'),
        ]);
        $user->status              = 'active';
        $user->email_verified_at   = $verified ? now() : null;
        $user->created_at          = now();
        $user->updated_at          = now();
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
