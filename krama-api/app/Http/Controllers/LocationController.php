<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class LocationController extends Controller
{
    // GET /api/locations — public
    public function index()
    {
        $data = Cache::remember('public.locations', 21600, fn () =>
            Location::orderBy('name')->get(['id', 'name', 'type', 'parent_id'])
        );

        return response()->json($data)
            ->header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    }

    // GET /api/admin/locations — all
    public function adminIndex(Request $request)
    {
        $this->requirePermission('site_settings');

        return response()->json(
            Location::orderBy('type')->orderBy('name')->get()
        );
    }

    // POST /api/admin/locations
    public function store(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'name'      => 'required|string|max:120',
            'type'      => 'required|in:country,province,city',
            'parent_id' => 'nullable|exists:locations,id',
        ]);

        $location = Location::create($data);

        Cache::forget('public.locations');
        $this->auditLog('location.created', ['location_id' => $location->id, 'name' => $location->name]);

        return response()->json($location, 201);
    }

    // PUT /api/admin/locations/{id}
    public function update(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $location = Location::findOrFail($id);

        $data = $request->validate([
            'name'      => 'sometimes|string|max:120',
            'type'      => 'sometimes|in:country,province,city',
            'parent_id' => 'nullable|exists:locations,id',
        ]);

        $location->update($data);

        Cache::forget('public.locations');
        $this->auditLog('location.updated', ['location_id' => $location->id, 'name' => $location->name, 'changes' => array_keys($data)]);

        return response()->json($location->fresh());
    }

    // DELETE /api/admin/locations/{id}
    public function destroy(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $location = Location::findOrFail($id);

        Cache::forget('public.locations');
        $this->auditLog('location.deleted', ['location_id' => $location->id, 'name' => $location->name]);

        $location->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
