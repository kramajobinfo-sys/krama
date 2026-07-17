<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MessageController extends Controller
{
    // GET /api/conversations — list conversations for current user
    public function index(Request $request)
    {
        $user = $request->user();

        $q = Conversation::with([
            'candidate:id,name,avatar_url',
            'employer:id,name,avatar_url',
            'job:id,title',
            'latestMessage',
        ]);

        if ($user->role && $user->role->slug === 'candidate') {
            $q->where('candidate_id', $user->id);
        } elseif ($user->role && $user->role->slug === 'employer') {
            $q->where('employer_id', $user->id);
        } else {
            // Admin: see all conversations
            $q->where(function ($x) use ($user) {
                $x->where('candidate_id', $user->id)->orWhere('employer_id', $user->id);
            });
        }

        $conversations = $q->orderBy('updated_at', 'desc')->paginate(30);

        // Attach unread count per conversation
        $items = $conversations->items();
        foreach ($items as $conv) {
            $conv->unread_count = Message::where('conversation_id', $conv->id)
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
                ->count();
        }

        return response()->json([
            'data'     => $items,
            'total'    => $conversations->total(),
            'last_page'=> $conversations->lastPage(),
        ]);
    }

    // POST /api/conversations — start or find a conversation
    public function store(Request $request)
    {
        $user = $request->user();
        $role = $user->role ? $user->role->slug : null;

        $data = $request->validate([
            'other_user_id' => 'required|integer|exists:users,id',
            'job_id'        => 'nullable|integer|exists:jobs,id',
            'subject'       => 'nullable|string|max:190',
            'message'       => 'required|string|max:5000',
        ]);

        $otherId = (int) $data['other_user_id'];
        $other   = User::with('role')->findOrFail($otherId);
        $otherRole = $other->role ? $other->role->slug : null;

        // Determine candidate/employer pairing
        if ($role === 'candidate' && $otherRole === 'employer') {
            // Candidate-initiated: only allowed if this employer opted in.
            if (! $other->allow_candidate_messages) {
                return response()->json(['message' => 'This employer is not accepting messages from candidates.'], 403);
            }
            $candidateId = $user->id;
            $employerId  = $otherId;
        } elseif ($role === 'employer' && $otherRole === 'candidate') {
            $candidateId = $otherId;
            $employerId  = $user->id;
        } else {
            return response()->json(['message' => 'Messaging is only available between candidates and employers.'], 422);
        }

        $conversation = Conversation::firstOrCreate(
            ['candidate_id' => $candidateId, 'employer_id' => $employerId],
            [
                'job_id'  => $data['job_id'] ?? null,
                'subject' => $data['subject'] ?? null,
            ]
        );

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $user->id,
            'body'            => $data['message'],
        ]);

        $conversation->touch();

        return response()->json([
            'conversation' => $conversation->load(['candidate:id,name,avatar_url', 'employer:id,name,avatar_url', 'job:id,title']),
            'message'      => $message,
        ], 201);
    }

    // GET /api/conversations/{id} — messages in a conversation
    public function show(Request $request, $id)
    {
        $user         = $request->user();
        $conversation = $this->findConversation($user, $id);

        $perPage  = min(50, max(1, (int) $request->input('per_page', 30)));
        $messages = Message::with('sender:id,name,avatar_url')
            ->where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);

        // Mark incoming messages as read
        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'conversation' => $conversation->load(['candidate:id,name,avatar_url', 'employer:id,name,avatar_url', 'job:id,title']),
            'messages'     => $messages,
        ]);
    }

    // POST /api/conversations/{id}/messages — send a message
    public function sendMessage(Request $request, $id)
    {
        $user         = $request->user();
        $conversation = $this->findConversation($user, $id);

        $data = $request->validate(['body' => 'required|string|max:5000']);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $user->id,
            'body'            => $data['body'],
        ]);

        $conversation->touch();

        return response()->json($message->load('sender:id,name,avatar_url'), 201);
    }

    // GET /api/conversations/{id}/messages?after={id} — delta poll for near-real-time updates.
    // Returns only messages newer than {after} so the client can append cheaply.
    public function newMessages(Request $request, $id)
    {
        $user         = $request->user();
        $conversation = $this->findConversation($user, $id);

        $after = (int) $request->input('after', 0);

        $query = Message::with('sender:id,name,avatar_url')
            ->where('conversation_id', $conversation->id)
            ->orderBy('id', 'asc');

        if ($after > 0) {
            $query->where('id', '>', $after);
        }

        $messages = $query->limit(100)->get();

        // Mark incoming messages as read while the user is viewing the thread.
        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    // GET /api/conversations/unread — unread message count for badge
    public function unreadCount(Request $request)
    {
        $user = $request->user();

        $field = ($user->role && $user->role->slug === 'candidate') ? 'candidate_id' : 'employer_id';

        $count = Message::whereHas('conversation', fn ($q) => $q->where($field, $user->id))
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    // ----------------------------------------------------------------
    //  Helper
    // ----------------------------------------------------------------

    private function findConversation(User $user, $id): Conversation
    {
        $conversation = Conversation::findOrFail($id);

        if ($conversation->candidate_id !== $user->id && $conversation->employer_id !== $user->id) {
            abort(403, 'Access denied.');
        }

        return $conversation;
    }
}
