<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Job;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;

// Accurate figures for the admin Overview. Computed with COUNT/SUM queries (not derived from
// paginator totals or a single payments page), so the numbers are exact.
class AdminStatsController extends Controller
{
    public function index(Request $request)
    {
        // The whole admin route group already requires the site_settings permission, so any
        // admin who can open the console can read the overview. No extra gate here.
        $now   = now();
        $year  = (int) $now->year;
        $month = $now->copy()->startOfMonth();
        $prevStart = $month->copy()->subMonthNoOverflow();   // start of last month; prev range = [$prevStart, $month)

        $candidateRoleId = \App\Models\Role::where('slug', 'candidate')->value('id');

        // Revenue in USD-equivalent: USD paid as-is; KHR paid divided by the fx_rate snapshotted
        // on the payment (so mixed-currency payments don't get summed as raw numbers).
        $usdEquiv = function ($query) {
            return round((float) $query->get(['amount', 'currency', 'fx_rate'])->reduce(function ($sum, $p) {
                $amt = (float) $p->amount;
                if (strtoupper((string) ($p->currency ?: 'USD')) === 'KHR' && (float) $p->fx_rate > 0) {
                    $amt = $amt / (float) $p->fx_rate;
                }
                return $sum + $amt;
            }, 0.0), 2);
        };

        // Monthly job posts for the current year (by created_at), always 12 buckets.
        $counts = Job::selectRaw('MONTH(created_at) as m, COUNT(*) as c')
            ->whereYear('created_at', $year)
            ->groupBy('m')->pluck('c', 'm');
        $labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $monthly = [];
        foreach (range(1, 12) as $mo) {
            $monthly[] = ['month' => $labels[$mo - 1], 'count' => (int) ($counts[$mo] ?? 0)];
        }

        return response()->json([
            'jobs_total'         => Job::count(),
            'jobs_published'     => Job::where('status', 'published')->count(),
            'jobs_pending'       => Job::where('status', 'pending')->count(),
            'jobs_mtd'           => Job::where('created_at', '>=', $month)->count(),
            'jobs_prev'          => Job::where('created_at', '>=', $prevStart)->where('created_at', '<', $month)->count(),
            'companies_total'    => Company::count(),
            'companies_approved' => Company::where('status', 'approved')->count(),
            'companies_mtd'      => Company::where('created_at', '>=', $month)->count(),
            'companies_prev'     => Company::where('created_at', '>=', $prevStart)->where('created_at', '<', $month)->count(),
            'candidates'         => $candidateRoleId ? User::where('role_id', $candidateRoleId)->count() : 0,
            'candidates_mtd'     => $candidateRoleId ? User::where('role_id', $candidateRoleId)->where('created_at', '>=', $month)->count() : 0,
            'candidates_prev'    => $candidateRoleId ? User::where('role_id', $candidateRoleId)->where('created_at', '>=', $prevStart)->where('created_at', '<', $month)->count() : 0,
            'revenue_mtd'        => $usdEquiv(Payment::where('status', 'paid')->where('created_at', '>=', $month)),
            'revenue_prev'       => $usdEquiv(Payment::where('status', 'paid')->where('created_at', '>=', $prevStart)->where('created_at', '<', $month)),
            'revenue_total'      => $usdEquiv(Payment::where('status', 'paid')),
            'year'               => $year,
            'current_month'      => (int) $now->month,   // 1-12, for highlighting the chart bar
            'monthly'            => $monthly,
        ]);
    }
}
