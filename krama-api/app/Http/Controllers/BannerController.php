<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    // GET /api/banners — public: active banners in sort order
    public function index()
    {
        return response()->json(
            Banner::active()->orderBy('sort_order')->get()
        );
    }

    // GET /api/admin/banners — admin: all banners regardless of status
    public function adminIndex(Request $request)
    {
        $this->requirePermission('site_settings');

        return response()->json(Banner::orderBy('sort_order')->get());
    }

    // POST /api/admin/banners
    public function store(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'title'      => 'required|string|max:190',
            'message'    => 'nullable|string|max:255',
            'cta_label'  => 'nullable|string|max:80',
            'cta_url'    => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//'],
            'theme'      => 'in:saffron,teal,dark',
            'icon'       => 'nullable|string|max:40',
            'image_url'  => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//'],
            'image_fit'  => 'in:cover,contain',
            'text_align' => 'in:left,center',
            'is_active'  => 'boolean',
            'starts_at'  => 'nullable|date',
            'ends_at'    => 'nullable|date|after_or_equal:starts_at',
            'sort_order' => 'integer',
        ]);

        // Default new banners to inactive — require explicit activation
        $data['is_active']  = $data['is_active'] ?? false;
        $data['created_at'] = now();

        $banner = Banner::create($data);

        $this->auditLog('banner.created', ['banner_id' => $banner->id, 'title' => $banner->title]);

        return response()->json($banner, 201);
    }

    // PUT /api/admin/banners/{id}
    public function update(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $banner = Banner::findOrFail($id);

        $data = $request->validate([
            'title'      => 'sometimes|string|max:190',
            'message'    => 'nullable|string|max:255',
            'cta_label'  => 'nullable|string|max:80',
            'cta_url'    => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//'],
            'theme'      => 'sometimes|in:saffron,teal,dark',
            'icon'       => 'nullable|string|max:40',
            'image_url'  => ['nullable', 'url', 'max:255', 'regex:/^https?:\/\//'],
            'image_fit'  => 'sometimes|in:cover,contain',
            'text_align' => 'sometimes|in:left,center',
            'is_active'  => 'sometimes|boolean',
            'starts_at'  => 'nullable|date',
            'ends_at'    => 'nullable|date|after_or_equal:starts_at',
            'sort_order' => 'sometimes|integer',
        ]);

        $banner->update($data);

        $this->auditLog('banner.updated', ['banner_id' => $banner->id, 'title' => $banner->title, 'changes' => array_keys($data)]);

        return response()->json($banner->fresh());
    }

    // DELETE /api/admin/banners/{id}
    public function destroy(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $banner = Banner::findOrFail($id);

        $this->auditLog('banner.deleted', ['banner_id' => $banner->id, 'title' => $banner->title]);

        $banner->delete();

        return response()->json(['message' => 'Banner deleted.']);
    }

    // PATCH /api/admin/banners/reorder — bulk sort_order update
    public function reorder(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:banners,id',
        ]);

        $rows = array_map(
            fn ($position, $id) => ['id' => $id, 'sort_order' => $position],
            array_keys($data['order']),
            $data['order']
        );

        // Single INSERT … ON DUPLICATE KEY UPDATE — one round-trip regardless of count
        Banner::upsert($rows, ['id'], ['sort_order']);

        $this->auditLog('banner.reordered', ['count' => count($data['order'])]);

        return response()->json(['message' => 'Order saved.']);
    }

}
