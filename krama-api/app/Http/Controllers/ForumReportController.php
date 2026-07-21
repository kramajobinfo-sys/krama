<?php

namespace App\Http\Controllers;

use App\Models\ForumReply;
use App\Models\ForumReport;
use App\Models\ForumThread;
use App\Models\ForumVote;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ForumReportController extends Controller
{
    use ForumConcern;

    // POST /api/forum/report — any authenticated user flags a thread/reply
    public function store(Request $request)
    {
        $this->forumEnabledOrAbort();

        $data = $request->validate([
            'reportable_type' => 'required|in:thread,reply',
            'reportable_id'   => 'required|integer',
            'reason'          => 'required|in:spam,abuse,off_topic,other',
            'note'            => 'nullable|string|max:500',
        ]);

        // Confirm the target exists
        $exists = $data['reportable_type'] === 'thread'
            ? ForumThread::whereKey($data['reportable_id'])->exists()
            : ForumReply::whereKey($data['reportable_id'])->exists();
        if (! $exists) abort(404, 'That content no longer exists.');

        // One open report per user per item
        $report = ForumReport::firstOrCreate(
            [
                'reporter_id'     => auth()->id(),
                'reportable_type' => $data['reportable_type'],
                'reportable_id'   => $data['reportable_id'],
                'status'          => 'open',
            ],
            ['reason' => $data['reason'], 'note' => $data['note'] ?? null]
        );

        if ($report->wasRecentlyCreated) {
            Notification::recordAdmins(
                'forum_report',
                'New forum report',
                ucfirst($data['reportable_type']) . ' reported for ' . str_replace('_', ' ', $data['reason'])
            );
        }

        return response()->json(['message' => 'Thanks — our team will review this.'], 201);
    }

    // GET /api/admin/forum/reports — moderation queue (default: open)
    public function adminIndex(Request $request)
    {
        $this->requirePermission('moderate_forum');

        $status  = $request->input('status', 'open');
        $perPage = min(50, max(10, (int) $request->input('per_page', 20)));

        $q = ForumReport::orderByDesc('created_at');
        if (in_array($status, ['open', 'resolved', 'dismissed'])) $q->where('status', $status);

        $page = $q->paginate($perPage);

        // Enrich each report with reporter name + a snippet of the reported content
        $page->getCollection()->transform(function ($r) {
            $reporter = \App\Models\User::find($r->reporter_id);
            $r->reporter_name = $reporter ? $reporter->name : 'Unknown';

            if ($r->reportable_type === 'thread') {
                $t = ForumThread::find($r->reportable_id);
                $r->content_title   = $t ? $t->title : null;
                $r->content_snippet = $t ? \Illuminate\Support\Str::limit($t->body, 160) : '(deleted)';
                $r->content_hidden  = $t ? (bool) $t->is_hidden : null;
                $r->thread_id       = $t ? $t->id : null;
            } else {
                $rep = ForumReply::find($r->reportable_id);
                $r->content_title   = null;
                $r->content_snippet = $rep ? \Illuminate\Support\Str::limit($rep->body, 160) : '(deleted)';
                $r->content_hidden  = $rep ? (bool) $rep->is_hidden : null;
                $r->thread_id       = $rep ? $rep->thread_id : null;
            }
            return $r;
        });

        return response()->json($page);
    }

    // PATCH /api/admin/forum/reports/{id} — resolve/dismiss (+ optional action)
    public function resolve(Request $request, $id)
    {
        $this->requirePermission('moderate_forum');
        $report = ForumReport::findOrFail($id);

        $data = $request->validate([
            'status' => 'required|in:resolved,dismissed',
            'action' => 'nullable|in:hide,unhide,delete,none',
        ]);
        $action = $data['action'] ?? 'none';

        if ($action !== 'none') {
            $this->applyAction($report->reportable_type, $report->reportable_id, $action);
        }

        $report->update([
            'status'      => $data['status'],
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
        ]);

        $this->auditLog('forum.report.resolved', [
            'id' => $report->id, 'status' => $data['status'], 'action' => $action,
        ]);

        return response()->json(['message' => 'Report updated.']);
    }

    private function applyAction(string $type, int $targetId, string $action): void
    {
        if ($type === 'thread') {
            $thread = ForumThread::find($targetId);
            if (! $thread) return;
            if ($action === 'hide')   $thread->update(['is_hidden' => true]);
            if ($action === 'unhide') $thread->update(['is_hidden' => false]);
            if ($action === 'delete') $this->purgeThread($thread);
        } else {
            $reply = ForumReply::find($targetId);
            if (! $reply) return;
            if ($action === 'hide')   $reply->update(['is_hidden' => true]);
            if ($action === 'unhide') $reply->update(['is_hidden' => false]);
            if ($action === 'delete') {
                ForumVote::where('votable_type', 'reply')->where('votable_id', $reply->id)->delete();
                $threadId = $reply->thread_id;
                $reply->delete();
                if ($t = ForumThread::find($threadId)) {
                    $t->update(['reply_count' => ForumReply::where('thread_id', $threadId)->count()]);
                }
            }
        }
    }

    private function purgeThread(ForumThread $thread): void
    {
        $replyIds = ForumReply::where('thread_id', $thread->id)->pluck('id')->all();
        $tagIds   = $thread->tags()->pluck('forum_tags.id')->all();

        DB::transaction(function () use ($thread, $replyIds) {
            ForumVote::where('votable_type', 'thread')->where('votable_id', $thread->id)->delete();
            if ($replyIds) ForumVote::where('votable_type', 'reply')->whereIn('votable_id', $replyIds)->delete();
            ForumReply::where('thread_id', $thread->id)->delete();
            \App\Models\ForumSubscription::where('thread_id', $thread->id)->delete();
            ForumReport::where('reportable_type', 'thread')->where('reportable_id', $thread->id)->delete();
            if ($replyIds) ForumReport::where('reportable_type', 'reply')->whereIn('reportable_id', $replyIds)->delete();
            $thread->tags()->detach();
            $thread->delete();
        });

        foreach (\App\Models\ForumTag::whereIn('id', $tagIds)->get() as $t) {
            $t->update(['thread_count' => $t->threads()->count()]);
        }
    }
}
