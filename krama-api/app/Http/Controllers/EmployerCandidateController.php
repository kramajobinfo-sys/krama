<?php

namespace App\Http\Controllers;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\Application;
use App\Models\CandidateInvitation;
use App\Models\Company;
use App\Models\Job;
use App\Models\Notification;
use App\Models\Resume;
use App\Models\Role;
use App\Models\SavedCandidate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

// Employer candidate search + talent pool. Only candidates who opted into employer visibility
// (cv_visibility public|employers) are searchable; a 'private' profile is never exposed. Direct
// contact details are shown only for 'public' profiles. The saved list is company-scoped.
class EmployerCandidateController extends Controller
{
    // Cap on candidates scanned per search (PHP-side filtering of JSON résumé data). Fine for the
    // current catalogue; revisit with a search index if the candidate pool grows large.
    private const SCAN_CAP = 2000;

    private function employerCompanyId($user): ?int
    {
        $owned = Company::where('user_id', $user->id)->value('id');
        return $owned ?: $user->company_id;
    }

    private function candidateRoleId(): ?int
    {
        return Role::where('slug', 'candidate')->value('id');
    }

    // Best résumé per candidate: primary first, else most-recently updated.
    private function bestResumes()
    {
        $rid = $this->candidateRoleId();
        return Resume::with('candidate:id,name,avatar_url,cv_visibility,email,phone')
            ->whereHas('candidate', fn ($c) => $c->where('role_id', $rid)->whereIn('cv_visibility', ['public', 'employers']))
            ->orderByDesc('is_primary')->orderByDesc('updated_at')
            ->limit(self::SCAN_CAP)->get()
            ->filter(fn ($r) => $r->candidate)
            ->unique('candidate_id');
    }

    private function summary(Resume $r, array $savedIds): array
    {
        $d = (array) ($r->data ?: []);
        return [
            'id'         => $r->candidate->id,
            'name'       => $r->candidate->name,
            'avatar_url' => $r->candidate->avatar_url,
            'headline'   => $r->headline,
            'skills'     => array_slice(array_values((array) ($d['skills'] ?? [])), 0, 12),
            'has_cv'     => ! empty($r->file_url),
            'saved'      => in_array($r->candidate->id, $savedIds, true),
        ];
    }

    // GET /employer/candidates — search the talent database
    public function search(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $companyId = $this->employerCompanyId($user);

        $kw     = mb_strtolower(trim((string) $request->input('keyword', '')));
        $skills = array_filter(array_map(fn ($s) => mb_strtolower(trim($s)), explode(',', (string) $request->input('skills', ''))));
        $langs  = array_filter(array_map(fn ($s) => mb_strtolower(trim($s)), explode(',', (string) $request->input('languages', ''))));
        $sort   = $request->input('sort', 'recent');

        $savedIds = SavedCandidate::where('company_id', $companyId)->pluck('candidate_id')->all();

        $matched = $this->bestResumes()->filter(function ($r) use ($kw, $skills, $langs) {
            $d = (array) ($r->data ?: []);
            $rSkills = array_map('mb_strtolower', array_map('strval', (array) ($d['skills'] ?? [])));
            $rLangs  = array_map('mb_strtolower', array_map('strval', (array) ($d['languages'] ?? [])));

            // skills / languages: candidate must contain ALL requested (substring, case-insensitive)
            foreach ($skills as $need) {
                if (! self::listHas($rSkills, $need)) return false;
            }
            foreach ($langs as $need) {
                if (! self::listHas($rLangs, $need)) return false;
            }
            if ($kw !== '') {
                $hay = mb_strtolower(implode(' ', array_filter([
                    $r->candidate->name, $r->headline, $r->summary,
                    implode(' ', $rSkills), json_encode($d['experience'] ?? []), json_encode($d['education'] ?? []),
                ])));
                if (mb_strpos($hay, $kw) === false) return false;
            }
            return true;
        })->values();

        if ($sort === 'name') {
            $matched = $matched->sortBy(fn ($r) => mb_strtolower($r->candidate->name))->values();
        } else {
            $matched = $matched->sortByDesc(fn ($r) => optional($r->updated_at)->timestamp)->values();
        }

        $perPage = min(50, max(1, (int) $request->input('per_page', 20)));
        $page    = max(1, (int) $request->input('page', 1));
        $total   = $matched->count();
        $items   = $matched->slice(($page - 1) * $perPage, $perPage)
            ->map(fn ($r) => $this->summary($r, $savedIds))->values();

        return response()->json([
            'data'         => $items,
            'total'        => $total,
            'per_page'     => $perPage,
            'current_page' => $page,
            'last_page'    => (int) ceil($total / $perPage) ?: 1,
        ]);
    }

