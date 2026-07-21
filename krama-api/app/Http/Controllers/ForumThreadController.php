<?php

namespace App\Http\Controllers;

use App\Models\ForumCategory;
use App\Models\ForumReply;
use App\Models\ForumReport;
use App\Models\ForumSubscription;
use App\Models\ForumTag;
use App\Models\ForumThread;
use App\Models\ForumVote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ForumThreadController extends Controller
{
    use ForumConcern;

    private const AUTHOR_COLS = ['id', 'name', 'avatar_url'];

    // GET /api/forum/threads — public list with filter/search/sort + pagination
    public function index(Request $request)
    {
        $this->forumEnabledOrAbort();
        $this->guestReadOrAbort();

        $perPage = min(30, max(5, (int) $request->input('per_page', 15)));

        $q = ForumThread::query()
            ->where('is_hidden', false)
            ->with([
                'author:id,name,avatar_url',
                'category:id,name,slug,color,icon',
                'tags:id,name,slug',
            ]);

        // Filter by category (id or slug)
        if ($cat = $request->input('category')) {
            $categoryId = is_numeric($cat)
                ? (int) $cat
                : optional(ForumCategory::where('slug', $cat)->first())->id;
            $q->where('category_id', $categoryId ?? 0);
        }

        // Filter by tag slug
        if ($tag = $request->input('tag')) {
            $q->whereHas('tags', fn ($t) => $t->where('slug', $tag));
        }

        // Full-text search (falls back to LIKE for short terms)
        if ($term = trim((string) $request->input('q', ''))) {
            $this->applySearch($q, $term);
        }

        // Sort
        switch ($request->input('sort', 'latest')) {
            case 'new':
                $q->orderByDesc('created_at');
                break;
            case 'top':
                $q->orderByDesc('vote_score')->orderByDesc('last_activity_at');
                break;
            default: // latest activity, pinned first
                $q->orderByDesc('is_pinned')->orderByDesc('last_activity_at');
        }

        $page = $q->paginate($perPage);

        // Attach the current user's upvote state for the listed threads
        $voted = $this->votedIds('thread', collect($page->items())->pluck('id')->all());
        $page->getCollection()->transform(function ($t) use ($voted) {
            $t->voted = in_array($t->id, $voted);
            return $t;
        });

        return response()->json($page);
    }

    // GET /api/forum/threads/{id} — public thread detail (increments views)
    public function show($id)
    {
        $this->forumEnabledOrAbort();
        $this->guestReadOrAbort();

        $thread = ForumThread::with([
            'author:id,name,avatar_url',
            'category:id,name,slug,color,icon',
            'tags:id,name,slug',
        ])->findOrFail($id);

        if ($thread->is_hidden && ! optional($this->optionalUser())->hasPermission('moderate_forum')) {
            abort(404);
        }

        $thread->increment('views');
        $thread->voted = in_array($thread->id, $this->votedIds('thread', [$thread->id]));
        $thread->subscribed = auth()->check() && ForumSubscription::where('user_id', auth()->id())
            ->where('thread_id', $thread->id)->exists();

        return response()->json($thread);
    }

    // POST /api/forum/threads — any authenticated user
    public function store(Request $request)
    {
        $this->forumEnabledOrAbort();

        $data = $request->validate([
            'category_id' => 'required|integer|exists:forum_categories,id',
            'title'       => 'required|string|max:200',
            'body'        => 'required|string|min:' . $this->minBodyLen() . '|max:20000',
            'tags'        => 'nullable|array|max:5',
            'tags.*'      => 'string|max:40',
        ]);

        $userId = auth()->id();

        $thread = ForumThread::create([
            'category_id'      => $data['category_id'],
            'user_id'          => $userId,
            'title'            => $data['title'],
            'slug'             => Str::slug(Str::limit($data['title'], 80, '')),
            'body'             => $data['body'],
            'last_activity_at' => now(),
        ]);

        $this->syncTags($thread, $data['tags'] ?? []);

        // Author auto-follows their own thread
        ForumSubscription::firstOrCreate(['user_id' => $userId, 'thread_id' => $thread->id]);

        $this->notifyMentions($thread->body, $userId, optional(auth()->user())->name ?? 'Someone', $thread->title);
        $this->auditLog('forum.thread.created', ['id' => $thread->id]);

        return response()->json(
            $thread->load(['author:id,name,avatar_url', 'category:id,name,slug,color,icon', 'tags:id,name,slug']),
            201
        );
    }

    // PUT /api/forum/threads/{id} — author edits own thread
    public function update(Request $request, $id)
    {
        $this->forumEnabledOrAbort();
        $thread = ForumThread::findOrFail($id);

        if ($thread->user_id !== auth()->id()) abort(403, 'You can only edit your own thread.');
        if ($thread->is_locked) abort(403, 'This thread is locked.');

        $data = $request->validate([
            'title'  => 'sometimes|string|max:200',
            'body'   => 'sometimes|string|min:' . $this->minBodyLen() . '|max:20000',
            'tags'   => 'nullable|array|max:5',
            'tags.*' => 'string|max:40',
        ]);

        if (isset($data['title'])) $thread->title = $data['title'];
        if (isset($data['body']))  $thread->body  = $data['body'];
        $thread->save();

        if ($request->has('tags')) $this->syncTags($thread, $data['tags'] ?? []);

        return response()->json(
            $thread->load(['author:id,name,avatar_url', 'category:id,name,slug,color,icon', 'tags:id,name,slug'])
        );
    }

    // DELETE /api/forum/threads/{id} — author deletes own thread
    public function destroy($id)
    {
        $this->forumEnabledOrAbort();
        $thread = ForumThread::findOrFail($id);

        if ($thread->user_id !== auth()->id()) abort(403, 'You can only delete your own thread.');

        $this->purgeThread($thread);
        $this->auditLog('forum.thread.deleted_by_author', ['id' => $id]);

        return response()->json(['message' => 'Thread deleted.']);
    }

    // POST /api/forum/threads/{id}/vote — toggle upvote
    public function vote($id)
    {
        $this->forumEnabledOrAbort();
        $thread = ForumThread::findOrFail($id);
        if ($thread->is_hidden) abort(404);

        return response()->json($this->toggleVote('thread', $thread));
    }

    // POST /api/forum/threads/{id}/subscribe
    public function subscribe($id)
    {
        $this->forumEnabledOrAbort();
        ForumThread::findOrFail($id);
        ForumSubscription::firstOrCreate(['user_id' => auth()->id(), 'thread_id' => (int) $id]);
        return response()->json(['subscribed' => true]);
    }

    // DELETE /api/forum/threads/{id}/subscribe
    public function unsubscribe($id)
    {
        $this->forumEnabledOrAbort();
        ForumSubscription::where('user_id', auth()->id())->where('thread_id', $id)->delete();
        return response()->json(['subscribed' => false]);
    }

    // ── Admin / moderation ──────────────────────────────────────────────────

    // GET /api/admin/forum/threads — all threads incl. hidden, search + paginate
    public function adminIndex(Request $request)
    {
        $this->requirePermission('moderate_forum');

        $perPage = min(50, max(10, (int) $request->input('per_page', 20)));
        $q = ForumThread::with(['author:id,name,avatar_url', 'category:id,name,slug'])
            ->orderByDesc('created_at');

        if ($term = trim((string) $request->input('q', ''))) {
            $q->where(fn ($w) => $w->where('title', 'like', "%$term%")->orWhere('body', 'like', "%$term%"));
        }
        if ($request->filled('category_id')) $q->where('category_id', (int) $request->input('category_id'));

        return response()->json($q->paginate($perPage));
    }

    // PATCH /api/admin/forum/threads/{id}/moderate — pin/lock/hide
    public function moderate(Request $request, $id)
    {
        $this->requirePermission('moderate_forum');
        $thread = ForumThread::findOrFail($id);

        $data = $request->validate([
            'is_pinned' => 'sometimes|boolean',
            'is_locked' => 'sometimes|boolean',
            'is_hidden' => 'sometimes|boolean',
        ]);

        $thread->update($data);
        $this->auditLog('forum.thread.moderated', ['id' => $thread->id, 'changes' => $data]);

        return response()->json($thread->load(['author:id,name,avatar_url', 'category:id,name,slug']));
    }

    // DELETE /api/admin/forum/threads/{id} — hard delete (moderator)
    public function adminDestroy($id)
    {
        $this->requirePermission('moderate_forum');
        $thread = ForumThread::findOrFail($id);

        $this->purgeThread($thread);
        $this->auditLog('forum.thread.deleted_by_mod', ['id' => $id]);

        return response()->json(['message' => 'Thread deleted.']);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private function applySearch($query, string $term): void
    {
        // FULLTEXT needs tokens >= innodb_ft_min_token_size (default 3)
        $longEnough = collect(preg_split('/\s+/', $term))->contains(fn ($w) => strlen($w) >= 3);
        if ($longEnough) {
            $boolean = collect(preg_split('/\s+/', $term))
                ->filter(fn ($w) => strlen($w) >= 2)
                ->map(fn ($w) => preg_replace('/[+\-><\(\)~*\"@]+/', '', $w) . '*')
                ->filter()->implode(' ');
            if ($boolean !== '') {
                $query->whereRaw('MATCH(title, body) AGAINST (? IN BOOLEAN MODE)', [$boolean]);
                return;
            }
        }
        $query->where(fn ($w) => $w->where('title', 'like', "%$term%")->orWhere('body', 'like', "%$term%"));
    }

    private function syncTags(ForumThread $thread, array $names): void
    {
        $ids = [];
        foreach ($names as $name) {
            $name = trim($name);
            if ($name === '') continue;
            $slug = Str::slug($name);
            if ($slug === '') continue;
            $tag = ForumTag::firstOrCreate(['slug' => $slug], ['name' => $name]);
            $ids[] = $tag->id;
        }
        $thread->tags()->sync($ids);

        // Refresh cached thread_count on affected tags
        foreach (ForumTag::whereIn('id', $ids)->get() as $t) {
            $t->update(['thread_count' => $t->threads()->count()]);
        }
    }

    private function purgeThread(ForumThread $thread): void
    {
        $replyIds = ForumReply::where('thread_id', $thread->id)->pluck('id')->all();
        $tagIds   = $thread->tags()->pluck('forum_tags.id')->all();

        DB::transaction(function () use ($thread, $replyIds) {
            ForumVote::where('votable_type', 'thread')->where('votable_id', $thread->id)->delete();
            if ($replyIds) {
                ForumVote::where('votable_type', 'reply')->whereIn('votable_id', $replyIds)->delete();
            }
            ForumReply::where('thread_id', $thread->id)->delete();
            ForumSubscription::where('thread_id', $thread->id)->delete();
            ForumReport::where('reportable_type', 'thread')->where('reportable_id', $thread->id)->delete();
            if ($replyIds) {
                ForumReport::where('reportable_type', 'reply')->whereIn('reportable_id', $replyIds)->delete();
            }
            $thread->tags()->detach();
            $thread->delete();
        });

        // Recompute cached counts on the (now-detached) tags
        foreach (ForumTag::whereIn('id', $tagIds)->get() as $t) {
            $t->update(['thread_count' => $t->threads()->count()]);
        }
    }
}
