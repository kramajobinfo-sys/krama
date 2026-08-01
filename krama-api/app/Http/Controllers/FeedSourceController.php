<?php

namespace App\Http\Controllers;

use App\Models\ExternalCompany;
use App\Models\ExternalJob;
use App\Models\FeedSource;
use App\Services\FeedImportService;
use Illuminate\Http\Request;

class FeedSourceController extends Controller
{
    // GET /api/admin/feed-sources — list all feeds + their active-item counts
    public function index(Request $request)
    {
        $this->requirePermission('site_settings');

        $sources = FeedSource::orderBy('name')->get()->map(function ($s) {
            $arr = $s->toArray();
            $arr['active_items'] = ($s->kind === 'companies' ? ExternalCompany::query() : ExternalJob::query())
                ->where('feed_source_id', $s->id)->where('is_active', true)->count();
            return $arr;
        });

        return response()->json($sources);
    }

    // POST /api/admin/feed-sources
    public function store(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'name'    => 'required|string|max:120',
            'url'     => 'required|url|max:1000',
            'kind'    => 'required|in:jobs,companies',
            'format'  => 'required|in:rss,atom,jsonld,json',
            'enabled' => 'sometimes|boolean',
        ]);

        $source = FeedSource::create($data);
        $this->auditLog('feed_source.created', ['id' => $source->id, 'name' => $source->name, 'url' => $source->url]);

        return response()->json($source, 201);
    }

    // PUT /api/admin/feed-sources/{id}
    public function update(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $source = FeedSource::findOrFail($id);
        $data = $request->validate([
            'name'    => 'sometimes|string|max:120',
            'url'     => 'sometimes|url|max:1000',
            'kind'    => 'sometimes|in:jobs,companies',
            'format'  => 'sometimes|in:rss,atom,jsonld,json',
            'enabled' => 'sometimes|boolean',
        ]);

        $source->update($data);
        $this->auditLog('feed_source.updated', ['id' => $source->id, 'changes' => array_keys($data)]);

        return response()->json($source->fresh());
    }

    // DELETE /api/admin/feed-sources/{id} — FK cascade removes its external_* rows
    public function destroy(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $source = FeedSource::findOrFail($id);
        $this->auditLog('feed_source.deleted', ['id' => $source->id, 'name' => $source->name]);
        $source->delete();

        return response()->json(['message' => 'Feed source deleted.']);
    }

    // GET /api/external-jobs — PUBLIC: active aggregated job listings (link back to source)
    public function publicJobs()
    {
        $jobs = ExternalJob::where('is_active', true)
            ->orderByRaw('posted_at IS NULL, posted_at DESC')
            ->limit(300)
            ->get(['id', 'source_name', 'apply_url', 'title', 'company_name', 'location_text', 'job_type', 'salary_text', 'description_excerpt', 'posted_at']);

        return response()->json($jobs);
    }

    // GET /api/external-companies — PUBLIC: active aggregated company profiles
    public function publicCompanies()
    {
        $companies = ExternalCompany::where('is_active', true)
            ->orderBy('name')
            ->limit(300)
            ->get(['id', 'source_name', 'profile_url', 'name', 'logo_url', 'industry', 'location_text', 'website', 'description_excerpt']);

        return response()->json($companies);
    }

    // POST /api/admin/feed-sources/{id}/run — fetch + import this feed now (synchronous)
    public function run(Request $request, $id, FeedImportService $service)
    {
        $this->requirePermission('site_settings');

        $source = FeedSource::findOrFail($id);
        $result = $service->import($source);
        $this->auditLog('feed_source.run', ['id' => $source->id, 'ok' => $result['ok'], 'imported' => $result['imported']]);

        return response()->json(['source' => $source->fresh(), 'result' => $result]);
    }
}