    private static function listHas(array $list, string $needle): bool
    {
        foreach ($list as $item) {
            if (mb_strpos($item, $needle) !== false) return true;
        }
        return false;
    }

    // GET /employer/candidates/{id} — full profile (privacy-aware)
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $companyId = $this->employerCompanyId($user);

        $candidate = User::where('role_id', $this->candidateRoleId())
            ->whereIn('cv_visibility', ['public', 'employers'])
            ->findOrFail($id);

        $resume = Resume::where('candidate_id', $candidate->id)
            ->orderByDesc('is_primary')->orderByDesc('updated_at')->first();
        $d = (array) (optional($resume)->data ?: []);

        $out = [
            'id'         => $candidate->id,
            'name'       => $candidate->name,
            'avatar_url' => $candidate->avatar_url,
            'headline'   => optional($resume)->headline,
            'summary'    => optional($resume)->summary,
            'skills'         => array_values((array) ($d['skills'] ?? [])),
            'experience'     => array_values((array) ($d['experience'] ?? [])),
            'education'      => array_values((array) ($d['education'] ?? [])),
            'languages'      => array_values((array) ($d['languages'] ?? [])),
            'certifications' => array_values((array) ($d['certifications'] ?? [])),
            'has_cv'     => ! empty(optional($resume)->file_url),
            'saved'      => SavedCandidate::where('company_id', $companyId)->where('candidate_id', $candidate->id)->exists(),
            'invitations' => CandidateInvitation::where('company_id', $companyId)->where('candidate_id', $candidate->id)
                ->with('job:id,title')->get()
                ->map(fn ($v) => ['job_id' => $v->job_id, 'job' => optional($v->job)->title, 'status' => $v->effectiveStatus()])->values(),
        ];
        // Direct contact only for fully-public profiles; 'employers'-visible candidates are
        // reached via Message / Invite-to-apply, not a raw contact dump.
        if ($candidate->cv_visibility === 'public') {
            $out['email'] = $candidate->email;
            $out['phone'] = $candidate->phone;
        }

