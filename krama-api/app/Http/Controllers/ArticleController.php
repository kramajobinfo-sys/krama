<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Support\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

// Admin CRUD for the career-advice content hub. Public rendering lives in SeoController
// (careerList / careerArticle) so the pages are server-rendered for SEO.
class ArticleController extends Controller
{
    // GET /api/admin/articles — list all (newest first) for the admin panel.
    public function adminIndex(Request $request)
    {
        $this->requirePermission('site_settings');

        $articles = Article::orderByDesc('created_at')
            ->get(['id', 'title', 'slug', 'category', 'status', 'views', 'author_name', 'published_at', 'updated_at']);

        return response()->json([
            'articles'  => $articles,
            'published' => $articles->where('status', 'published')->count(),
        ]);
    }

    // GET /api/admin/articles/{id} — full record for editing.
    public function adminShow(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        return response()->json(Article::findOrFail($id));
    }

    // POST /api/admin/articles
    public function store(Request $request)
    {
        $this->requirePermission('site_settings');
        $data = $this->validated($request);

        $article = new Article();
        $this->fill($article, $data);
        $article->slug = Article::uniqueSlug($data['slug'] ?? $data['title']);
        $article->save();

        $this->auditLog('article.created', ['id' => $article->id, 'title' => $article->title]);
        return response()->json($article, 201);
    }

    // PUT /api/admin/articles/{id}
    public function update(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        $article = Article::findOrFail($id);
        $data = $this->validated($request);

        $this->fill($article, $data);
        // Re-slug only if the admin explicitly set a slug, else keep the stable one.
        if (! empty($data['slug']) && $data['slug'] !== $article->slug) {
            $article->slug = Article::uniqueSlug($data['slug'], $article->id);
        }
        $article->save();

        $this->auditLog('article.updated', ['id' => $article->id]);
        return response()->json($article);
    }

    // DELETE /api/admin/articles/{id}
    public function destroy(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        $article = Article::findOrFail($id);
        $article->delete();
        $this->auditLog('article.deleted', ['id' => (int) $id]);
        return response()->json(['message' => 'Article deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title'            => 'required|string|max:255',
            'slug'             => 'nullable|string|max:255',
            'category'         => 'nullable|string|max:80',
            'excerpt'          => 'nullable|string|max:2000',
            'body'             => 'nullable|string',
            'cover_image'      => 'nullable|string|max:500',
            'author_name'      => 'nullable|string|max:120',
            'meta_description' => 'nullable|string|max:255',
            'status'           => 'required|in:draft,published',
        ]);
    }

    private function fill(Article $article, array $data): void
    {
        $article->title            = $data['title'];
        $article->category         = $data['category'] ?? null;
        $article->excerpt          = $data['excerpt'] ?? null;
        $article->body             = HtmlSanitizer::clean($data['body'] ?? null);  // sanitize on write (XSS)
        $article->cover_image      = $data['cover_image'] ?? null;
        $article->author_name      = ($data['author_name'] ?? '') ?: 'Krama Team';
        $article->meta_description = ($data['meta_description'] ?? '') ?: Str::limit(strip_tags($data['excerpt'] ?? ''), 155, '');

        $article->status = $data['status'];
        // Stamp published_at the first time it goes live; keep the original date afterwards.
        if ($article->status === 'published' && ! $article->published_at) {
            $article->published_at = now();
        }
    }
}
