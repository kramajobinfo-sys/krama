<?php

namespace App\Http\Controllers;

use App\Models\Resume;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResumeController extends Controller
{
    // GET /api/admin/resumes — paginated list with candidate info
    public function adminIndex(Request $request)
    {
        $this->requirePermission('manage_users');

        $q       = $request->query('q', '');
        $perPage = min((int) $request->query('per_page', 20), 100);

        $query = Resume::with(['candidate:id,name,email,phone,avatar_url,status'])
            ->when($q, function ($b) use ($q) {
                $b->whereHas('candidate', function ($u) use ($q) {
                    $u->where('name', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
                })->orWhere('headline', 'like', "%{$q}%");
            })
            ->orderBy('updated_at', 'desc');

        $paginated = $query->paginate($perPage);

        return response()->json([
            'data'  => $paginated->items(),
            'total' => $paginated->total(),
            'last_page' => $paginated->lastPage(),
            'per_page'  => $paginated->perPage(),
            'current_page' => $paginated->currentPage(),
        ]);
    }

    // GET /api/admin/resumes/{id} — full resume with candidate details
    public function adminShow(Request $request, $id)
    {
        $this->requirePermission('manage_users');

        $resume = Resume::with(['candidate:id,name,email,phone,bio,avatar_url,status,created_at'])
            ->findOrFail($id);

        $data = $resume->toArray();

        // Expose a download flag without leaking the raw storage path
        $data['has_cv'] = (bool) $resume->file_url;
        unset($data['file_url']);

        return response()->json($data);
    }

    // GET /api/candidate/resume
    public function show(Request $request)
    {
        $user = $request->user();
        $resume = Resume::where('candidate_id', $user->id)->orderBy('is_primary', 'desc')->first();
        return response()->json($this->withDownloadUrl($resume));
    }

    // PUT /api/candidate/resume — create or update
    public function save(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'headline'              => 'nullable|string|max:190',
            'summary'               => 'nullable|string|max:5000',
            'data'                  => 'nullable|array',
            'data.education'        => 'nullable|array|max:20',
            'data.experience'       => 'nullable|array|max:30',
            'data.skills'           => 'nullable|array|max:100',
            'data.certifications'   => 'nullable|array|max:30',
            'data.languages'        => 'nullable|array|max:20',
        ]);

        $resume = Resume::updateOrCreate(
            ['candidate_id' => $user->id],
            array_merge($data, ['is_primary' => true])
        );

        return response()->json($this->withDownloadUrl($resume));
    }

    // POST /api/candidate/resume/upload — upload CV file (PDF/DOC)
    public function upload(Request $request)
    {
        $request->validate(['cv' => 'required|mimes:pdf,doc,docx|max:5120']);

        $user = $request->user();
        $resume = Resume::where('candidate_id', $user->id)->first();

        // Delete old file from private storage
        if ($resume && $resume->file_url && !str_starts_with($resume->file_url, 'http')) {
            Storage::disk('local')->delete($resume->file_url);
        }

        $file        = $request->file('cv');
        $clientExt   = strtolower($file->getClientOriginalExtension());
        $allowedExts = ['pdf', 'doc', 'docx'];
        $ext         = in_array($clientExt, $allowedExts) ? $clientExt : 'pdf';
        $name        = Str::slug($user->name) . '_cv_' . Str::random(6) . '.' . $ext;

        // Store in private local disk (not web-accessible)
        $path = $file->storeAs('cvs', $name, 'local');

        if ($resume) {
            $resume->update(['file_url' => $path]);
        } else {
            $resume = Resume::create(['candidate_id' => $user->id, 'file_url' => $path, 'is_primary' => true]);
        }

        return response()->json(['download_url' => route('resume.download'), 'resume' => $this->withDownloadUrl($resume)]);
    }

    // GET /api/admin/resumes/{id}/cv — admin CV download for any candidate
    public function adminDownloadCv(Request $request, $id)
    {
        $this->requirePermission('manage_users');

        $resume = Resume::findOrFail($id);

        if (! $resume->file_url) {
            abort(404, 'No CV file for this resume.');
        }

        // Normalize: legacy URLs like http://host/storage/cvs/file.pdf → public disk path cvs/file.pdf
        if (str_starts_with($resume->file_url, 'http')) {
            $parsed   = parse_url($resume->file_url, PHP_URL_PATH);       // e.g. /storage/cvs/file.pdf
            $relative = ltrim(preg_replace('#^/storage/#', '', $parsed), '/'); // e.g. cvs/file.pdf
            $disk     = Storage::disk('public');
        } else {
            $relative = $resume->file_url;
            $disk     = Storage::disk('local');
        }

        if (! $disk->exists($relative)) {
            abort(404, 'CV file not found on disk.');
        }

        $filename = basename($relative);
        return response()->streamDownload(function () use ($disk, $relative) {
            echo $disk->get($relative);
        }, $filename, ['Content-Type' => $disk->mimeType($relative)]);
    }

    // GET /api/candidate/resume/cv — authenticated CV download (candidate's own)
    public function downloadCv(Request $request)
    {
        $user   = $request->user();
        $resume = Resume::where('candidate_id', $user->id)->first();

        if (! $resume || ! $resume->file_url) {
            abort(404, 'No CV file found.');
        }

        // Legacy files had full public URLs; new ones are private paths
        if (str_starts_with($resume->file_url, 'http')) {
            return redirect($resume->file_url);
        }

        $disk = Storage::disk('local');
        if (! $disk->exists($resume->file_url)) {
            abort(404, 'CV file not found on disk.');
        }

        $filename = basename($resume->file_url);
        return response()->streamDownload(function () use ($disk, $resume) {
            echo $disk->get($resume->file_url);
        }, $filename, ['Content-Type' => $disk->mimeType($resume->file_url)]);
    }

    // Append a stable download_url to the resume payload
    private function withDownloadUrl(?Resume $resume): ?array
    {
        if (! $resume) {
            return null;
        }

        $data = $resume->toArray();

        if ($resume->file_url) {
            // Expose a download URL, never the raw storage path
            $data['download_url'] = route('resume.download');
            unset($data['file_url']);
        }

        return $data;
    }
}
