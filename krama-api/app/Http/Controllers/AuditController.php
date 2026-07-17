<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuditController extends Controller
{
    // Cap how many recent log lines we scan so this never loads all 90 days of files.
    private const MAX_SCAN = 5000;

    // GET /api/admin/audit — read + parse the recent audit log files (newest first).
    // Audit entries are file-based (storage/logs/audit-*.log, daily, 90-day retention),
    // so this parses lines rather than querying a table.
    public function index(Request $request)
    {
        $this->requirePermission('view_audit');

        $data = $request->validate([
            'page'     => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'action'   => 'nullable|string|max:80',
            'q'        => 'nullable|string|max:120',
        ]);

        $perPage = (int) ($data['per_page'] ?? 30);
        $page    = (int) ($data['page'] ?? 1);

        // Collect audit log files newest-first. The daily driver names them
        // audit-YYYY-MM-DD.log, so a reverse lexical sort is chronological desc.
        $files = glob(storage_path('logs/audit*.log')) ?: [];
        rsort($files);

        // Read lines newest-first (bottom of each file first), bounded by MAX_SCAN.
        $lines = [];
        foreach ($files as $file) {
            $content = @file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
            foreach (array_reverse($content) as $line) {
                $lines[] = $line;
                if (count($lines) >= self::MAX_SCAN) {
                    break 2;
                }
            }
        }

        $entries = [];
        foreach ($lines as $line) {
            // Format: [2026-07-09 14:25:31] local.INFO: action {json context} []
            if (! preg_match('/^\[(.*?)\] [\w-]+\.(\w+): (\S+) (\{.*\})/', $line, $m)) {
                continue;
            }
            $ctx = json_decode($m[4], true);
            if (! is_array($ctx)) {
                $ctx = [];
            }

            $meta = ['user_id', 'email', 'ip', 'ua'];
            $entries[] = [
                'time'    => $m[1],
                'level'   => $m[2],
                'action'  => $m[3],
                'user_id' => $ctx['user_id'] ?? null,
                'email'   => $ctx['email'] ?? null,
                'ip'      => $ctx['ip'] ?? null,
                'context' => (object) array_diff_key($ctx, array_flip($meta)),
            ];
        }

        // Filters (applied in-memory over the parsed window).
        if (! empty($data['action'])) {
            $prefix = $data['action'];
            $entries = array_values(array_filter($entries, function ($e) use ($prefix) {
                return strpos($e['action'], $prefix) === 0;
            }));
        }
        if (! empty($data['q'])) {
            $q = strtolower($data['q']);
            $entries = array_values(array_filter($entries, function ($e) use ($q) {
                return strpos(strtolower(json_encode($e)), $q) !== false;
            }));
        }

        $total = count($entries);
        $items = array_slice($entries, ($page - 1) * $perPage, $perPage);

        // Distinct actions in the current window — powers the frontend filter dropdown.
        $actions = array_values(array_unique(array_map(fn ($e) => $e['action'], $entries)));
        sort($actions);

        return response()->json([
            'data'      => $items,
            'total'     => $total,
            'page'      => $page,
            'per_page'  => $perPage,
            'last_page' => max(1, (int) ceil($total / $perPage)),
            'actions'   => $actions,
            'capped'    => count($lines) >= self::MAX_SCAN,
        ]);
    }
}
