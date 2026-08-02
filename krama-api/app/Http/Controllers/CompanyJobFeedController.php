<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CompanyJobFeed;
use App\Services\CompanyJobFeedService;
use Illuminate\Http\Request;

/**
 * Employer-facing: connect the company's OWN careers/ATS feed and sync it into
 * native draft jobs. One feed per company. Config + sync are employer actions;
 * imported jobs are drafts the employer reviews and publishes (quota enforced there).
 */
class CompanyJobFeedController extends Controller
{
    // GET /api/employer/job-feed
    public function show(Request $request)
    {
        $this->requirePermission('post_jobs');
        $company = $this->company($request->user());
        $feed = CompanyJobFeed::where('company_id', $company->id)->first();

        return response()->json(['feed' => $feed ? $this->present($feed) : null]);
    }

    // PUT /api/employer/job-feed — create or update the connection.
    public function save(Request $request)
    {
        $this->requirePermission('post_jobs');
        $company = $this->company($request->user());

        $data = $request->validate([
            'url'     => 'required|url|max:1000',
            'format'  => 'required|in:rss,atom,json',
            'enabled' => 'boolean',
        ]);

        $feed = CompanyJobFeed::updateOrCreate(
            ['company_id' => $company->id],
            ['url' => $data['url'], 'format' => $data['format'], 'enabled' => $request->boolean('enabled', true)]
        );

        return response()->json(['feed' => $this->present($feed)]);
    }

    // POST /api/employer/job-feed/sync — pull the feed now (into native drafts).
    public function sync(Request $request)
    {
        $this->requirePermission('post_jobs');
        $company = $this->company($request->user());
        $feed = CompanyJobFeed::where('company_id', $company->id)->first();
        abort_if(! $feed, 422, 'Connect a feed URL first.');

        $result = CompanyJobFeedService::sync($feed);

        return response()->json(['result' => $result, 'feed' => $this->present($feed->fresh())]);
    }

    // DELETE /api/employer/job-feed — disconnect (imported jobs are kept).
    public function destroy(Request $request)
    {
        $this->requirePermission('post_jobs');
        $company = $this->company($request->user());
        CompanyJobFeed::where('company_id', $company->id)->delete();

        return response()->json(['ok' => true]);
    }

    private function present(CompanyJobFeed $f): array
    {
        return [
            'id'             => $f->id,
            'url'            => $f->url,
            'format'         => $f->format,
            'enabled'        => (bool) $f->enabled,
            'last_synced_at' => optional($f->last_synced_at)->toIso8601String(),
            'last_status'    => $f->last_status,
            'last_error'     => $f->last_error,
            'imported_count' => (int) $f->imported_count,
        ];
    }

    private function company($user): Company
    {
        $company = Company::where('user_id', $user->id)->first();
        if ($company) return $company;
        if ($user->company_id) {
            $company = Company::find($user->company_id);
            if ($company) return $company;
        }
        abort(422, 'No company profile found. Create a company first.');
    }
}
