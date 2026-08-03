<?php

namespace App\Http\Controllers;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\Company;
use App\Models\Job;
use App\Models\JobAlert;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Setting;
use App\Models\Subscription;
use App\Support\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class JobController extends Controller
{
    // GET /api/jobs — public listing with filters + pagination
    public function index(Request $request)
    {
        // Expire overdue subscriptions (and close their now-lapsed jobs) before filtering.
        Subscription::expireOverdue();

        $q = Job::with(['company:id,name,logo_url,is_verified', 'category:id,name,slug', 'location:id,name'])
            ->where('status', 'published')
            ->where(function ($outer) {
                // Show jobs from companies with no subscription (free tier) or with at
                // least one active/trial subscription. 'pending' is included (H-6): a
                // pending subscription means an upgrade/renewal is mid-payment and must
                // NOT hide jobs that are already published. Genuinely lapsed jobs were
                // already closed by expireOverdue() above, so a 'pending' row here only
                // ever represents in-progress payment, never a lapse.
                $outer->whereDoesntHave('company.subscriptions')
                      ->orWhereHas('company.subscriptions', fn ($s) => $s->whereIn('status', ['active', 'trial', 'pending']));
            });

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $q->where(function ($query) use ($term) {
                $query->where('title', 'like', $term)
                      ->orWhereHas('company', fn ($c) => $c->where('name', 'like', $term));
            });
        }

        if ($request->filled('category')) {
            $q->where('category_id', $request->category);
        }

        if ($request->filled('location')) {
            $q->where('location_id', $request->location);
        }

        if ($request->filled('job_type')) {
            $q->where('job_type', $request->job_type);
        }

        if ($request->filled('experience_level')) {
            $q->where('experience_level', $request->experience_level);
        }

        if ($request->boolean('remote')) {
            $q->where('is_remote', true);
        }

        if ($request->filled('salary_min')) {
            $q->where('salary_max', '>=', $request->salary_min);
        }

        $sortBy = in_array($request->sort, ['created_at', 'salary_max', 'views']) ? $request->sort : 'created_at';
        $q->orderBy('is_featured', 'desc')->orderBy($sortBy, 'desc');

        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        return response()->json($q->paginate($perPage))
            ->header('Cache-Control', 'no-cache, must-revalidate');
    }

    // GET /api/jobs/{id} — public single job; increments view counter
    public function show($id)
    {
        // No subscription gate here — a published job is always viewable via direct link.
        // The index() listing hides jobs from expired companies, but a direct URL should never 404.
        $job = Job::with([
            'company:id,name,logo_url,website,industry,address,is_verified',
            'category:id,name,slug',
            'location:id,name',
        ])->where('status', 'published')
          ->findOrFail($id);

        DB::table('jobs')->where('id', $id)->increment('views');
        $job->views += 1;

        return response()->json($job);
    }

    // POST /api/jobs — employer/recruiter creates a draft job
    public function store(Request $request)
    {
        $this->requirePermission('post_jobs');

        $user    = $request->user();
        $company = $this->resolveCompany($user);

        $data = $request->validate([
            'title'            => 'required|string|max:190',
            'category_id'      => 'nullable|exists:categories,id',
            'location_id'      => 'nullable|exists:locations,id',
            'job_type'         => 'required|in:full_time,part_time,contract,internship,temporary',
            'experience_level' => 'nullable|in:entry,junior,mid,senior,lead,executive,manager',
            'salary_min'       => 'nullable|numeric|min:0',
            'salary_max'       => 'nullable|numeric|min:0',
            'salary_currency'  => 'nullable|string|max:8',
            'salary_period'    => 'nullable|in:hour,day,month,year',
            'is_remote'        => 'boolean',
            'working_days'     => 'nullable|string|max:80',
            'working_time'     => 'nullable|string|max:80',
            'map_location'     => 'nullable|string|max:500',
            'share_social'     => 'boolean',
            'social_image'     => 'nullable|string|max:500',
            'description'      => 'nullable|string|max:20000',
            'requirements'     => 'nullable|string|max:10000',
            'benefits'         => 'nullable|string|max:5000',
            'expires_at'       => 'nullable|date|after:today',
        ]);

        // C-S1: strip unsafe HTML from rich-text fields before storing — these are
        // rendered raw (dangerouslySetInnerHTML) on the public job page.
        foreach (['description', 'requirements', 'benefits'] as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = HtmlSanitizer::clean($data[$field]);
            }
        }

        // Quota is enforced at submit/publish time, not draft creation.
        $data['company_id'] = $company->id;
        $data['slug']       = Job::generateSlug($data['title']);
        $data['status']     = 'draft';
        $data['user_id']    = $user->id;

        // Optional brand-new category typed by the poster → find-or-create (pending admin approval).
        $newCat = trim((string) $request->input('category_name', ''));
        if ($newCat !== '' && empty($data['category_id'])) {
            $data['category_id'] = $this->resolveOrCreateCategory(mb_substr($newCat, 0, 120));
        }

        $job = Job::create($data);

        return response()->json($job->load(['company:id,name', 'category:id,name', 'location:id,name']), 201);
    }

    // POST /api/admin/jobs — admin posts a job on behalf of an employer's company.
    // Publishes immediately (admin override): bypasses the plan/quota gate, but still
    // attaches the company's current active/trial plan when one exists.
    public function adminStore(Request $request)
    {
        $this->requirePermission('approve_jobs');

        $data = $request->validate([
            'company_id'       => 'required|exists:companies,id',
            'title'            => 'required|string|max:190',
            'category_id'      => 'nullable|exists:categories,id',
            'location_id'      => 'nullable|exists:locations,id',
            'job_type'         => 'required|in:full_time,part_time,contract,internship,temporary',
            'experience_level' => 'nullable|in:entry,junior,mid,senior,lead,executive,manager',
            'salary_min'       => 'nullable|numeric|min:0',
            'salary_max'       => 'nullable|numeric|min:0',
            'salary_currency'  => 'nullable|string|max:8',
            'salary_period'    => 'nullable|in:hour,day,month,year',
            'is_remote'        => 'boolean',
            'working_days'     => 'nullable|string|max:80',
            'working_time'     => 'nullable|string|max:80',
            'map_location'     => 'nullable|string|max:500',
            'share_social'     => 'boolean',
            'social_image'     => 'nullable|string|max:500',
            'description'      => 'nullable|string|max:20000',
            'requirements'     => 'nullable|string|max:10000',
            'benefits'         => 'nullable|string|max:5000',
            'expires_at'       => 'nullable|date|after:today',
        ]);

        $company = Company::findOrFail($data['company_id']);

        // Sanitize rich-text fields (rendered raw on the public job page).
        foreach (['description', 'requirements', 'benefits'] as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = HtmlSanitizer::clean($data[$field]);
            }
        }

        // Admin override: publish now regardless of subscription/quota, but attach the
        // company's current active/trial plan if there is one (keeps reporting consistent).
        $sub = Subscription::where('company_id', $company->id)
            ->whereIn('status', ['active', 'trial'])
            ->where(function ($q) { $q->whereNull('renews_at')->orWhere('renews_at', '>', now()); })
            ->orderByDesc('renews_at')
            ->first();

        $data['company_id']      = $company->id;
        $data['user_id']         = $company->user_id ?: $request->user()->id; // attribute to the company owner
        $data['slug']            = Job::generateSlug($data['title']);
        $data['status']          = 'published';
        $data['published_at']    = now();
        $data['subscription_id'] = $sub ? $sub->id : null;

        // Optional brand-new category typed by the admin → find-or-create (pending admin approval).
        $newCat = trim((string) $request->input('category_name', ''));
        if ($newCat !== '' && empty($data['category_id'])) {
            $data['category_id'] = $this->resolveOrCreateCategory(mb_substr($newCat, 0, 120));
        }

        $job = Job::create($data);

        $this->auditLog('job.admin_posted', [
            'job_id'     => $job->id,
            'company_id' => $company->id,
            'by_admin'   => $request->user()->id,
        ]);

        // This path publishes immediately, so it owes the same post-publish fan-out as every
        // other publish route (submit / approve / companyApprove): social share + job-alert
        // and follower emails. It was missing, so admin-posted jobs silently never shared.
        $this->notifyNewlyPublished($job);

        return response()->json($job->load(['company:id,name', 'category:id,name', 'location:id,name']), 201);
    }

    // POST /api/admin/jobs/bulk-import — admin seeds many jobs at once from parsed CSV rows.
    // Rows are resolved by NAME (company/category/location auto-resolve or create), validated
    // per-row, published immediately. Partial success: valid rows are created, bad rows reported.
    public function adminBulkImport(Request $request)
    {
        $this->requirePermission('approve_jobs');

        $rows = $request->input('rows');
        if (! is_array($rows) || count($rows) === 0) {
            return response()->json(['message' => 'No rows to import.'], 422);
        }
        if (count($rows) > 500) {
            return response()->json(['message' => 'Too many rows — import up to 500 at a time.'], 422);
        }

        $adminId   = $request->user()->id;
        $JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'temporary'];
        $EXP       = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive', 'manager'];
        $PERIODS   = ['hour', 'day', 'month', 'year'];

        $companyCache = [];      // lower(name) => id
        $locationCache = null;   // lazy: lower(name) => id
        $results = [];
        $created = $skipped = $failed = 0;

        foreach (array_values($rows) as $i => $row) {
            $line = $i + 1;
            try {
                if (! is_array($row)) { throw new \RuntimeException('Malformed row.'); }
                $title       = trim((string) ($row['title'] ?? ''));
                $companyName = trim((string) ($row['company'] ?? ''));
                if ($title === '' || $companyName === '') {
                    $results[] = ['row' => $line, 'status' => 'error', 'message' => 'Missing required ' . ($title === '' ? 'title' : 'company') . '.'];
                    $failed++;
                    continue;
                }

                // Resolve company by name (find-or-create an approved company owned by the admin).
                $ckey = mb_strtolower($companyName);
                if (! isset($companyCache[$ckey])) {
                    $co = Company::whereRaw('LOWER(name) = ?', [$ckey])->first();
                    if (! $co) {
                        // status isn't in Company's $fillable → forceFill so seeded companies go live.
                        $co = new Company();
                        $co->forceFill(['user_id' => $adminId, 'name' => mb_substr($companyName, 0, 255), 'status' => 'approved'])->save();
                    }
                    $companyCache[$ckey] = $co->id;
                }
                $companyId = $companyCache[$ckey];
                $company   = Company::find($companyId);

                // Skip an exact re-upload (same title already published for this company).
                $dup = Job::where('company_id', $companyId)
                    ->whereRaw('LOWER(title) = ?', [mb_strtolower($title)])
                    ->where('status', 'published')->exists();
                if ($dup) {
                    $results[] = ['row' => $line, 'status' => 'skipped', 'message' => 'Already published for ' . $company->name . '.'];
                    $skipped++;
                    continue;
                }

                // Location by name (else keep the raw text in map_location so it's not lost).
                $locId = null;
                $locName = trim((string) ($row['location'] ?? ''));
                if ($locName !== '') {
                    if ($locationCache === null) {
                        $locationCache = [];
                        foreach (\App\Models\Location::get(['id', 'name']) as $l) {
                            $locationCache[mb_strtolower($l->name)] = $l->id;
                        }
                    }
                    $locId = $locationCache[mb_strtolower($locName)] ?? null;
                }

                // Optional expiry — only honour a future date.
                $expires = null;
                $rawExp = trim((string) ($row['expires_at'] ?? ''));
                if ($rawExp !== '') {
                    try { $d = \Illuminate\Support\Carbon::parse($rawExp); if ($d->isFuture()) $expires = $d->toDateString(); } catch (\Throwable $e) {}
                }

                // Attach the company's active/trial plan if any (keeps reporting consistent, like adminStore).
                $sub = Subscription::where('company_id', $companyId)->whereIn('status', ['active', 'trial'])
                    ->where(fn ($q) => $q->whereNull('renews_at')->orWhere('renews_at', '>', now()))
                    ->orderByDesc('renews_at')->first();

                $job = Job::create([
                    'company_id'       => $companyId,
                    'user_id'          => $company->user_id ?: $adminId,
                    'subscription_id'  => $sub?->id,
                    'category_id'      => $this->resolveOrCreateCategory(trim((string) ($row['category'] ?? ''))),
                    'location_id'      => $locId,
                    'title'            => mb_substr($title, 0, 190),
                    'slug'             => Job::generateSlug($title),
                    'job_type'         => $this->normEnum($row['job_type'] ?? '', $JOB_TYPES, 'full_time', ['fulltime' => 'full_time', 'intern' => 'internship', 'freelance' => 'contract']),
                    'experience_level' => $this->normEnum($row['experience_level'] ?? '', $EXP, null, ['entry_level' => 'entry', 'mid_level' => 'mid']),
                    'salary_min'       => $this->numOrNull($row['salary_min'] ?? null),
                    'salary_max'       => $this->numOrNull($row['salary_max'] ?? null),
                    'salary_currency'  => mb_substr(strtoupper(trim((string) ($row['salary_currency'] ?? ''))) ?: 'USD', 0, 3),
                    'salary_period'    => $this->normEnum($row['salary_period'] ?? '', $PERIODS, 'month'),
                    'is_remote'        => $this->truthy($row['is_remote'] ?? ''),
                    'description'      => $this->richTextFromCsv($row['description'] ?? ''),
                    'requirements'     => $this->richTextFromCsv($row['requirements'] ?? ''),
                    'benefits'         => $this->richTextFromCsv($row['benefits'] ?? ''),
                    'map_location'     => ($locId === null && $locName !== '') ? mb_substr($locName, 0, 500) : null,
                    'status'           => 'published',
                    'published_at'     => now(),
                    'expires_at'       => $expires,
                ]);

                $created++;
                $results[] = ['row' => $line, 'status' => 'created', 'job_id' => $job->id, 'title' => $job->title, 'company' => $company->name];
            } catch (\Throwable $e) {
                $failed++;
                $results[] = ['row' => $line, 'status' => 'error', 'message' => mb_substr($e->getMessage(), 0, 180)];
            }
        }

        $this->auditLog('job.bulk_import', ['by_admin' => $adminId, 'created' => $created, 'skipped' => $skipped, 'failed' => $failed]);

        return response()->json(['created' => $created, 'skipped' => $skipped, 'failed' => $failed, 'results' => $results]);
    }

    // POST /api/admin/jobs/ai-draft — admin drafts a job description/requirements/benefits from a title.
    public function aiDraft(Request $request)
    {
        $this->requirePermission('approve_jobs');
        return $this->runAiDraft($request);
    }

    // POST /api/jobs/ai-draft — employer drafts their own job posting from a title.
    public function employerAiDraft(Request $request)
    {
        $this->requirePermission('post_jobs');
        return $this->runAiDraft($request);
    }

    private function runAiDraft(Request $request)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:190',
            'company'          => 'nullable|string|max:190',
            'job_type'         => 'nullable|string|max:40',
            'experience_level' => 'nullable|string|max:40',
            'location'         => 'nullable|string|max:120',
            'notes'            => 'nullable|string|max:2000',
        ]);

        try {
            return response()->json(\App\Services\JobDraftService::draft($data));
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /** Normalize a loose CSV enum value ("Full-time" → "full_time"); fall back to $default. */
    private function normEnum($v, array $allowed, $default, array $aliases = [])
    {
        $v = str_replace([' ', '-'], '_', mb_strtolower(trim((string) $v)));
        if ($v === '') return $default;
        if (isset($aliases[$v])) return $aliases[$v];
        return in_array($v, $allowed, true) ? $v : $default;
    }

    private function truthy($v): bool
    {
        return in_array(mb_strtolower(trim((string) $v)), ['1', 'true', 'yes', 'y', 'remote', 'on'], true);
    }

    private function numOrNull($v)
    {
        if ($v === null) return null;
        $v = preg_replace('/[^0-9.]/', '', (string) $v);
        return $v === '' ? null : (float) $v;
    }

    /** CSV cells are plain text → wrap into safe paragraphs; pass through + sanitize real HTML. */
    private function richTextFromCsv($v): ?string
    {
        $v = trim((string) $v);
        if ($v === '') return null;
        if (preg_match('/<[a-z][\s\S]*>/i', $v)) {
            return HtmlSanitizer::clean($v);
        }
        $paras = array_filter(preg_split('/\n\s*\n/', $v), fn ($p) => trim($p) !== '');
        $html  = implode('', array_map(fn ($p) => '<p>' . nl2br(e(trim($p))) . '</p>', $paras));
        return HtmlSanitizer::clean($html);
    }

    // PUT /api/jobs/{id} — employer updates their own draft/pending job
    public function update(Request $request, $id)
    {
        $this->requirePermission('post_jobs');

        $job = $this->ownJob($request->user(), $id);

        if (! in_array($job->status, ['draft', 'pending', 'company_pending', 'rejected'])) {
            return response()->json(['message' => 'Only draft, pending, or rejected jobs can be edited.'], 422);
        }

        $data = $request->validate([
            'title'            => 'sometimes|string|max:190',
            'category_id'      => 'nullable|exists:categories,id',
            'location_id'      => 'nullable|exists:locations,id',
            'job_type'         => 'sometimes|in:full_time,part_time,contract,internship,temporary',
            'experience_level' => 'nullable|in:entry,junior,mid,senior,lead,executive,manager',
            'salary_min'       => 'nullable|numeric|min:0',
            'salary_max'       => 'nullable|numeric|min:0',
            'salary_currency'  => 'nullable|string|max:8',
            'salary_period'    => 'nullable|in:hour,day,month,year',
            'is_remote'        => 'boolean',
            'working_days'     => 'nullable|string|max:80',
            'working_time'     => 'nullable|string|max:80',
            'map_location'     => 'nullable|string|max:500',
            'share_social'     => 'boolean',
            'social_image'     => 'nullable|string|max:500',
            'description'      => 'nullable|string|max:20000',
            'requirements'     => 'nullable|string|max:10000',
            'benefits'         => 'nullable|string|max:5000',
            'expires_at'       => 'nullable|date|after:today',
        ]);

        if (isset($data['title'])) {
            $data['slug'] = Job::generateSlug($data['title']);
        }

        // C-S1: strip unsafe HTML from rich-text fields on edit too.
        foreach (['description', 'requirements', 'benefits'] as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = HtmlSanitizer::clean($data[$field]);
            }
        }

        // Reset to draft if re-editing a rejected job
        if ($job->status === 'rejected') {
            $data['status'] = 'draft';
            $data['rejection_reason'] = null;
        }

        // Optional brand-new category typed by the poster → find-or-create (pending admin approval).
        $newCat = trim((string) $request->input('category_name', ''));
        if ($newCat !== '' && empty($data['category_id'])) {
            $data['category_id'] = $this->resolveOrCreateCategory(mb_substr($newCat, 0, 120));
        }

        $job->update($data);

        return response()->json($job->load(['company:id,name', 'category:id,name', 'location:id,name']));
    }

    // DELETE /api/jobs/{id} — employer deletes their own draft job
    public function destroy(Request $request, $id)
    {
        $this->requirePermission('post_jobs');

        $job = $this->ownJob($request->user(), $id);

        if (! in_array($job->status, ['draft', 'rejected', 'closed', 'company_pending'])) {
            return response()->json(['message' => 'Only draft, rejected, or closed jobs can be deleted.'], 422);
        }

        $job->delete();

        return response()->json(['message' => 'Job deleted.']);
    }

    // PATCH /api/jobs/{id}/submit — employer/recruiter submits draft
    // Company admin → auto-published (no platform admin approval)
    // Recruiter → company_pending (company admin must approve)
    public function submit(Request $request, $id)
    {
        $this->requirePermission('post_jobs');

        $user = $request->user();
        $job  = $this->ownJob($user, $id);

        if (! in_array($job->status, ['draft', 'rejected'])) {
            return response()->json(['message' => 'Only draft or rejected jobs can be submitted.'], 422);
        }

        $data = $request->validate([
            'subscription_id' => 'nullable|integer',
        ]);

        $isRecruiter = $user->company_role === 'recruitment';

        if ($isRecruiter) {
            // Recruiter: send for company admin review — no quota check (not publishing yet)
            $job->update(['status' => 'company_pending', 'rejection_reason' => null]);
            return response()->json(['message' => 'Job submitted for company review.', 'status' => 'company_pending']);
        } else {
            // Company admin/owner: publish directly — enforce quota at publish time.
            // Employer may choose a specific plan when several have open slots; otherwise auto-pick.
            $company = $this->resolveCompany($user);
            $subscription = $this->pickSubscription($company, $data['subscription_id'] ?? null);
            $job->update(['status' => 'published', 'published_at' => now(), 'rejection_reason' => null, 'subscription_id' => $subscription->id]);
            $this->notifyNewlyPublished($job);
            return response()->json(['message' => 'Job published.', 'status' => 'published']);
        }
    }

    // PATCH /api/employer/jobs/{id}/approve — company admin approves a recruiter's job
    public function companyApprove(Request $request, $id)
    {
        $this->requirePermission('post_jobs');

        $user    = $request->user();
        $company = $this->resolveCompany($user);

        // Must be company admin (owner or explicit admin role)
        if ($user->company_role === 'recruitment') {
            abort(403, 'Only the company admin can approve jobs.');
        }

        $job = Job::where('company_id', $company->id)
            ->where('status', 'company_pending')
            ->findOrFail($id);

        $data = $request->validate([
            'subscription_id' => 'nullable|integer',
        ]);

        $subscription = $this->pickSubscription($company, $data['subscription_id'] ?? null);

        $job->update(['status' => 'published', 'published_at' => now(), 'subscription_id' => $subscription->id]);

        $this->auditLog('job.company_approved', ['job_id' => $job->id, 'company_id' => $job->company_id]);

        $this->notifyNewlyPublished($job);

        return response()->json(['message' => 'Job approved and published.', 'status' => 'published']);
    }

    // PATCH /api/employer/jobs/{id}/reject — company admin rejects a recruiter's job
    public function companyReject(Request $request, $id)
    {
        $this->requirePermission('post_jobs');

        $user    = $request->user();
        $company = $this->resolveCompany($user);

        if ($user->company_role === 'recruitment') {
            abort(403, 'Only the company admin can reject jobs.');
        }

        $data = $request->validate(['reason' => 'required|string|max:255']);

        $job = Job::where('company_id', $company->id)
            ->where('status', 'company_pending')
            ->findOrFail($id);

        $job->update(['status' => 'rejected', 'rejection_reason' => $data['reason']]);

        $this->auditLog('job.company_rejected', ['job_id' => $job->id, 'company_id' => $job->company_id]);

        return response()->json(['message' => 'Job rejected.', 'status' => 'rejected']);
    }

    // PATCH /api/jobs/{id}/approve — admin takes down or reviews jobs (platform moderation)
    public function approve(Request $request, $id)
    {
        $this->requirePermission('approve_jobs');

        $job = Job::whereIn('status', ['pending', 'company_pending'])->findOrFail($id);

        // Attribute the job to the company's primary (latest active/trial) subscription so it
        // counts toward quota accounting and is auto-closed if that plan later expires — the
        // other publish paths (submit/companyApprove) already set this. Admin override: publish
        // even if the plan is over its job-post limit (no quota block here), and never clobber a
        // subscription_id that was already assigned.
        $company    = $job->company;
        $primarySub = $company ? $this->primaryActiveSubscription($company) : null;

        $job->update([
            'status'          => 'published',
            'published_at'    => now(),
            'subscription_id' => $job->subscription_id ?? ($primarySub ? $primarySub->id : null),
        ]);

        $this->auditLog('job.admin_approved', ['job_id' => $job->id, 'job_title' => $job->title, 'company_id' => $job->company_id]);

        Notification::record($job->company->user_id ?? null, 'job_approved', 'Job approved', 'Your job “' . $job->title . '” is now published.');

        try {
            if (MailConfig::isConfigured()) {
                $job->load('company.owner:id,name,email');
                $employer = $job->company->owner ?? null;
                if ($employer) {
                    MailConfig::applyFromDb();
                    [$subject, $html] = EmailTemplates::jobApproved($employer->name, $job->title);
                    Mail::html($html, fn ($m) => $m->to($employer->email, $employer->name)->subject($subject));
                }
            }
        } catch (\Exception $e) {
            Log::warning('Job approved email failed: ' . $e->getMessage());
        }

        $this->notifyNewlyPublished($job);

        return response()->json(['message' => 'Job published.', 'status' => 'published']);
    }

    // Fire job-alert + company-follower emails after a job becomes published.
    // Non-blocking: each sender is SMTP-gated and swallows its own errors so a
    // mail failure never breaks the publish request. Called from every publish
    // path (admin approve, employer direct-publish, and company approval).
    private function notifyNewlyPublished(Job $job): void
    {
        // Fan-out (social share + job-alert emails + follower emails) runs on the QUEUE via
        // NotifyJobPublished, processed by the scheduled `queue:work`. Dispatching just inserts
        // one queue row, so the publish request returns immediately and the heavy blocking
        // SMTP/social work never holds a web worker. (Was an app()->terminating() callback that
        // still occupied the worker for the full duration — see NotifyJobPublished.)
        \App\Jobs\NotifyJobPublished::dispatch($job->id);
    }

    // PATCH /api/jobs/{id}/reject — admin rejects/takes down a job (platform moderation)
    public function reject(Request $request, $id)
    {
        $this->requirePermission('approve_jobs');

        $data = $request->validate(['reason' => 'required|string|max:255']);

        $job = Job::whereIn('status', ['pending', 'company_pending', 'published'])->findOrFail($id);
        $job->update(['status' => 'rejected', 'rejection_reason' => $data['reason'], 'published_at' => null]);

        $this->auditLog('job.admin_rejected', ['job_id' => $job->id, 'job_title' => $job->title, 'company_id' => $job->company_id, 'reason' => $data['reason']]);

        Notification::record($job->company->user_id ?? null, 'job_rejected', 'Job rejected', 'Your job “' . $job->title . '” was rejected: ' . $data['reason']);

        try {
            if (MailConfig::isConfigured()) {
                $job->load('company.owner:id,name,email');
                $employer = $job->company->owner ?? null;
                if ($employer) {
                    MailConfig::applyFromDb();
                    [$subject, $html] = EmailTemplates::jobRejected($employer->name, $job->title, $data['reason']);
                    Mail::html($html, fn ($m) => $m->to($employer->email, $employer->name)->subject($subject));
                }
            }
        } catch (\Exception $e) {
            Log::warning('Job rejected email failed: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Job rejected.', 'status' => 'rejected']);
    }

    // PATCH /api/jobs/{id}/close — employer closes their published job
    public function close(Request $request, $id)
    {
        $this->requirePermission('post_jobs');

        $job = $this->ownJob($request->user(), $id);
        $job->update(['status' => 'closed']);

        return response()->json(['message' => 'Job closed.', 'status' => 'closed']);
    }

    // GET /api/employer/jobs — company's job listing (all statuses)
    // Includes recruiter info for company admin
    public function myJobs(Request $request)
    {
        $this->requirePermission('post_jobs');

        $user    = $request->user();
        $company = $this->resolveCompany($user);

        $q = Job::with(['category:id,name', 'location:id,name', 'poster:id,name,email,company_role'])
            ->withCount('applications')
            ->where('company_id', $company->id);

        // Recruiters only see their own jobs
        if ($user->company_role === 'recruitment') {
            $q->where('user_id', $user->id);
        }

        $jobs = $q->orderBy('created_at', 'desc')
            ->paginate(min(100, max(1, (int) $request->input('per_page', 20))));

        return response()->json($jobs);
    }

    // GET /api/admin/jobs — admin listing, any status, with filters
    public function adminIndex(Request $request)
    {
        $this->requirePermission('approve_jobs');

        $q = Job::with(['company:id,name,logo_url,is_verified', 'category:id,name,slug', 'location:id,name']);

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $q->where(function ($query) use ($term) {
                $query->where('title', 'like', $term)
                      ->orWhereHas('company', fn ($c) => $c->where('name', 'like', $term));
            });
        }

        $q->orderBy('created_at', 'desc');

        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));

        return response()->json($q->paginate($perPage));
    }

    // PATCH /api/admin/jobs/{id}/feature — admin toggles featured flag
    public function toggleFeatured(Request $request, $id)
    {
        $this->requirePermission('approve_jobs');

        $job = Job::findOrFail($id);
        $job->update(['is_featured' => ! $job->is_featured]);

        $this->auditLog('job.feature_toggled', [
            'job_id'      => $job->id,
            'job_title'   => $job->title,
            'is_featured' => $job->is_featured,
        ]);

        return response()->json([
            'message'     => $job->is_featured ? 'Job marked as featured.' : 'Job unfeatured.',
            'is_featured' => $job->is_featured,
        ]);
    }

    // GET /api/employer/jobs/{id}/boost — quote for featuring this job
    public function boostQuote(Request $request, $id)
    {
        $this->requirePermission('post_jobs');
        $user    = $request->user();
        $job     = $this->ownJob($user, $id);
        $company = $this->resolveCompany($user);

        [$price, $currency, $days] = $this->featuredBoostConfig();
        $remaining  = $this->featuredCreditsForCompany($company);
        $activeUntil = ($job->is_featured && $job->featured_until && $job->featured_until->isFuture())
            ? $job->featured_until : null;

        return response()->json([
            'already_featured'  => (bool) $activeUntil,
            'featured_until'    => $activeUntil,
            'credits_remaining' => $remaining,
            'boost_price'       => $price,
            'boost_currency'    => $currency,
            'boost_days'        => $days,
        ]);
    }

    // POST /api/employer/jobs/{id}/boost — feature a job: spend a plan credit if any, else start a paid boost
    public function boost(Request $request, $id)
    {
        $this->requirePermission('post_jobs');
        $user    = $request->user();
        $job     = $this->ownJob($user, $id);
        $company = $this->resolveCompany($user);

        if ($job->status !== 'published') {
            return response()->json(['message' => 'Only published jobs can be featured.'], 422);
        }
        if ($job->is_featured && $job->featured_until && $job->featured_until->isFuture()) {
            return response()->json(['message' => 'This job is already featured until ' . $job->featured_until->toDateString() . '.'], 422);
        }

        [$price, $currency, $days] = $this->featuredBoostConfig();
        $remaining = $this->featuredCreditsForCompany($company);

        // 1) Free path — spend an included credit from a plan that still has one
        if ($remaining > 0) {
            $creditSub = $this->subscriptionWithFeaturedCredit($company);
            if ($creditSub) {
                DB::transaction(function () use ($creditSub, $job, $days) {
                    $creditSub->increment('featured_credits_used');
                    $job->update(['is_featured' => true, 'featured_until' => now()->addDays((int) $days)]);
                });

                return response()->json([
                    'featured'          => true,
                    'via'               => 'credit',
                    'featured_until'    => $job->fresh()->featured_until,
                    'credits_remaining' => max(0, $remaining - 1),
                    'message'           => 'Job featured for ' . $days . ' days using an included credit.',
                ]);
            }
        }

        // 2) Paid path — create a pending payment; the job features once payment is confirmed.
        // Attribute the payment to the company's primary (latest active/trial) subscription.
        $sub  = $this->primaryActiveSubscription($company);
        $data = $request->validate([
            'method'   => 'nullable|in:stripe,aba,acleda,wing,khqr,cod,card,other',
            'currency' => 'sometimes|in:USD,KHR',
        ]);

        // Billing currency — the boost may be paid in USD (default) or Khmer Riel. Mirrors
        // PaymentController::subscribe(): KHR converts the price at the snapshotted NBC rate, and
        // every gateway reads payment.amount+currency, so a KHR boost is a genuine riel transaction
        // (ABA/Bakong settle it to the KHR account). Only convert from a USD base price — if an admin
        // has configured boost_currency=KHR the price is already riel and must not be re-converted.
        $fxRate = null;
        if (($data['currency'] ?? 'USD') === 'KHR' && strtoupper((string) $currency) === 'USD' && $price > 0) {
            $manual   = (float) (Setting::where('group', 'tax')->where('key', 'exchange_rate_khr')->value('value') ?: 0);
            $fxRate   = round(\App\Services\ExchangeRateService::usdToKhr($manual > 0 ? $manual : null), 4);
            $price    = round($price * $fxRate); // whole riel — the riel has no minor unit
            $currency = 'KHR';
        }

        // M-5: generate the invoice number and insert the payment in one transaction
        // so nextBoostInvoiceNo()'s lockForUpdate is actually effective (a lock held
        // outside a transaction is released immediately, letting concurrent boosts mint
        // duplicate invoice numbers). Mirrors the subscribe flow in PaymentController.
        $payment = null;
        DB::transaction(function () use ($company, $sub, $job, $price, $currency, $fxRate, $data, &$payment) {
            $payment = Payment::create([
                'company_id'      => $company->id,
                'subscription_id' => $sub ? $sub->id : null,
                'purpose'         => 'featured_boost',
                'job_id'          => $job->id,
                'invoice_no'      => $this->nextBoostInvoiceNo(),
                'amount'          => $price,
                'currency'        => $currency,
                'fx_rate'         => $fxRate,
                'method'          => $data['method'] ?? 'khqr',
                'status'          => 'pending',
                'created_at'      => now(),
            ]);
        });

        Notification::recordAdmins('payment_pending', 'New payment pending', 'Featured-boost payment ' . $currency . number_format((float) $price, 2) . ' from “' . ($company->name ?? 'a company') . '” is awaiting confirmation.');

        return response()->json([
            'requires_payment' => true,
            'payment'          => $payment,
            'boost_price'      => $price,
            'boost_currency'   => $currency,
            'boost_days'       => $days,
            'message'          => 'Payment pending. The job will be featured once payment is confirmed.',
        ], 201);
    }

    // ---- Featured-boost helpers -------------------------------------------

    private function featuredBoostConfig(): array
    {
        $s = Setting::where('group', 'featured')->pluck('value', 'key');
        return [
            (float) ($s['boost_price'] ?? 19),
            $s['boost_currency'] ?? 'USD',
            (int) ($s['boost_days'] ?? 30),
        ];
    }

    private function primaryActiveSubscription(Company $company): ?Subscription
    {
        return Subscription::where('company_id', $company->id)
            ->whereIn('status', ['active', 'trial'])
            ->with('plan')
            ->latest('started_at')
            ->first();
    }

    private function featuredCreditsRemaining(?Subscription $sub): int
    {
        if (! $sub || ! $sub->plan) return 0;
        $total = (int) ($sub->plan->featured_credits ?? 0);
        return max(0, $total - (int) $sub->featured_credits_used);
    }

    // Active/trial subscriptions, soonest-expiring first (never-expiring last), ties by cheapest
    // plan — the same order job slots are consumed in, so short-lived allocations are used first.
    private function activeSubscriptions(Company $company)
    {
        return Subscription::where('company_id', $company->id)
            ->whereIn('status', ['active', 'trial'])
            ->with('plan')
            ->get()
            ->sort(function ($a, $b) {
                $ax = $a->renews_at ? $a->renews_at->timestamp : PHP_INT_MAX;
                $bx = $b->renews_at ? $b->renews_at->timestamp : PHP_INT_MAX;
                if ($ax !== $bx) return $ax <=> $bx;
                $ap = $a->plan ? (float) $a->plan->price : PHP_INT_MAX;
                $bp = $b->plan ? (float) $b->plan->price : PHP_INT_MAX;
                return $ap <=> $bp;
            })
            ->values();
    }

    // Total featured credits still available across ALL the company's active/trial plans
    // (not just the primary one), matching how job slots are pooled across subscriptions.
    private function featuredCreditsForCompany(Company $company): int
    {
        return (int) $this->activeSubscriptions($company)
            ->sum(fn ($s) => $this->featuredCreditsRemaining($s));
    }

    // The subscription a featured credit should be spent from: soonest-expiring one that still
    // has a credit left, or null if none do.
    private function subscriptionWithFeaturedCredit(Company $company): ?Subscription
    {
        return $this->activeSubscriptions($company)
            ->first(fn ($s) => $this->featuredCreditsRemaining($s) > 0);
    }

    private function nextBoostInvoiceNo(): string
    {
        $year   = date('Y');
        $result = Payment::lockForUpdate()
            ->where('invoice_no', 'like', "INV-$year-%")
            ->selectRaw("MAX(CAST(SUBSTRING(invoice_no, -4) AS UNSIGNED)) as max_seq")
            ->first();
        $seq = (int) ($result->max_seq ?? 0) + 1;
        return sprintf('INV-%s-%04d', $year, $seq);
    }

    // ----------------------------------------------------------------
    //  Helpers
    // ----------------------------------------------------------------

    // Resolve company for both company owners and recruiters
    private function resolveCompany($user): Company
    {
        // Company owner
        $company = Company::where('user_id', $user->id)->first();
        if ($company) return $company;

        // Recruiter linked via company_id
        if ($user->company_id) {
            $company = Company::find($user->company_id);
            if ($company) return $company;
        }

        abort(422, 'No company profile found. Create a company first.');
    }

    // Find an existing category by (case-insensitive) name, or create a new one as
    // 'inactive' — pending admin approval: it is assigned to the job right away but stays
    // hidden from the public category list/filters until an admin activates it. Returns
    // the category id (existing or new), or null for a blank name.
    private function resolveOrCreateCategory(?string $name): ?int
    {
        $name = trim((string) $name);
        if ($name === '') return null;

        $existing = \App\Models\Category::whereRaw('LOWER(name) = ?', [mb_strtolower($name)])->first();
        if ($existing) return $existing->id;

        $base = \Illuminate\Support\Str::slug($name) ?: 'category';
        $slug = $base;
        $n = 1;
        while (\App\Models\Category::where('slug', $slug)->exists()) { $slug = $base . '-' . (++$n); }

        $cat = \App\Models\Category::create(['name' => $name, 'slug' => $slug, 'status' => 'inactive']);
        return $cat->id;
    }

    // Legacy alias kept for callers that haven't been updated
    private function employerCompany($user): Company
    {
        return $this->resolveCompany($user);
    }

    private function ownJob($user, $id): Job
    {
        $company = $this->resolveCompany($user);
        $job = Job::where('company_id', $company->id)->findOrFail($id);
        return $job;
    }

    // Resolve which subscription a job publishes under. When the employer explicitly
    // chose one (multiple plans had open slots), validate and use it; otherwise auto-pick.
    private function pickSubscription(Company $company, $subscriptionId = null): Subscription
    {
        if (! $subscriptionId) {
            return $this->enforceJobPostLimit($company);
        }

        $sub = Subscription::where('company_id', $company->id)
            ->whereIn('status', ['active', 'trial'])
            ->with('plan')
            ->find($subscriptionId);

        if (! $sub) {
            abort(422, 'The selected plan is not available. Please choose another.');
        }

        if ($sub->renews_at && $sub->renews_at->isPast()) {
            abort(422, 'The selected plan has expired. Please choose another.');
        }

        $limit = $sub->job_post_limit ?? ($sub->plan ? $sub->plan->job_post_limit : null);
        if ($limit !== null) {
            $used = Job::where('company_id', $company->id)
                ->where('subscription_id', $sub->id)
                ->where('status', 'published')
                ->count();
            if ($used >= $limit) {
                abort(422, 'The selected plan has no remaining job slots. Please choose another.');
            }
        }

        return $sub;
    }

    private function enforceJobPostLimit(Company $company): Subscription
    {
        // Auto-expire subscriptions whose renewal date has passed and close their jobs.
        $expiredIds = Subscription::where('company_id', $company->id)
            ->whereIn('status', ['active', 'trial'])
            ->whereNotNull('renews_at')
            ->where('renews_at', '<', now())
            ->pluck('id');

        if ($expiredIds->isNotEmpty()) {
            // Close published jobs that belong to the expiring subscriptions
            Job::whereIn('subscription_id', $expiredIds)
                ->where('status', 'published')
                ->update(['status' => 'closed']);
            Subscription::whereIn('id', $expiredIds)->update(['status' => 'expired']);
        }

        // All usable subscriptions, soonest-expiring first so short-lived /
        // admin-assigned allocations are consumed before they lapse. Never-expiring
        // plans sort last; ties break by cheapest price.
        $subscriptions = Subscription::where('company_id', $company->id)
            ->whereIn('status', ['active', 'trial'])
            ->with('plan')
            ->get()
            ->sort(function ($a, $b) {
                $ax = $a->renews_at ? $a->renews_at->timestamp : PHP_INT_MAX;
                $bx = $b->renews_at ? $b->renews_at->timestamp : PHP_INT_MAX;
                if ($ax !== $bx) return $ax <=> $bx;
                $ap = $a->plan ? (float) $a->plan->price : PHP_INT_MAX;
                $bp = $b->plan ? (float) $b->plan->price : PHP_INT_MAX;
                return $ap <=> $bp;
            })
            ->values();

        // No active/trial plan — block posting
        if ($subscriptions->isEmpty()) {
            abort(422, 'An active subscription plan is required to post jobs. Please subscribe to a plan first.');
        }

        // Publish under the first (cheapest/free) subscription that still has an open slot.
        foreach ($subscriptions as $sub) {
            // Subscription-level override takes priority over plan's default limit
            $limit = $sub->job_post_limit ?? ($sub->plan ? $sub->plan->job_post_limit : null);

            // Unlimited — allow
            if ($limit === null) {
                return $sub;
            }

            // Count only published jobs under THIS subscription — each subscription gets its own fresh quota.
            $publishedCount = Job::where('company_id', $company->id)
                ->where('subscription_id', $sub->id)
                ->where('status', 'published')
                ->count();

            if ($publishedCount < $limit) {
                return $sub;
            }
        }

        abort(422, 'Job post limit reached across all your active plans. Close a job to free a slot, or upgrade to post more.');
    }

    // Notify all candidates who follow the job's company.
    // (sendFollowerEmails + sendJobAlertEmails moved to App\Jobs\NotifyJobPublished so the
    //  fan-out runs on the queue instead of holding a web worker — see notifyNewlyPublished.)
}
