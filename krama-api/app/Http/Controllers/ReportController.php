<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Job;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // GET /api/admin/reports/summary — aggregate marketplace metrics for the current year
    public function summary(Request $request)
    {
        $this->requirePermission('view_reports');

        $currentYear = (int) date('Y');
        $validated = $request->validate([
            'year' => 'nullable|integer|min:2000|max:' . ($currentYear + 1),
        ]);
        $year = (int) ($validated['year'] ?? $currentYear);
        $months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // Applications (YTD) + per-month series
        $appsYtd = Application::whereYear('created_at', $year)->count();
        $byMonth = Application::whereYear('created_at', $year)
            ->selectRaw('MONTH(created_at) m, COUNT(*) c')
            ->groupBy('m')->pluck('c', 'm');
        $applicationsPerMonth = [];
        foreach ($months as $i => $label) {
            $applicationsPerMonth[] = ['month' => $label, 'count' => (int) ($byMonth[$i + 1] ?? 0)];
        }

        // New registrations (YTD)
        $newRegistrations = User::whereYear('created_at', $year)->count();

        // Approval rate = published / (published + rejected) reviewed jobs
        $published = Job::where('status', 'published')->count();
        $rejected = Job::where('status', 'rejected')->count();
        $reviewed = $published + $rejected;
        $approvalRate = $reviewed > 0 ? round($published / $reviewed * 100) : 0;

        // Top categories by open (published) jobs
        $topCategories = Job::where('jobs.status', 'published')
            ->join('categories', 'categories.id', '=', 'jobs.category_id')
            ->selectRaw('categories.name, COUNT(*) jobs')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('jobs')
            ->limit(5)
            ->get()
            ->map(fn ($r) => ['name' => $r->name, 'jobs' => (int) $r->jobs]);

        return response()->json([
            'year'                 => $year,
            'applicationsYtd'      => $appsYtd,
            'newRegistrations'     => $newRegistrations,
            'approvalRate'         => $approvalRate,
            'applicationsPerMonth' => $applicationsPerMonth,
            'topCategories'        => $topCategories,
        ]);
    }

}
