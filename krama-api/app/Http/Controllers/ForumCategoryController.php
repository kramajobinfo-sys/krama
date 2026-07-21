<?php

namespace App\Http\Controllers;

use App\Models\ForumCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ForumCategoryController extends Controller
{
    use ForumConcern;

    // GET /api/forum/categories — public, active categories with thread counts
    public function index()
    {
        $this->forumEnabledOrAbort();
        $this->guestReadOrAbort();

        $cats = ForumCategory::where('is_active', true)
            ->orderBy('sort_order')->orderBy('name')
            ->withCount(['threads' => fn ($q) => $q->where('is_hidden', false)])
            ->get();

        return response()->json($cats);
    }

    // GET /api/admin/forum/categories — all categories (moderation)
    public function adminIndex()
    {
        $this->requirePermission('moderate_forum');

        return response()->json(
            ForumCategory::orderBy('sort_order')->orderBy('name')
                ->withCount('threads')->get()
        );
    }

    // POST /api/admin/forum/categories
    public function store(Request $request)
    {
        $this->requirePermission('moderate_forum');

        $data = $request->validate([
            'name'        => 'required|string|max:120|unique:forum_categories,name',
            'description' => 'nullable|string|max:400',
            'icon'        => 'nullable|string|max:60',
            'color'       => 'nullable|string|max:20',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
        ]);

        $data['slug']       = Str::slug($data['name']);
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['is_active']  = $data['is_active'] ?? true;

        $cat = ForumCategory::create($data);
        $this->auditLog('forum.category.created', ['id' => $cat->id, 'name' => $cat->name]);

        return response()->json($cat->loadCount('threads'), 201);
    }

    // PUT /api/admin/forum/categories/{id}
    public function update(Request $request, $id)
    {
        $this->requirePermission('moderate_forum');
        $cat = ForumCategory::findOrFail($id);

        $data = $request->validate([
            'name'        => 'sometimes|string|max:120|unique:forum_categories,name,' . $id,
            'description' => 'nullable|string|max:400',
            'icon'        => 'nullable|string|max:60',
            'color'       => 'nullable|string|max:20',
            'sort_order'  => 'nullable|integer|min:0',
            'is_active'   => 'nullable|boolean',
        ]);

        if (isset($data['name'])) $data['slug'] = Str::slug($data['name']);

        $cat->update($data);
        $this->auditLog('forum.category.updated', ['id' => $cat->id, 'changes' => array_keys($data)]);

        return response()->json($cat->loadCount('threads'));
    }

    // DELETE /api/admin/forum/categories/{id}
    public function destroy($id)
    {
        $this->requirePermission('moderate_forum');
        $cat = ForumCategory::findOrFail($id);

        if ($cat->threads()->exists()) {
            return response()->json([
                'message' => 'This category still has threads. Move or delete them first.',
            ], 422);
        }

        $this->auditLog('forum.category.deleted', ['id' => $cat->id, 'name' => $cat->name]);
        $cat->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
