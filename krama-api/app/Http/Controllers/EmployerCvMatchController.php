<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Company;
use App\Models\CvMatchRun;
use App\Models\Payment;
use App\Models\Resume;
use App\Models\Setting;
use App\Services\AiConfig;
use App\Services\CvMatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EmployerCvMatchController extends Controller
{
    // Most candidates sent to the AI in a single scoring request — matches the cap that
    // `compare` mode already enforces through validation. See aiPool().
    private const AI_BATCH_MAX = 20;

    // GET /api/employer/cv-match/candidates — this employer's applicants that have résumés.
    public function candidates(Request $request)
    {
        $this->requirePermission('view_applicants');
        $company = $this->company($request->user());

        $resumes = Resume::with('candidate:id,name,avatar_url')
            ->whereIn('candidate_id', $this->applicantCandidateIds($company->id))
            ->get()
            ->map(fn ($r) => [
                'id'        => $r->id,
                'headline'  => $r->headline,
                'skills'    => (is_array($r->data) && ! empty($r->data['skills'])) ? count($r->data['skills']) : 0,
                'candidate' => [
                    'id'         => $r->candidate->id ?? null,
                    'name'       => $r->candidate->name ?? 'Candidate',
                    'avatar_url' => $r->candidate->avatar_url ?? null,
                ],
            ])->values();

        return response()->json(['data' => $resumes]);
    }

    // GET /api/employer/cv-match/credits — balance + pricing.
    public function credits(Request $request)
    {
        $this->requirePermission('view_applicants');
        $company = $this->company($request->user());

        return response()->json(array_merge($this->pricing(), ['balance' => (int) $company->cv_match_credits]));
    }

    // POST /api/employer/cv-match/buy-credits — create a pending credit-pack payment
    // (then paid through the normal KHQR/Stripe/etc. flow; fulfilment tops up the balance).
    public function buyCredits(Request $request)
    {
        $this->requirePermission('view_applicants');
        $company = $this->company($request->user());
        $p = $this->pricing();

        if (! $p['enabled']) {
            return response()->json(['message' => 'CV match is not available.'], 422);
        }

        $payment = Payment::create([
            'company_id' => $company->id,
            'purpose'    => 'cv_credits',
            'credits'    => $p['pack_size'],
            'invoice_no' => 'CVM-' . strtoupper(Str::random(8)),
            'amount'     => $p['pack_price'],
            'currency'   => $p['currency'],
            'status'     => 'pending',
            'created_at' => now(),
        ]);

        return response()->json([
            'payment' => ['id' => $payment->id, 'amount' => $payment->amount, 'currency' => $payment->currency, 'credits' => $p['pack_size']],
        ], 201);
    }

    // POST /api/employer/cv-match/run — score the reference against the employer's applicants.
    public function run(Request $request)
    {
        $this->requirePermission('view_applicants');
        $company = $this->company($request->user());

        $data = $request->validate([
            'reference_id' => 'required|integer|exists:resumes,id',
            'engine'       => 'required|in:deterministic,ai',
            'mode'         => 'required|in:compare,suggest',
            'target_ids'   => 'required_if:mode,compare|array|max:20',
            'target_ids.*' => 'integer|exists:resumes,id',
            'limit'        => 'nullable|integer|min:1|max:20',
        ]);

        $allowed = $this->applicantCandidateIds($company->id);

        $ref = Resume::with('candidate:id,name,avatar_url')->findOrFail($data['reference_id']);
        if (! $allowed->contains($ref->candidate_id)) {
            return response()->json(['message' => 'The reference CV must be one of your applicants.'], 403);
        }

        $query = Resume::with('candidate:id,name,avatar_url')
            ->whereIn('candidate_id', $allowed)
            ->where('id', '!=', $ref->id);
        if ($data['mode'] === 'compare') {
            $query->whereIn('id', $data['target_ids']);
        }
        $candidates = $query->limit(200)->get();

        if ($candidates->isEmpty()) {
            return response()->json(['reference' => $this->refInfo($ref), 'results' => [], 'charged' => 0, 'balance' => (int) $company->cv_match_credits]);
        }

        $pricing = $this->pricing();
        if (! $pricing['enabled']) {
            return response()->json(['message' => 'CV match is not available.'], 422);
        }
        $cost    = $data['engine'] === 'ai' ? $pricing['cost_ai'] : $pricing['cost_deterministic'];
        $balance = (int) Company::where('id', $company->id)->value('cv_match_credits');

        if ($balance < $cost) {
            return response()->json(['message' => 'Not enough credits for this comparison.', 'need_credits' => true, 'balance' => $balance, 'cost' => $cost], 402);
        }

        // Run the engine first — only charge credits if it succeeds.
        if ($data['engine'] === 'ai') {
            // Credentials live in one shared place (Settings → AI provider) — see AiConfig.
            ['provider' => $provider, 'apiKey' => $apiKey, 'model' => $model] = AiConfig::resolve();

            if ($apiKey === '') {
                return response()->json(['message' => 'AI matching is not configured yet. Ask an admin to add an AI key, or use the standard compare.'], 422);
            }
            // One request scores the whole batch, so bound it — see aiPool().
            $pool = $this->aiPool($ref, $candidates);

            try {
                $ai = CvMatchService::scoreAiProvider($provider, $ref, $pool, $apiKey, $model);
            } catch (\Throwable $e) {
                // Without this the failure is invisible: the employer sees a generic 502 and
                // nothing reaches storage/logs, so a dead key looks like a flaky network.
                Log::warning('CV match (' . $provider . ') failed: ' . $e->getMessage(), [
                    'company_id' => $company->id,
                    'model'      => $model,
                    'candidates' => $pool->count(),
                ]);
                return response()->json(['message' => 'AI matching is temporarily unavailable. Please try again — you were not charged.'], 502);
            }

            // Keep only rows that name a candidate we actually asked about.
            $scored = array_intersect_key($ai, $pool->keyBy('id')->all());

            // A 2xx response whose body we can't use — truncated JSON, a safety block, or
            // ids that match nothing — must NOT be billed. Falling through would score every
            // candidate 0 and still charge full price, and persist that as an "AI" run the
            // employer can re-open from their history.
            if (! $scored) {
                Log::warning('CV match (' . $provider . ') returned no usable scores — treating as a failure, not charging.', [
                    'company_id' => $company->id,
                    'model'      => $model,
                    'candidates' => $pool->count(),
                    'rows_back'  => count($ai),
                ]);
                return response()->json(['message' => 'AI matching is temporarily unavailable. Please try again — you were not charged.'], 502);
            }

            // Partial coverage still bills (most candidates did get a real score), but say so.
            if (count($scored) < $pool->count()) {
                Log::warning('CV match (' . $provider . ') scored only ' . count($scored) . ' of ' . $pool->count() . ' candidates.', [
                    'company_id' => $company->id,
                    'model'      => $model,
                ]);
            }

            $results = $pool->map(function ($c) use ($scored) {
                $m = $scored[$c->id] ?? ['score' => 0, 'breakdown' => ['matched_skills' => [], 'missing_skills' => [], 'reason' => '']];
                return $this->rowFrom($c, $m['score'], $m['breakdown']);
            });
        } else {
            $results = $candidates->map(function ($c) use ($ref) {
                $m = CvMatchService::score($ref, $c);
                return $this->rowFrom($c, $m['score'], $m['breakdown']);
            });
        }

        $results = $results->sortByDesc('score')->values();
        if ($data['mode'] === 'suggest') {
            $results = $results->take((int) ($data['limit'] ?? 3))->values();
        }

        // Charge on success — atomic conditional decrement so two concurrent runs can't
        // both pass the earlier balance check and drive the balance negative (free AI runs).
        // Only one run whose spend still fits the live balance is charged.
        $charged = Company::where('id', $company->id)
            ->where('cv_match_credits', '>=', $cost)
            ->decrement('cv_match_credits', $cost);

        if ($charged !== 1) {
            $live = (int) Company::where('id', $company->id)->value('cv_match_credits');
            return response()->json(['message' => 'Not enough credits for this comparison.', 'need_credits' => true, 'balance' => $live, 'cost' => $cost], 402);
        }
        $newBalance = (int) Company::where('id', $company->id)->value('cv_match_credits');

        // Persist the run so the employer can re-view results later without paying again.
        $run = CvMatchRun::create([
            'company_id'         => $company->id,
            'user_id'            => $request->user()->id ?? null,
            'reference_id'       => $ref->id,
            'reference_name'     => $ref->candidate->name ?? 'Candidate',
            'reference_headline' => $ref->headline,
            'engine'             => $data['engine'],
            'mode'               => $data['mode'],
            'cost'               => $cost,
            'candidate_count'    => $results->count(),
            'top_score'          => (int) ($results->max('score') ?? 0),
            'results'            => $results->all(),
        ]);

        $this->auditLog('cv_match.run', ['company_id' => $company->id, 'engine' => $data['engine'], 'cost' => $cost, 'candidates' => $candidates->count(), 'run_id' => $run->id]);

        return response()->json([
            'reference' => $this->refInfo($ref),
            'engine'    => $data['engine'],
            'charged'   => $cost,
            'balance'   => $newBalance,
            'results'   => $results,
            'run_id'    => $run->id,
        ]);
    }

    // GET /api/employer/cv-match/history — list this company's past runs (no results payload).
    public function history(Request $request)
    {
        $this->requirePermission('view_applicants');
        $company = $this->company($request->user());

        $runs = CvMatchRun::where('company_id', $company->id)
            ->orderByDesc('id')
            ->limit(100)
            ->get(['id', 'reference_name', 'reference_headline', 'engine', 'mode', 'cost', 'candidate_count', 'top_score', 'created_at']);

        return response()->json(['data' => $runs]);
    }

    // GET /api/employer/cv-match/history/{id} — re-view a past run's full results (free, no charge).
    public function historyShow(Request $request, $id)
    {
        $this->requirePermission('view_applicants');
        $company = $this->company($request->user());

        $run = CvMatchRun::where('company_id', $company->id)->findOrFail($id);

        return response()->json([
            'reference' => ['resume_id' => $run->reference_id, 'name' => $run->reference_name, 'headline' => $run->reference_headline],
            'engine'    => $run->engine,
            'mode'      => $run->mode,
            'charged'   => 0,
            'results'   => $run->results,
            'run_id'    => $run->id,
            'created_at' => $run->created_at,
        ]);
    }

    // ---- helpers -------------------------------------------------------------

    /**
     * Candidates to send to the AI in one request.
     *
     * `compare` mode is already capped at 20 by validation, but `suggest` pulls the whole
     * applicant pool (up to 200 résumés) into a single prompt. That overruns the output
     * budget — more so now that Gemini spends part of it on thinking — and a truncated
     * JSON array silently drops candidates. So when the pool is too big, pre-rank it with
     * the free local matcher and hand the AI only the strongest: `suggest` returns a short
     * top-N anyway, and a deterministic pre-filter is a far better bound than truncation
     * at an arbitrary point.
     */
    private function aiPool(Resume $ref, $candidates)
    {
        if ($candidates->count() <= self::AI_BATCH_MAX) {
            return $candidates;
        }

        return $candidates
            ->sortByDesc(fn ($c) => CvMatchService::score($ref, $c)['score'])
            ->take(self::AI_BATCH_MAX)
            ->values();
    }

    private function company($user): Company
    {
        $c = Company::where('user_id', $user->id)->first();
        if ($c) {
            return $c;
        }
        if ($user->company_id && ($c = Company::find($user->company_id))) {
            return $c;
        }
        abort(422, 'No company profile found.');
    }

    private function applicantCandidateIds($companyId)
    {
        return Application::whereHas('job', fn ($q) => $q->where('company_id', $companyId))
            ->pluck('candidate_id')->unique()->values();
    }

    private function pricing(): array
    {
        $s = Setting::where('group', 'cv_match')->pluck('value', 'key')->toArray();
        return [
            'enabled'            => ! array_key_exists('enabled', $s) ? true : ! in_array($s['enabled'], ['0', 0, false, null], true),
            'pack_size'          => (int) ($s['pack_size'] ?? 20),
            'pack_price'         => (float) ($s['pack_price'] ?? 10),
            'currency'           => $s['currency'] ?? 'USD',
            'cost_deterministic' => (int) ($s['cost_deterministic'] ?? 1),
            'cost_ai'            => (int) ($s['cost_ai'] ?? 3),
        ];
    }

    private function rowFrom(Resume $c, int $score, array $breakdown): array
    {
        return [
            'resume_id' => $c->id,
            'candidate' => [
                'id'         => $c->candidate->id ?? null,
                'name'       => $c->candidate->name ?? 'Candidate',
                'avatar_url' => $c->candidate->avatar_url ?? null,
            ],
            'headline'  => $c->headline,
            'score'     => $score,
            'breakdown' => $breakdown,
        ];
    }

    private function refInfo(Resume $r): array
    {
        return ['resume_id' => $r->id, 'name' => $r->candidate->name ?? 'Candidate', 'headline' => $r->headline];
    }
}
