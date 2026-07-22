<?php

namespace App\Http\Controllers;

use App\Models\ForumReply;
use App\Models\ForumSubscription;
use App\Models\ForumThread;
use App\Models\ForumVote;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ForumReplyController extends Controller
{
    use ForumConcern;

    // GET /api/forum/threads/{id}/replies — public, chronological, paginated
    public function index(Request $request, $threadId)
    {
        $this->forumEnabledOrAbort();
        $this->guestReadOrAbort();

        $thread = ForumThread::findOrFail($threadId);
        $isMod  = optional($this->optionalUser())->hasPermission('moderate_forum');
        if ($thread->is_hidden && ! $isMod) abort(404);

        $perPage = min(50, max(10, (int) $request->input('per_page', 20)));

        $q = ForumReply::where('thread_id', $threadId)
            ->with('author:id,name,avatar_url')
            ->orderBy('id'); // oldest first
        if (! $isMod) $q->where('is_hidden', false);

        $page = $q->paginate($perPage);

        $voted = $this->votedIds('reply', collect($page->items())->pluck('id')->all());
        $page->getCollection()->transform(function ($r) use ($voted) {
            $r->voted = in_array($r->id, $voted);
            return $r;
        });

        return response()->json($page);
    }

    // POST /api/forum/threads/{id}/replies — any authenticated user
    public function store(Request $request, $threadId)
    {
        $this->forumEnabledOrAbort();
        $thread = ForumThread::findOrFail($threadId);

        if ($thread->is_locked) abort(403, 'This thread is locked.');
        if ($thread->is_hidden) abort(404);

        $data = $request->validate([
            'body'      => 'required|string|min:' . $this->minBodyLen() . '|max:20000',
            'parent_id' => 'nullable|integer|exists:forum_replies,id',
        ]);

        $userId   = auth()->id();
        $userName = optional(auth()->user())->name ?? 'Someone';

        $reply = ForumReply::create([
            'thread_id' => $thread->id,
            'user_id'   => $userId,
            'parent_id' => $data['parent_id'] ?? null,
            'body'      => $data['body'],
        ]);

        // Bump thread activity
        $thread->increment('reply_count');
        $thread->update(['last_activity_at' => now(), 'last_reply_user_id' => $userId]);

        // Replier auto-follows the thread
        ForumSubscription::firstOrCreate(['user_id' => $userId, 'thread_id' => $thread->id]);

        $this->notifySubscribers($thread, $userId, $userName);
        $this->notifyMentions($reply->body, $userId, $userName, $thread->title, $thread->id);

        $this->auditLog('forum.reply.created', ['thread_id' => $thread->id, 'reply_id' => $reply->id]);

        $reply->load('author:id,name,avatar_url');
        $reply->voted = false;
        return response()->json($reply, 201);
    }

    // PUT /api/forum/replies/{id} — author edits own reply
    public function update(Request $request, $id)
    {
        $this->forumEnabledOrAbort();
        $reply = ForumReply::findOrFail($id);
        if ($reply->user_id !== auth()->id()) abort(403, 'You can only edit your own reply.');

        $data = $request->validate([
            'body' => 'required|string|min:' . $this->minBodyLen() . '|max:20000',
        ]);

        $reply->update(['body' => $data['body']]);
        return response()->json($reply->load('author:id,name,avatar_url'));
    }

    // DELETE /api/forum/replies/{id} — author deletes own reply
    public function destroy($id)
    {
        $this->forumEnabledOrAbort();
        $reply = ForumReply::findOrFail($id);
        if ($reply->user_id !== auth()->id()) abort(403, 'You can only delete your own reply.');

        $this->purgeReply($reply);
        $this->auditLog('forum.reply.deleted_by_author', ['id' => $id]);

        return response()->json(['message' => 'Reply deleted.']);
    }

    // POST /api/forum/replies/{id}/vote — toggle upvote
    public function vote($id)
    {
        $this->forumEnabledOrAbort();
        $reply = ForumReply::findOrFail($id);
        if ($reply->is_hidden) abort(404);

        return response()->json($this->toggleVote('reply', $reply));
    }

    // ── Admin / moderation ──────────────────────────────────────────────────

    // PATCH /api/admin/forum/replies/{id}/moderate — hide/unhide
    public function moderate(Request $request, $id)
    {
        $this->requirePermission('moderate_forum');
        $reply = ForumReply::findOrFail($id);

        $data = $request->validate(['is_hidden' => 'required|boolean']);
        $reply->update($data);
        $this->auditLog('forum.reply.moderated', ['id' => $reply->id, 'is_hidden' => $data['is_hidden']]);

        return response()->json($reply->load('author:id,name,avatar_url'));
    }

    // DELETE /api/admin/forum/replies/{id} — hard delete (moderator)
    public function adminDestroy($id)
    {
        $this->requirePermission('moderate_forum');
        $reply = ForumReply::findOrFail($id);

        $this->purgeReply($reply);
        $this->auditLog('forum.reply.deleted_by_mod', ['id' => $id]);

        return response()->json(['message' => 'Reply deleted.']);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    // Notify every subscriber of the thread (except the actor) of new activity.
    private function notifySubscribers(ForumThread $thread, int $actorId, string $actorName): void
    {
        $subscriberIds = ForumSubscription::where('thread_id', $thread->id)
            ->where('user_id', '!=', $actorId)
            ->pluck('user_id');

        foreach ($subscriberIds as $uid) {
            Notification::record(
                $uid,
                'forum_reply',
                $actorName . ' replied',
                'in "' . $thread->title . '"',
                (string) $thread->id
            );
        }
    }

    private function purgeReply(ForumReply $reply): void
    {
        DB::transaction(function () use ($reply) {
            ForumVote::where('votable_type', 'reply')->where('votable_id', $reply->id)->delete();
            $threadId = $reply->thread_id;
            $reply->delete();
            // keep reply_count in sync (floor at 0)
            $thread = ForumThread::find($threadId);
            if ($thread) {
                $count = ForumReply::where('thread_id', $threadId)->count();
                $thread->update(['reply_count' => $count]);
            }
        });
    }
}
