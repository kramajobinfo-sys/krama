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
                // Show jobs from companies with no subscription (free tier)
                // or with at least one active/trial subscription
                $outer->whereDoesntHave('company.subscriptions')
                      ->orWhereHas('company.subscriptions', fn ($s) => $s->whereIn('status', ['active', 'trial']));
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

        $perPage = min(50, max(1, (int) $request->input('per_page', 20)));

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
            'share_social'     => 'boolean',
            'description'      => 'nullable|string|max:20000',
            'requirements'     => 'nullable|string|max:10000',
            'benefits'         => 'nullable|string|max:5000',
            'expires_at'       => 'nullable|date|after:today',
        ]);

        // Quota is enforced at submit/publish time, not draft creation.
        $data['company_id'] = $company->id;
        $data['slug']       = Job::generateSlug($data['title']);
        $data['status']     = 'draft';
        $data['user_id']    = $user->id;

        $job = Job::create($data);

        return response()->json($job->load(['company:id,name', 'category:id,name', 'location:id,name']), 201);
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
            'share_social'     => 'boolean',
            'description'      => 'nullable|string|max:20000',
            'requirements'     => 'nullable|string|max:10000',
            'benefits'         => 'nullable|string|max:5000',
            'expires_at'       => 'nullable|date|after:today',
        ]);

        if (isset($data['title'])) {
            $data['slug'] = Job::generateSlug($data['title']);
        }

        // Reset to draft if re-editing a rejected job
        if ($job->status === 'rejected') {
            $data['status'] = 'draft';
            $data['rejection_reason'] = null;
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
        // Run all post-publish notifications AFTER the HTTP response is sent, so a slow
        // or unreachable SMTP server (or a social API) never blocks — or drops — the
        // publish request. Terminating callbacks run in-process on kernel shutdown, so
        // no queue worker is needed (safe on shared hosting). Social is done first so
        // the job posts to social media promptly even if email delivery is slow.
        app()->terminating(function () use ($job) {
            try {
                \App\Services\SocialPostService::shareJob($job);
            } catch (\Throwable $e) {
                Log::warning('Social post dispatch failed: ' . $e->getMessage());
            }

            try {
                $this->sendJobAlertEmails($job);
            } catch (\Throwable $e) {
                Log::warning('Job alert dispatch failed: ' . $e->getMessage());
            }

            try {
                $this->sendFollowerEmails($job);
            } catch (\Throwable $e) {
                Log::warning('Follower notification dispatch failed: ' . $e->getMessage());
            }
        });
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
        $sub        = $this->primaryActiveSubscription($company);
        $remaining  = $this->featuredCreditsRemaining($sub);
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
        $sub       = $this->primaryActiveSubscription($company);
        $remaining = $this->featuredCreditsRemaining($sub);

        // 1) Free path — spend an included plan credit
        if ($remaining > 0 && $sub) {
            DB::transaction(function () use ($sub, $job, $days) {
                $sub->increment('featured_credits_used');
                $job->update(['is_featured' => true, 'featured_until' => now()->addDays($days)]);
            });

            return response()->json([
                'featured'          => true,
                'via'               => 'credit',
                'featured_until'    => $job->fresh()->featured_until,
                'credits_remaining' => max(0, $remaining - 1),
                'message'           => 'Job featured for ' . $days . ' days using an included credit.',
            ]);
        }

        // 2) Paid path — create a pending payment; the job features once payment is confirmed
        $data = $request->validate([
            'method' => 'nullable|in:stripe,aba,acleda,wing,khqr,cod,card,other',
        ]);

        $payment = Payment::create([
            'company_id'      => $company->id,
            'subscription_id' => $sub ? $sub->id : null,
            'purpose'         => 'featured_boost',
            'job_id'          => $job->id,
            'invoice_no'      => $this->nextBoostInvoiceNo(),
            'amount'          => $price,
            'currency'        => $currency,
            'method'          => $data['method'] ?? 'khqr',
            'status'          => 'pending',
            'created_at'      => now(),
        ]);

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
    private function sendFollowerEmails(Job $job): void
    {
        if (!MailConfig::isConfigured()) return;

        $job->loadMissing(['company:id,name', 'location:id,name']);

        $followers = DB::table('company_followers')
            ->join('users', 'users.id', '=', 'company_followers.candidate_id')
            ->where('company_followers.company_id', $job->company_id)
            ->select('users.id', 'users.name', 'users.email')
            ->get();

        if ($followers->isEmpty()) return;

        MailConfig::applyFromDb();

        $jobUrl       = config('app.url') . '/jobs/' . $job->id;
        $locationName = $job->location->name ?? '';
        $jobType      = $job->job_type ?? 'full_time';
        $companyName  = $job->company->name ?? '';

        foreach ($followers as $candidate) {
            if (!$candidate->email) continue;
            try {
                [$subject, $html] = EmailTemplates::newJobFromFollowedCompany(
                    $candidate->name,
                    $companyName,
                    $job->title,
                    $locationName,
                    $jobType,
                    $jobUrl
                );
                Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
            } catch (\Exception $e) {
                Log::warning("Follower email failed for candidate {$candidate->id}: " . $e->getMessage());
            }
        }
    }

    // Send email to every candidate whose job alert matches the newly published job.
    private function sendJobAlertEmails(Job $job): void
    {
        if (!MailConfig::isConfigured()) return;

        $job->loadMissing(['category:id,name', 'location:id,name', 'company:id,name']);

        $alerts = JobAlert::with('candidate:id,name,email')
            ->where(function ($q) use ($job) {
                $q->whereNull('category_id')->orWhere('category_id', $job->category_id);
            })
            ->where(function ($q) use ($job) {
                $q->whereNull('location_id')->orWhere('location_id', $job->location_id);
            })
            ->where(function ($q) use ($job) {
                $q->whereNull('job_type')->orWhere('job_type', $job->job_type);
            })
            ->where(function ($q) use ($job) {
                $q->whereNull('is_remote')->orWhere('is_remote', $job->is_remote);
            })
            ->where(function ($q) use ($job) {
                $q->whereNull('keyword')
                  ->orWhereRaw('LOWER(?) LIKE CONCAT(\'%\', LOWER(keyword), \'%\')', [$job->title]);
            })
            ->get();

        if ($alerts->isEmpty()) return;

        MailConfig::applyFromDb();

        $jobUrl = config('app.url') . '/jobs/' . $job->id;
        $locationName = $job->location->name ?? '';
        $jobType = $job->job_type ?? 'full_time';
        $companyName = $job->company->name ?? '';

        // Deduplicate by candidate so a candidate with multiple matching alerts gets one email
        $seen = [];
        foreach ($alerts as $alert) {
            $candidate = $alert->candidate;
            if (!$candidate || !$candidate->email || isset($seen[$candidate->id])) continue;
            $seen[$candidate->id] = true;

            try {
                [$subject, $html] = EmailTemplates::jobAlertMatch(
                    $candidate->name,
                    $job->title,
                    $companyName,
                    $locationName,
                    $jobType,
                    $jobUrl
                );
                Mail::html($html, fn ($m) => $m->to($candidate->email, $candidate->name)->subject($subject));
            } catch (\Exception $e) {
                Log::warning("Job alert email failed for candidate {$candidate->id}: " . $e->getMessage());
            }
        }
    }
}
