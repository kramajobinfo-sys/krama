<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET /api/notifications — current user's notifications, newest first
    public function index(Request $request)
    {
        $user    = $request->user();
        $perPage = min(50, max(1, (int) $request->input('per_page', 20)));

        $notifications = Notification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json([
            'data'      => $notifications->items(),
            'total'     => $notifications->total(),
            'last_page' => $notifications->lastPage(),
            'unread'    => Notification::where('user_id', $user->id)->whereNull('read_at')->count(),
        ]);
    }

    // GET /api/notifications/unread — unread count for the bell badge
    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $count]);
    }

    // POST /api/notifications/{id}/read — mark one as read
    public function markRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);

        if (is_null($notification->read_at)) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['id' => $notification->id, 'read_at' => $notification->read_at]);
    }

    // POST /api/notifications/read-all — mark all of the user's notifications read
    public function markAllRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked read.']);
    }
}
