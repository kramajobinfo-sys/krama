<?php

namespace App\Http\Controllers;

use App\Models\ExperienceLevel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ExperienceLevelController extends Controller
{
    // GET /api/experience-levels — public, active only
    public function index()
    {
        $data = Cache::remember('public.experience_levels', 21600, fn () =>
            ExperienceLevel::where('status', 'active')->orderBy('sort_order')->orderBy('name')->get()
        );

        return response()->json($data)
            ->header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    }

    // GET /api/admin/experience-levels — all
    public function adminIndex(Request $request)
    {
        $this->requirePermission('site_settings');

        return response()->json(
            ExperienceLevel::orderBy('sort_order')->orderBy('name')->get()
        );
    }

    // POST /api/admin/experience-levels
    public function store(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'name'       => 'required|string|max:80|unique:experience_levels,name',
            'slug'       => 'nullable|string|max:80|unique:experience_levels,slug',
            'sort_order' => 'nullable|integer|min:0',
            'status'     => 'nullable|in:active,inactive',
        ]);

        $data['slug']       = $data['slug'] ?? Str::slug($data['name']);
        $data['status']     = $data['status'] ?? 'active';
        $data['sort_order'] = $data['sort_order'] ?? 0;

        $level = ExperienceLevel::create($data);

        Cache::forget('public.experience_levels');
        $this->auditLog('experience_level.created', ['level_id' => $level->id, 'name' => $level->name]);

        return response()->json($level, 201);
    }

    // PUT /api/admin/experience-levels/{id}
    public function update(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $level = ExperienceLevel::findOrFail($id);

        $data = $request->validate([
            'name'       => 'sometimes|string|max:80|unique:experience_levels,name,' . $id,
            'slug'       => 'sometimes|string|max:80|unique:experience_levels,slug,' . $id,
            'sort_order' => 'nullable|integer|min:0',
            'status'     => 'nullable|in:active,inactive',
        ]);

        $level->update($data);

        Cache::forget('public.experience_levels');
        $this->auditLog('experience_level.updated', ['level_id' => $level->id, 'name' => $level->name, 'changes' => array_keys($data)]);

        return response()->json($level->fresh());
    }

    // DELETE /api/admin/experience-levels/{id}
    public function destroy(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $level = ExperienceLevel::findOrFail($id);

        Cache::forget('public.experience_levels');
        $this->auditLog('experience_level.deleted', ['level_id' => $level->id, 'name' => $level->name]);

        $level->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
