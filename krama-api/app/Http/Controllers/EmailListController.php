<?php

namespace App\Http\Controllers;

use App\Models\EmailList;
use App\Models\EmailListRecipient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Custom recipient lists (e.g. 700 organizations uploaded from a CSV). The client parses
// the CSV and posts a recipients array; we validate + dedupe + bulk-insert.
class EmailListController extends Controller
{
    private const MAX_RECIPIENTS = 20000;

    public function index(Request $request)
    {
        $this->requirePermission('site_settings');
        return response()->json([
            'data' => EmailList::orderByDesc('id')->get(['id', 'name', 'recipient_count', 'created_at']),
        ]);
    }

    // POST /admin/email-lists  { name, recipients: [{email, name?, org?}, ...] }
    public function store(Request $request)
    {
        $this->requirePermission('site_settings');
        $data = $request->validate([
            'name'                 => 'required|string|max:150',
            'recipients'           => 'required|array|min:1|max:' . self::MAX_RECIPIENTS,
            'recipients.*.email'   => 'required|string|max:190',
            'recipients.*.name'    => 'nullable|string|max:190',
            'recipients.*.org'     => 'nullable|string|max:190',
        ]);

        // Normalise, keep only valid emails, dedupe by lowercased email.
        $seen = [];
        $rows = [];
        $now = now();
        foreach ($data['recipients'] as $r) {
            $email = strtolower(trim($r['email'] ?? ''));
            if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) continue;
            if (isset($seen[$email])) continue;
            $seen[$email] = true;
            $rows[] = [
                'email'      => $email,
                'name'       => isset($r['name']) ? trim((string) $r['name']) : null,
                'org'        => isset($r['org']) ? trim((string) $r['org']) : null,
                'created_at' => $now,
            ];
        }

        if (empty($rows)) {
            return response()->json(['message' => 'No valid email addresses were found in the file.'], 422);
        }

        $list = EmailList::create([
            'name' => $data['name'], 'recipient_count' => 0,
            'created_by' => optional($request->user())->id, 'created_at' => $now,
        ]);
        foreach (array_chunk($rows, 500) as $chunk) {
            foreach ($chunk as &$c) { $c['list_id'] = $list->id; }
            DB::table('email_list_recipients')->insert($chunk);
        }
        $count = EmailListRecipient::where('list_id', $list->id)->count();
        $list->update(['recipient_count' => $count]);

        return response()->json([
            'id' => $list->id, 'name' => $list->name, 'recipient_count' => $count,
            'skipped' => count($data['recipients']) - $count,
        ], 201);
    }

    // GET /admin/email-lists/{id} — summary + a small preview sample.
    public function show(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        $list = EmailList::findOrFail($id);
        return response()->json([
            'id' => $list->id, 'name' => $list->name, 'recipient_count' => $list->recipient_count,
            'unsubscribed' => EmailListRecipient::where('list_id', $list->id)->where('unsubscribed', true)->count(),
            'sample' => EmailListRecipient::where('list_id', $list->id)->limit(5)->get(['email', 'name', 'org']),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $this->requirePermission('site_settings');
        EmailListRecipient::where('list_id', $id)->delete();
        EmailList::whereKey($id)->delete();
        return response()->json(['message' => 'List deleted.']);
    }
}