        return response()->json($out);
    }

    // GET /employer/candidates/{id}/cv — stream the candidate's résumé file (visible profiles only)
    public function downloadCv(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        $candidate = User::where('role_id', $this->candidateRoleId())
            ->whereIn('cv_visibility', ['public', 'employers'])
            ->findOrFail($id);

        $resume = Resume::where('candidate_id', $candidate->id)->whereNotNull('file_url')
            ->orderByDesc('is_primary')->orderByDesc('updated_at')->first();
        if (! $resume || ! $resume->file_url) {
            abort(404, 'No CV on file for this candidate.');
        }
        if (str_starts_with($resume->file_url, 'http')) {
            return redirect($resume->file_url);
        }
        $disk = Storage::disk('local');
        if (! $disk->exists($resume->file_url)) {
            abort(404, 'CV file not found.');
        }
        $ext = pathinfo($resume->file_url, PATHINFO_EXTENSION);
        return response()->streamDownload(function () use ($disk, $resume) {
            echo $disk->get($resume->file_url);
        }, ($candidate->name ?: 'Candidate') . ($ext ? '.' . $ext : ''), ['Content-Type' => $disk->mimeType($resume->file_url)]);
    }

    // POST /employer/candidates/{id}/invite — invite a candidate to apply to a published job
    public function invite(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $companyId = $this->employerCompanyId($user);

        $candidate = User::where('role_id', $this->candidateRoleId())
            ->whereIn('cv_visibility', ['public', 'employers'])
            ->findOrFail($id);

        $data = $request->validate([
            'job_id'  => 'required|integer',
            'message' => 'nullable|string|max:2000',
        ]);

        // The job must be a PUBLISHED job owned by this employer's company.
        $job = Job::where('company_id', $companyId)->where('status', 'published')->findOrFail($data['job_id']);

        if (Application::where('job_id', $job->id)->where('candidate_id', $candidate->id)->exists()) {
            return response()->json(['message' => 'This candidate has already applied to that job.'], 422);
        }

        $inv    = CandidateInvitation::firstOrNew(['job_id' => $job->id, 'candidate_id' => $candidate->id]);
        $isNew  = ! $inv->exists;
        $reopen = $isNew || in_array($inv->status, ['declined', 'expired'], true);
        $inv->fill(['company_id' => $companyId, 'invited_by' => $user->id, 'message' => $data['message'] ?? null]);
        if ($reopen) {
            $inv->status       = 'sent';
            $inv->expires_at   = now()->addDays(30);
            $inv->viewed_at    = null;
            $inv->responded_at = null;
        }
        $inv->save();

        if ($reopen) {
            $companyName = $job->company->name ?? 'A company';
            Notification::record(
                $candidate->id,
                'invitation',
                'Invitation to apply',
                $companyName . ' invited you to apply for “' . $job->title . '”.'
            );
            try {
                if (MailConfig::isConfigured() && method_exists(EmailTemplates::class, 'invitedToApply')) {
                    MailConfig::applyFromDb();
                    [$subject, $html] = EmailTemplates::invitedToApply($candidate->name, $job->title, $companyName, $data['message'] ?? null);
                    Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
                }
            } catch (\Throwable $e) {
                Log::warning('Invite-to-apply email failed: ' . $e->getMessage());
            }
        }

        return response()->json(['id' => $inv->id, 'job_id' => $job->id, 'status' => $inv->effectiveStatus()], $isNew ? 201 : 200);
    }

    // POST /employer/candidates/{id}/save — add to the talent pool
    public function save(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $companyId = $this->employerCompanyId($user);

        $candidate = User::where('role_id', $this->candidateRoleId())
            ->whereIn('cv_visibility', ['public', 'employers'])
            ->findOrFail($id);

        $data = $request->validate(['note' => 'nullable|string|max:2000']);

        $row = SavedCandidate::updateOrCreate(
            ['company_id' => $companyId, 'candidate_id' => $candidate->id],
            ['saved_by' => $user->id, 'note' => $data['note'] ?? null]
        );

        return response()->json(['saved' => true, 'id' => $row->id], 201);
    }

    // DELETE /employer/candidates/{id}/save — remove from the talent pool
    public function unsave(Request $request, $id)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $companyId = $this->employerCompanyId($user);

        SavedCandidate::where('company_id', $companyId)->where('candidate_id', $id)->delete();
        return response()->json(['saved' => false]);
    }

    // GET /employer/talent-pool — the company's saved candidates (optionally keyword-filtered)
    public function pool(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');
        $companyId = $this->employerCompanyId($user);

        $ids = SavedCandidate::where('company_id', $companyId)->orderByDesc('created_at')->pluck('candidate_id')->all();
        if (empty($ids)) {
            return response()->json(['data' => [], 'total' => 0]);
        }

        $kw = mb_strtolower(trim((string) $request->input('keyword', '')));
        $resumes = Resume::with('candidate:id,name,avatar_url,cv_visibility')
            ->whereIn('candidate_id', $ids)
            ->orderByDesc('is_primary')->orderByDesc('updated_at')->get()
            ->filter(fn ($r) => $r->candidate)->unique('candidate_id');

        $items = $resumes->filter(function ($r) use ($kw) {
            if ($kw === '') return true;
            $d = (array) ($r->data ?: []);
            $hay = mb_strtolower(implode(' ', array_filter([$r->candidate->name, $r->headline, implode(' ', (array) ($d['skills'] ?? []))])));
            return mb_strpos($hay, $kw) !== false;
        })->map(fn ($r) => $this->summary($r, $ids))->values();

        return response()->json(['data' => $items, 'total' => $items->count()]);
    }
}
