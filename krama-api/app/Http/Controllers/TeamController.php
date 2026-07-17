<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class TeamController extends Controller
{
    // Resolve company for the currently authenticated employer or recruiter.
    private function resolveCompany($user): Company
    {
        // Company owners (company_role is null but they own a company)
        $company = Company::where('user_id', $user->id)->first();
        if ($company) return $company;

        // Recruiters linked via company_id
        if ($user->company_id) {
            $company = Company::find($user->company_id);
            if ($company) return $company;
        }

        abort(422, 'No company profile found.');
    }

    // Require that the current user is a company admin (not a recruiter).
    private function requireCompanyAdmin($user, Company $company): void
    {
        $isOwner = $company->user_id === $user->id;
        $isAdmin = $user->company_id === $company->id && $user->company_role === 'company_admin';
        if (! $isOwner && ! $isAdmin) {
            abort(403, 'Only the company admin can manage team members.');
        }
    }

    // GET /api/employer/team — list all team members for the authenticated employer's company
    public function index(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);

        // Owner
        $owner = User::select('id', 'name', 'email', 'avatar_url', 'status', 'last_active_at', 'created_at')
            ->find($company->user_id);

        // Recruiters linked to this company
        $recruiters = User::select('id', 'name', 'email', 'avatar_url', 'company_role', 'status', 'last_active_at', 'created_at')
            ->where('company_id', $company->id)
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'company'    => $company->only('id', 'name', 'logo_url'),
            'owner'      => $owner,
            'recruiters' => $recruiters,
        ]);
    }

    // POST /api/employer/team — invite a new recruiter
    public function store(Request $request)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);
        $this->requireCompanyAdmin($user, $company);

        $data = $request->validate([
            'name'  => 'required|string|max:120',
            'email' => 'required|email|max:190|unique:users,email',
        ]);

        // Find the employer role id (role_id = 4 in the seeded DB)
        $employerRole = Role::where('slug', 'employer')->first();
        if (! $employerRole) {
            abort(500, 'Employer role not found.');
        }

        // Create the recruiter user with a temporary password they can reset
        $recruiter = User::create([
            'role_id'      => $employerRole->id,
            'company_id'   => $company->id,
            'company_role' => 'recruitment',
            'name'         => $data['name'],
            'email'        => $data['email'],
            'password_hash'=> Hash::make(\Illuminate\Support\Str::random(24)),
            'status'       => 'active',
        ]);

        $this->auditLog('team.recruiter_invited', [
            'company_id'   => $company->id,
            'recruiter_id' => $recruiter->id,
            'email'        => $recruiter->email,
        ]);

        return response()->json([
            'message'   => 'Recruiter invited. They can log in and reset their password.',
            'recruiter' => $recruiter->only('id', 'name', 'email', 'company_role', 'status', 'created_at'),
        ], 201);
    }

    // DELETE /api/employer/team/{id} — remove a recruiter from the team
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);
        $this->requireCompanyAdmin($user, $company);

        $recruiter = User::where('company_id', $company->id)
            ->where('id', $id)
            ->firstOrFail();

        // Detach from company but don't delete the account
        $recruiter->update(['company_id' => null, 'company_role' => null]);

        $this->auditLog('team.recruiter_removed', [
            'company_id'   => $company->id,
            'recruiter_id' => $recruiter->id,
        ]);

        return response()->json(['message' => 'Team member removed.']);
    }

    // PATCH /api/employer/team/{id}/password — company admin sets a recruiter's password
    public function setPassword(Request $request, $id)
    {
        $user = $request->user();
        $company = $this->resolveCompany($user);
        $this->requireCompanyAdmin($user, $company);

        $data = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $recruiter = User::where('company_id', $company->id)
            ->where('id', $id)
            ->firstOrFail();

        $recruiter->update(['password_hash' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Password updated.']);
    }
}
