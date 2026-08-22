<?php

namespace App\Http\Controllers;

use App\Models\AccountDeletionRequest;
use App\Models\User;
use App\Services\AccountEraser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Admin view of account-deletion requests (mostly employers — candidates self-delete).
 * Lets an admin see pending requests and either complete them (erase the user's personal
 * data via AccountEraser, keeping company/billing records) or reject them.
 */
class AdminAccountDeletionController extends Controller
{
    // GET /api/admin/deletion-requests?status=pending
    public function index(Request $request)
    {
        $this->requirePermission('manage_users');

        $status = $request->query('status', 'pending');

        $q = AccountDeletionRequest::query();
        if (in_array($status, ['pending', 'done', 'rejected'], true)) {
            $q->where('status', $status);
        }

        $rows = $q->orderByRaw("FIELD(status,'pending','rejected','done')")
            ->orderByDesc('created_at')
            ->limit(300)
            ->get();

        // Attach each linked user's CURRENT state (name/email/status) so admins see if it's
        // already been erased (email becomes deleted_*@krama.deleted, status suspended).
        $users = User::whereIn('id', $rows->pluck('user_id')->filter()->unique())
            ->get(['id', 'name', 'email', 'status'])->keyBy('id');

        $data = $rows->map(function ($r) use ($users) {
            $u = $r->user_id ? $users->get($r->user_id) : null;
            return [
                'id'         => $r->id,
                'user_id'    => $r->user_id,
                'email'      => $r->email,
                'role'       => $r->role,
                'reason'     => $r->reason,
                'status'     => $r->status,
                'created_at' => $r->created_at,
                'handled_at' => $r->handled_at,
                'user'       => $u ? ['name' => $u->name, 'email' => $u->email, 'status' => $u->status] : null,
                'already_erased' => $u ? (bool) preg_match('/@krama\.deleted$/', (string) $u->email) : false,
            ];
        });

        return response()->json([
            'data'    => $data,
            'pending' => AccountDeletionRequest::where('status', 'pending')->count(),
        ]);
    }

    // POST /api/admin/deletion-requests/{id}/complete — erase the user's personal data + close.
    public function complete($id)
    {
        $this->requirePermission('manage_users');

        $req = AccountDeletionRequest::findOrFail($id);

        if ($req->user_id) {
            $user = User::find($req->user_id);
            if ($user && ! preg_match('/@krama\.deleted$/', (string) $user->email)) {
                AccountEraser::erase($user);
                Log::info("Admin erased account #{$user->id} for deletion request #{$req->id}.");
            }
        }

        $req->forceFill(['status' => 'done', 'handled_at' => now()])->save();

        return response()->json(['message' => 'Request completed — personal data erased.']);
    }

    // POST /api/admin/deletion-requests/{id}/reject
    public function reject($id)
    {
        $this->requirePermission('manage_users');

        $req = AccountDeletionRequest::findOrFail($id);
        $req->forceFill(['status' => 'rejected', 'handled_at' => now()])->save();

        return response()->json(['message' => 'Request rejected.']);
    }
}
