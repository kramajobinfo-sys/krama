<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyAward;
use App\Models\CompanyPhoto;
use Illuminate\Http\Request;

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

        $perPage = min(50, max(1, (int) $request->input('per_page', 20)));

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
            'culture_values'    => 'nullable|string|max:5000',
            'benefits_tags'     => 'nullable|array',
            'benefits_tags.*'   => 'string|max:50',
        ]);

        $needsResubmit = in_array($company->status, ['rejected', 'suspended']);

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
