<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // GET /api/categories — public, active only
    public function index()
    {
        $data = Cache::remember('public.categories', 21600, fn () =>
            Category::where('status', 'active')->orderBy('name')->get(['id', 'name', 'slug', 'icon'])
        );

        return response()->json($data)
            ->header('Cache-Control', 'no-cache, must-revalidate');
    }

    // GET /api/admin/categories — all, with job counts
    public function adminIndex(Request $request)
    {
        $this->requirePermission('site_settings');

        $cats = Category::orderBy('name')
            ->withCount(['jobs' => fn($q) => $q->where('status', 'published')])
            ->get();

        return response()->json($cats);
    }

    // POST /api/admin/categories
    public function store(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate([
            'name'   => 'required|string|max:120|unique:categories,name',
            'slug'   => 'nullable|string|max:120|unique:categories,slug',
            'icon'   => 'nullable|string|max:60',
            'status' => 'nullable|in:active,inactive',
        ]);

        $data['slug']   = $data['slug'] ?? Str::slug($data['name']);
        $data['status'] = $data['status'] ?? 'active';

        $cat = Category::create($data);

        Cache::forget('public.categories');
        $this->auditLog('category.created', ['category_id' => $cat->id, 'name' => $cat->name]);

        return response()->json($cat->loadCount(['jobs' => fn($q) => $q->where('status', 'published')]), 201);
    }

    // PUT /api/admin/categories/{id}
    public function update(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $cat = Category::findOrFail($id);

        $data = $request->validate([
            'name'   => 'sometimes|string|max:120|unique:categories,name,' . $id,
            'slug'   => 'sometimes|string|max:120|unique:categories,slug,' . $id,
            'icon'   => 'nullable|string|max:60',
            'status' => 'nullable|in:active,inactive',
        ]);

        $cat->update($data);

        Cache::forget('public.categories');
        $this->auditLog('category.updated', ['category_id' => $cat->id, 'name' => $cat->name, 'changes' => array_keys($data)]);

        return response()->json($cat->loadCount(['jobs' => fn($q) => $q->where('status', 'published')]));
    }

    // DELETE /api/admin/categories/{id}
    public function destroy(Request $request, $id)
    {
        $this->requirePermission('site_settings');

        $cat = Category::findOrFail($id);

        Cache::forget('public.categories');
        $this->auditLog('category.deleted', ['category_id' => $cat->id, 'name' => $cat->name]);

        $cat->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
