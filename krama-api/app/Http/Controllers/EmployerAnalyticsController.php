<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Company;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

// Employer hiring analytics — the funnel + per-job performance for the acting employer's
// company. Read-only aggregate over the same applicant data the ATS board uses, so it's
// gated by the same `view_applicants` permission and scoped to one company only.
//
// Data-model note: we store each application's CURRENT pipeline stage, not a stage history,
// and job views are an all-time running counter (jobs.views) with no per-view log. So the
// headline funnel + views are ALL-TIME and consistent with each other; the only time-scoped
// piece is the weekly applications trend (from applications.created_at). This keeps every
// ratio honest rather than mixing an all-time views denominator with a windowed numerator.
class EmployerAnalyticsController extends Controller
{
    // Forward pipeline stages in order; 'rejected' is terminal and excluded from progression.
    private const FORWARD = ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'hired'];

    private function employerCompanyId($user): ?int
    {
        $owned = Company::where('user_id', $user->id)->value('id');
        return $owned ?: $user->company_id;
    }

    // GET /employer/analytics
    public function overview(Request $request)
    {
        $user = $request->user();
        $this->requirePermission('view_applicants');

        $companyId = $this->employerCompanyId($user);
        if (! $companyId) {
            return response()->json([
                'summary' => $this->emptySummary(),
                'funnel'  => $this->emptyFunnel(),
                'trend'   => [],
                'by_job'  => [],
            ]);
        }

        // Job ids + all-time views for this company (published or not — the employer owns them).
        $jobs = Job::where('company_id', $companyId)
            ->get(['id', 'title', 'status', 'views', 'created_at']);
        $jobIds = $jobs->pluck('id')->all();
        $totalViews = (int) $jobs->sum('views');

        // Current-stage counts across all this company's applications.
        $stageCounts = empty($jobIds) ? collect() : Application::whereIn('job_id', $jobIds)
            ->selectRaw('stage, COUNT(*) as c')->groupBy('stage')->pluck('c', 'stage');

        $totalApps = (int) $stageCounts->sum();
        $rejected  = (int) ($stageCounts['rejected'] ?? 0);

        // Funnel: cumulative "reached at least this stage" over the forward stages, from the
        // current stage. 'Applied' = every application received (incl. later-rejected ones);
        // beyond that we count only apps still on the forward track (rejected excluded, since
        // we can't know how far a rejected app progressed without a stage-history table).
        $order = array_flip(self::FORWARD); // stage => index
        $reached = function ($fromStage) use ($stageCounts, $order) {
            $min = $order[$fromStage];
            $sum = 0;
            foreach ($order as $stage => $idx) {
                if ($idx >= $min) $sum += (int) ($stageCounts[$stage] ?? 0);
            }
            return $sum;
        };

        $funnel = [
            ['key' => 'views',       'label' => 'Job views',   'count' => $totalViews],
            ['key' => 'applied',     'label' => 'Applied',     'count' => $totalApps],
            ['key' => 'reviewed',    'label' => 'Reviewed',    'count' => $reached('reviewed')],
            ['key' => 'shortlisted', 'label' => 'Shortlisted', 'count' => $reached('shortlisted')],
            ['key' => 'interview',   'label' => 'Interview',   'count' => $reached('interview')],
            ['key' => 'offered',     'label' => 'Offered',     'count' => $reached('offered')],
            ['key' => 'hired',       'label' => 'Hired',       'count' => (int) ($stageCounts['hired'] ?? 0)],
        ];

        $hires = (int) ($stageCounts['hired'] ?? 0);
        $applyRate = $totalViews > 0 ? round($totalApps / $totalViews * 100, 1) : 0.0;

        // Avg. days from apply to hire — approx: created_at → updated_at for hired apps
        // (updated_at is the last touch, which for a hired app is typically the move to hired).
        $avgDaysToHire = null;
        if (! empty($jobIds) && $hires > 0) {
            $days = Application::whereIn('job_id', $jobIds)->where('stage', 'hired')
                ->selectRaw('AVG(DATEDIFF(updated_at, created_at)) as d')->value('d');
            $avgDaysToHire = $days !== null ? round((float) $days, 1) : null;
        }

        // Weekly applications trend — last 12 weeks (buckets in PHP for DB portability).
        $trend = $this->weeklyTrend($jobIds, 12);

        // Per-job performance (all-time), sorted by applications desc.
        $appByJob = empty($jobIds) ? collect() : Application::whereIn('job_id', $jobIds)
            ->selectRaw('job_id, stage, COUNT(*) as c')->groupBy('job_id', 'stage')->get()
            ->groupBy('job_id');

        $byJob = $jobs->map(function ($j) use ($appByJob, $order) {
            $rows = $appByJob->get($j->id, collect());
            $byStage = $rows->pluck('c', 'stage');
            $apps = (int) $byStage->sum();
            $reachedInterview = 0;
            foreach ($order as $stage => $idx) {
                if ($idx >= $order['interview']) $reachedInterview += (int) ($byStage[$stage] ?? 0);
            }
            $views = (int) $j->views;
            return [
                'id'          => $j->id,
                'title'       => $j->title,
                'status'      => $j->status,
                'views'       => $views,
                'applications' => $apps,
                'interviews'  => $reachedInterview,
                'hires'       => (int) ($byStage['hired'] ?? 0),
                'apply_rate'  => $views > 0 ? round($apps / $views * 100, 1) : 0.0,
            ];
        })->sortByDesc('applications')->values()->all();

        return response()->json([
            'summary' => [
                'total_views'        => $totalViews,
                'total_applications' => $totalApps,
                'apply_rate'         => $applyRate,
                'hires'              => $hires,
                'rejected'           => $rejected,
                'active_jobs'        => (int) $jobs->where('status', 'published')->count(),
                'avg_days_to_hire'   => $avgDaysToHire,
            ],
            'funnel' => $funnel,
            'trend'  => $trend,
            'by_job' => $byJob,
        ]);
    }

    // Applications per ISO week for the last $weeks weeks (oldest → newest).
    private function weeklyTrend(array $jobIds, int $weeks): array
    {
        $start = Carbon::now()->startOfWeek()->subWeeks($weeks - 1);
        $buckets = [];
        for ($i = 0; $i < $weeks; $i++) {
            $wStart = (clone $start)->addWeeks($i);
            $buckets[$wStart->format('Y-m-d')] = 0;
        }
        if (empty($jobIds)) {
            return array_map(fn ($k) => ['week' => $k, 'count' => 0], array_keys($buckets));
        }
        $rows = Application::whereIn('job_id', $jobIds)
            ->where('created_at', '>=', $start)
            ->get(['created_at']);
        foreach ($rows as $r) {
            $key = Carbon::parse($r->created_at)->startOfWeek()->format('Y-m-d');
            if (isset($buckets[$key])) $buckets[$key]++;
        }
        $out = [];
        foreach ($buckets as $week => $count) {
            $out[] = ['week' => $week, 'count' => $count];
        }
        return $out;
    }

    private function emptySummary(): array
    {
        return [
            'total_views' => 0, 'total_applications' => 0, 'apply_rate' => 0.0,
            'hires' => 0, 'rejected' => 0, 'active_jobs' => 0, 'avg_days_to_hire' => null,
        ];
    }

    private function emptyFunnel(): array
    {
        return array_map(fn ($k) => ['key' => $k[0], 'label' => $k[1], 'count' => 0], [
            ['views', 'Job views'], ['applied', 'Applied'], ['reviewed', 'Reviewed'],
            ['shortlisted', 'Shortlisted'], ['interview', 'Interview'], ['offered', 'Offered'],
            ['hired', 'Hired'],
        ]);
    }
}
