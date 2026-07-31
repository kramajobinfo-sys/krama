<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Support\HtmlSanitizer;
use App\Models\CompanyAward;
use App\Models\CompanyPhoto;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CompanyController extends Controller
{
    // GET /api/companies — public listing (approved only)
    public function index(Request $request)
    {
        $q = Company::with(['location:id,name'])
            ->withCount([
                'jobs as open_jobs_count'     => fn($q) => $q->where('status', 'published'),
                'followers as follower_count',
            ])
            ->where('status', 'approved');

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $q->where(function ($query) use ($term) {
                $query->where('name', 'like', $term)
                      ->orWhere('industry', 'like', $term);
            });
        }

        if ($request->filled('industry')) {
            $q->where('industry', $request->industry);
        }

        if ($request->filled('location')) {
            $q->where('location_id', $request->location);
        }

        if ($request->boolean('verified')) {
            $q->where('is_verified', true);
        }

        $q->orderBy('is_verified', 'desc')->orderBy('name');

        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        return response()->json($q->paginate($perPage))
            ->header('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    }

    // GET /api/companies/{id} — public company profile with open jobs
    public function show($id)
    {
        $company = Company::with(['location:id,name', 'gallery', 'awards'])
            ->withCount('followers as follower_count')
            ->where('status', 'approved')
            ->findOrFail($id);

        $jobs = $company->jobs()
            ->with(['category:id,name,slug', 'location:id,name'])
            ->where('status', 'published')
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'company' => $company,
            'jobs'    => $jobs,
        ]);
    }

    // POST /api/companies — employer creates their company profile
    public function store(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        if (Company::where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You already have a company profile.'], 422);
        }

        $data = $request->validate([
            'name'            => 'required|string|max:190',
            'registration_no' => 'nullable|string|max:80',
            'industry'        => 'nullable|string|max:120',
            'website'         => ['nullable', 'url', 'max:190', 'regex:/^https?:\/\//'],
            'address'         => 'nullable|string|max:255',
            'location_id'     => 'nullable|exists:locations,id',
            'logo_url'        => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//'],
            'description'     => 'nullable|string|max:10000',
        ]);

        // C-S1: the company "about" description + culture & values are rendered raw
        // (rich text) on the public profile, so strip unsafe HTML before storing.
        foreach (['description', 'culture_values'] as $richField) {
            if (array_key_exists($richField, $data)) {
                $data[$richField] = HtmlSanitizer::clean($data[$richField]);
            }
        }

        // Single INSERT: set status directly on the instance (bypasses fillable; no second UPDATE)
        $company = new Company($data);
        $company->user_id = $user->id;
        $company->status  = 'pending';
        $company->save();

        \App\Models\Notification::recordAdmins('company_pending', 'New company pending', 'Company “' . $company->name . '” registered and is awaiting approval.');

        return response()->json($company->load('location:id,name'), 201);
    }

    // PUT /api/companies/{id} — employer updates their own company
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);

        $data = $request->validate([
            'name'            => 'sometimes|string|max:190',
            'registration_no' => 'nullable|string|max:80',
            'industry'        => 'nullable|string|max:120',
            'website'         => ['nullable', 'url', 'max:190', 'regex:/^https?:\/\//'],
            'address'         => 'nullable|string|max:255',
            'location_id'     => 'nullable|exists:locations,id',
            'logo_url'        => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//'],
            'description'       => 'nullable|string|max:10000',
            'social_links'      => 'nullable|array',
            'cover_banner_url'  => 'nullable|string|max:255',
            'company_size'      => 'nullable|in:1-10,11-50,51-200,201-500,500+',
            'telegram_chat_id'  => 'nullable|string|max:64',
            'vat_tin'           => 'nullable|string|max:50',
            'vat_legal_name'    => 'nullable|string|max:190',
            'vat_address'       => 'nullable|string|max:255',
            'culture_values'    => 'nullable|string|max:5000',
            'benefits_tags'     => 'nullable|array',
            'benefits_tags.*'   => 'string|max:50',
        ]);

        $needsResubmit = in_array($company->status, ['rejected', 'suspended']);

        // C-S1: sanitize the rich "about" description + culture & values on edit too.
        foreach (['description', 'culture_values'] as $richField) {
            if (array_key_exists($richField, $data)) {
                $data[$richField] = HtmlSanitizer::clean($data[$richField]);
            }
        }

        // Single UPDATE: fill validated data, set status directly if needed, then one save()
        $company->fill($data);
        // Sanitize social links — keep only known platforms with non-empty values.
        if ($request->has('social_links')) {
            $links = [];
            foreach (['facebook', 'linkedin', 'twitter', 'instagram'] as $k) {
                $v = trim((string) $request->input("social_links.$k", ''));
                if ($v !== '') { $links[$k] = mb_substr($v, 0, 255); }
            }
            $company->social_links = $links ?: null;
        }
        if ($needsResubmit) {
            $company->status = 'pending';
        }
        $company->save();

        if ($needsResubmit) {
            \App\Models\Notification::recordAdmins('company_pending', 'Company resubmitted', 'Company “' . $company->name . '” was updated and is awaiting re-approval.');
        }

        return response()->json($company->load('location:id,name', 'gallery', 'awards'));
    }

    // GET /api/employer/company — employer views their own profile (any status)
    public function mine(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        // Company owner
        $company = Company::with(['location:id,name', 'gallery', 'awards'])
            ->where('user_id', $user->id)
            ->first();

        // Recruiter — look up via company_id
        if (! $company && $user->company_id) {
            $company = Company::with(['location:id,name', 'gallery', 'awards'])
                ->find($user->company_id);
        }

        if (! $company) abort(404, 'No company profile found.');

        return response()->json($company);
    }

    // POST /api/companies/{id}/logo — employer uploads company logo
    public function uploadLogo(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);

        return $this->storeCompanyLogo($request, $company);
    }

    // POST /api/admin/companies/{id}/logo — admin uploads/sets a company logo
    public function adminUploadLogo(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);

        return $this->storeCompanyLogo($request, $company);
    }

    // POST /api/admin/companies/{id}/cover-banner — admin uploads/sets a company cover banner
    public function adminUploadCoverBanner(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);
        $request->validate(['image' => 'required|image|max:10240']);

        $company->cover_banner_url = $this->storeImage($request->file('image'), 'banners', 'cover_' . $company->id, 1600);
        $company->save();

        return response()->json(['company' => $company->fresh()]);
    }

    // Shared logo processing: resize to ≤400px, store as JPG, save logo_url.
    private function storeCompanyLogo(Request $request, Company $company)
    {
        $request->validate(['logo' => 'required|image|max:10240']);

        $file = $request->file('logo');
        $raw  = file_get_contents($file->getRealPath());
        $src  = @imagecreatefromstring($raw);

        if (!$src) {
            return response()->json(['message' => 'Could not process image. Please use JPG, PNG, or GIF.'], 422);
        }

        $origW = imagesx($src);
        $origH = imagesy($src);
        $maxPx = 400;

        if ($origW > $maxPx || $origH > $maxPx) {
            $ratio  = min($maxPx / $origW, $maxPx / $origH);
            $newW   = (int) round($origW * $ratio);
            $newH   = (int) round($origH * $ratio);
        } else {
            $newW = $origW;
            $newH = $origH;
        }

        $dst = imagecreatetruecolor($newW, $newH);
        $white = imagecolorallocate($dst, 255, 255, 255);
        imagefill($dst, 0, 0, $white);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
        imagedestroy($src);

        $dir      = storage_path('app/public/logos');
        if (!is_dir($dir)) { mkdir($dir, 0755, true); }

        $filename = 'logo_' . $company->id . '_' . time() . '.jpg';
        $fullPath = $dir . '/' . $filename;

        imagejpeg($dst, $fullPath, 85);
        imagedestroy($dst);

        $logoUrl = url('storage/logos/' . $filename);
        $company->update(['logo_url' => $logoUrl]);

        return response()->json(['company' => $company->fresh()]);
    }

    // POST /api/companies/{id}/gallery — employer uploads a gallery photo
    public function uploadGalleryPhoto(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);

        if ($company->gallery()->count() >= 30) {
            return response()->json(['message' => 'Gallery limit reached (30 photos).'], 422);
        }

        $request->validate([
            'photo'   => 'required|image|max:10240',
            'caption' => 'nullable|string|max:255',
        ]);

        $url = $this->storeImage($request->file('photo'), 'gallery', 'gallery_' . $company->id, 1200);

        $photo = CompanyPhoto::create([
            'company_id' => $company->id,
            'url'        => $url,
            'caption'    => $request->input('caption'),
            'sort_order' => (int) $company->gallery()->max('sort_order') + 1,
        ]);

        return response()->json(['photo' => $photo], 201);
    }

    // PATCH /api/companies/{id}/gallery/{photoId} — edit a photo's caption
    public function updateGalleryPhoto(Request $request, $id, $photoId)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);
        $photo   = $company->gallery()->findOrFail($photoId);

        $data = $request->validate(['caption' => 'nullable|string|max:255']);
        $photo->update(['caption' => $data['caption'] ?? null]);

        return response()->json(['photo' => $photo]);
    }

    // DELETE /api/companies/{id}/gallery/{photoId}
    public function deleteGalleryPhoto(Request $request, $id, $photoId)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);
        $photo   = $company->gallery()->findOrFail($photoId);

        // Best-effort removal of the stored file.
        $path = storage_path('app/public/gallery/' . basename(parse_url($photo->url, PHP_URL_PATH)));
        if (is_file($path)) { @unlink($path); }

        $photo->delete();

        return response()->json(['message' => 'Photo removed.']);
    }

    // POST /api/companies/{id}/about-image — employer uploads the About feature image
    public function uploadAboutImage(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);
        $request->validate(['image' => 'required|image|max:10240']);

        $company->about_image_url = $this->storeImage($request->file('image'), 'about', 'about_' . $company->id, 1400);
        $company->save();

        return response()->json(['company' => $company->fresh()->load('location:id,name', 'gallery', 'awards')]);
    }

    // POST /api/companies/{id}/cover-banner — employer uploads cover banner
    public function uploadCoverBanner(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);
        $request->validate(['image' => 'required|image|max:10240']);

        $company->cover_banner_url = $this->storeImage($request->file('image'), 'banners', 'cover_' . $company->id, 1600);
        $company->save();

        return response()->json(['company' => $company->fresh()->load('location:id,name', 'gallery', 'awards')]);
    }

    // POST /api/companies/{id}/awards — employer adds an award
    public function storeAward(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);

        $data = $request->validate([
            'title'       => 'required|string|max:190',
            'year'        => 'nullable|string|max:8',
            'description' => 'nullable|string|max:500',
        ]);

        $award = CompanyAward::create([
            'company_id'  => $company->id,
            'title'       => $data['title'],
            'year'        => $data['year'] ?? null,
            'description' => $data['description'] ?? null,
            'sort_order'  => (int) $company->awards()->max('sort_order') + 1,
        ]);

        return response()->json($award, 201);
    }

    // DELETE /api/companies/{id}/awards/{awardId}
    public function deleteAward(Request $request, $id, $awardId)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);
        $company->awards()->findOrFail($awardId)->delete();

        return response()->json(['message' => 'Award removed.']);
    }

    // POST /api/companies/{id}/awards/{awardId}/image — attach a certificate image to an award
    public function uploadAwardImage(Request $request, $id, $awardId)
    {
        $user = $request->user();
        $this->requirePermission('post_jobs');
        $this->requireEmployerRole($user);

        $company = $this->ownCompany($user, $id);
        $award   = $company->awards()->findOrFail($awardId);

        $request->validate(['image' => 'required|image|max:10240']);
        $award->image_url = $this->storeImage($request->file('image'), 'awards', 'award_' . $company->id, 1000);
        $award->save();

        return response()->json($award);
    }

    // ---- Admin endpoints -----------------------------------------------

    // GET /api/admin/companies — all companies, any status, with filters
    public function adminIndex(Request $request)
    {
        $this->requirePermission('approve_companies');

        $q = Company::with(['owner:id,name,email', 'location:id,name']);

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $q->where('name', 'like', $term);
        }

        $q->orderBy('created_at', 'desc');

        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        return response()->json($q->paginate($perPage));
    }

    // PATCH /api/admin/companies/{id}/approve
    public function approve(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);
        $company->forceFill(['status' => 'approved'])->save();

        $this->auditLog('company.approved', ['company_id' => $company->id, 'company_name' => $company->name]);

        return response()->json(['message' => 'Company approved.', 'status' => 'approved']);
    }

    // PATCH /api/admin/companies/{id}/reject
    public function reject(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);
        $company->forceFill(['status' => 'rejected'])->save();

        $this->auditLog('company.rejected', ['company_id' => $company->id, 'company_name' => $company->name]);

        return response()->json(['message' => 'Company rejected.', 'status' => 'rejected']);
    }

    // PATCH /api/admin/companies/{id}/suspend
    public function suspend(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);
        $company->forceFill(['status' => 'suspended'])->save();

        $this->auditLog('company.suspended', ['company_id' => $company->id, 'company_name' => $company->name]);

        return response()->json(['message' => 'Company suspended.', 'status' => 'suspended']);
    }

    // PATCH /api/admin/companies/{id}/verify
    public function verify(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);
        $company->forceFill(['is_verified' => ! $company->is_verified])->save();

        $label = $company->is_verified ? 'verified' : 'unverified';
        $this->auditLog('company.' . $label, ['company_id' => $company->id, 'company_name' => $company->name]);

        return response()->json(['message' => "Company $label.", 'is_verified' => $company->is_verified]);
    }

    // POST /api/admin/companies — admin creates a company shell (e.g. on an employer's
    // behalf). The owner (companies.user_id, required) defaults to the acting admin as a
    // placeholder; an employer is attached later via adminAddMember (the Access modal) as
    // 'company_admin' = full control, and manages it from the employer dashboard.
    public function adminStore(Request $request)
    {
        $this->requirePermission('approve_companies');

        $data = $request->validate([
            'name'            => 'required|string|max:190',
            'registration_no' => 'nullable|string|max:80',
            'industry'        => 'nullable|string|max:120',
            'website'         => ['nullable', 'url', 'max:190', 'regex:/^https?:\/\//'],
            'address'         => 'nullable|string|max:255',
            'location_id'     => 'nullable|exists:locations,id',
            'logo_url'        => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//'],
            'description'     => 'nullable|string|max:10000',
            'status'          => 'nullable|in:pending,approved',
        ]);

        // No duplicate companies — reject if the name already exists (case-insensitive).
        $data['name'] = trim($data['name']);
        if (Company::whereRaw('LOWER(name) = ?', [mb_strtolower($data['name'])])->exists()) {
            return response()->json(['message' => 'A company named “' . $data['name'] . '” already exists.'], 422);
        }

        // Same sanitize-on-write rule as store()/update() — the description is rendered raw.
        if (array_key_exists('description', $data)) {
            $data['description'] = HtmlSanitizer::clean($data['description']);
        }

        $status = $data['status'] ?? 'approved';
        unset($data['status']);

        $company = new Company($data);
        $company->user_id = $request->user()->id; // placeholder owner; reassign via members
        $company->status  = $status;
        $company->save();

        $this->auditLog('company.admin_created', [
            'company_id'   => $company->id,
            'company_name' => $company->name,
            'status'       => $status,
        ]);

        return response()->json($company->load('location:id,name'), 201);
    }

    // ── Admin: company access / team management ───────────────────────────────
    // A company's people = its owner (companies.user_id, always full control) plus any
    // members linked via users.company_id + company_role:
    //   'company_admin' = full control (posts published directly, manages team + billing)
    //   'recruitment'   = recruiter (can post, but jobs need company-admin approval)

    // GET /api/admin/companies/{id}/members
    public function adminMembers(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);

        $owner = $company->user_id
            ? User::select('id', 'name', 'email', 'avatar_url', 'status')->find($company->user_id)
            : null;

        $members = User::select('id', 'name', 'email', 'avatar_url', 'company_role', 'status', 'created_at')
            ->where('company_id', $company->id)
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'company' => $company->only('id', 'name', 'logo_url'),
            'owner'   => $owner,
            'members' => $members,
        ]);
    }

    // POST /api/admin/companies/{id}/members — attach an existing user (by email) or
    // create+invite a new one, with a company role. Full control = 'company_admin'.
    public function adminAddMember(Request $request, $id)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);

        $data = $request->validate([
            'email' => 'required|email|max:190',
            'name'  => 'nullable|string|max:120',
            'role'  => 'required|in:company_admin,recruitment',
        ]);

        $existing = User::where('email', $data['email'])->first();

        if ($existing) {
            // Can't re-add the owner or someone already attached to another company.
            if ((int) $company->user_id === (int) $existing->id) {
                return response()->json(['message' => 'That user is already the company owner (full control).'], 422);
            }
            if ($existing->company_id && (int) $existing->company_id !== (int) $company->id) {
                return response()->json(['message' => 'That account already belongs to another company. Remove it there first.'], 422);
            }
            if (optional($existing->role)->slug !== 'employer') {
                return response()->json(['message' => 'That account is not an employer account. Use a different email or create a new member.'], 422);
            }
            $existing->update(['company_id' => $company->id, 'company_role' => $data['role']]);
            $member = $existing;
            $created = false;
        } else {
            $employerRole = Role::where('slug', 'employer')->first();
            if (! $employerRole) {
                abort(500, 'Employer role not found.');
            }
            $member = User::create([
                'role_id'       => $employerRole->id,
                'company_id'    => $company->id,
                'company_role'  => $data['role'],
                'name'          => $data['name'] ?: strstr($data['email'], '@', true),
                'email'         => $data['email'],
                'password_hash' => Hash::make(Str::random(24)),
                'status'        => 'active',
            ]);
            $created = true;
        }

        $this->auditLog('company.member_assigned', [
            'company_id' => $company->id,
            'user_id'    => $member->id,
            'role'       => $data['role'],
            'created'    => $created,
        ]);

        return response()->json([
            'message' => $created
                ? 'Member created and assigned. They can log in and reset their password.'
                : 'User assigned to the company.',
            'member'  => $member->only('id', 'name', 'email', 'company_role', 'status', 'created_at'),
        ], $created ? 201 : 200);
    }

    // PATCH /api/admin/companies/{id}/members/{userId} — change a member's role
    public function adminUpdateMember(Request $request, $id, $userId)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);

        if ((int) $company->user_id === (int) $userId) {
            return response()->json(['message' => "The owner's role can't be changed here."], 422);
        }

        $data = $request->validate([
            'role' => 'required|in:company_admin,recruitment',
        ]);

        $member = User::where('company_id', $company->id)->where('id', $userId)->firstOrFail();
        $member->update(['company_role' => $data['role']]);

        $this->auditLog('company.member_role_changed', [
            'company_id' => $company->id,
            'user_id'    => $member->id,
            'role'       => $data['role'],
        ]);

        return response()->json([
            'message' => 'Member role updated.',
            'member'  => $member->only('id', 'name', 'email', 'company_role', 'status'),
        ]);
    }

    // DELETE /api/admin/companies/{id}/members/{userId} — detach a member (keeps the account)
    public function adminRemoveMember(Request $request, $id, $userId)
    {
        $this->requirePermission('approve_companies');

        $company = Company::findOrFail($id);

        if ((int) $company->user_id === (int) $userId) {
            return response()->json(['message' => "The owner can't be removed here. Transfer ownership first."], 422);
        }

        $member = User::where('company_id', $company->id)->where('id', $userId)->firstOrFail();
        $member->update(['company_id' => null, 'company_role' => null]);

        $this->auditLog('company.member_removed', [
            'company_id' => $company->id,
            'user_id'    => $member->id,
        ]);

        return response()->json(['message' => 'Member removed from the company.']);
    }

    // ----------------------------------------------------------------
    private function requireEmployerRole($user): void
    {
        if (! $user || optional($user->role)->slug !== 'employer') {
            abort(403, 'Forbidden. Employer account required.');
        }
    }

    private function ownCompany($user, $id): Company
    {
        // Company owner
        $company = Company::where('user_id', $user->id)->find($id);
        if ($company) return $company;

        // Recruiter — can act on the company they belong to
        if ($user->company_id && (int) $user->company_id === (int) $id) {
            $company = Company::find($id);
            if ($company) return $company;
        }

        abort(404);
    }

    // Store an uploaded image under storage/app/public/{subdir}, returning its public URL.
    // Uses GD to downscale when available; otherwise stores the (client-compressed) file as-is.
    private function storeImage($file, string $subdir, string $prefix, int $maxPx): string
    {
        $dir = storage_path('app/public/' . $subdir);
        if (!is_dir($dir)) { mkdir($dir, 0755, true); }

        $base = $prefix . '_' . time() . '_' . mt_rand(1000, 9999);
        $src  = function_exists('imagecreatefromstring')
            ? @imagecreatefromstring(file_get_contents($file->getRealPath()))
            : false;

        if ($src) {
            $origW = imagesx($src);
            $origH = imagesy($src);
            if ($origW > $maxPx || $origH > $maxPx) {
                $ratio = min($maxPx / $origW, $maxPx / $origH);
                $newW  = (int) round($origW * $ratio);
                $newH  = (int) round($origH * $ratio);
            } else {
                $newW = $origW;
                $newH = $origH;
            }
            $dst   = imagecreatetruecolor($newW, $newH);
            $white = imagecolorallocate($dst, 255, 255, 255);
            imagefill($dst, 0, 0, $white);
            imagecopyresampled($dst, $src, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
            imagedestroy($src);
            $filename = $base . '.jpg';
            imagejpeg($dst, $dir . '/' . $filename, 85);
            imagedestroy($dst);
        } else {
            $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) { $ext = 'jpg'; }
            $filename = $base . '.' . $ext;
            $file->move($dir, $filename);
        }

        return url('storage/' . $subdir . '/' . $filename);
    }
}
