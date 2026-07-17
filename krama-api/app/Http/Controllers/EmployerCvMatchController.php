<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Company;
use App\Models\CvMatchRun;
use App\Models\Payment;
use App\Models\Resume;
use App\Models\Setting;
use App\Services\CvMatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class EmployerCvMatchController extends Controller
{
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
            $cvm      = Setting::where('group', 'cv_match')->pluck('value', 'key')->toArray();
            $provider = trim($cvm['ai_provider'] ?? '') === 'gemini' ? 'gemini' : 'claude';

            if ($provider === 'gemini') {
                $apiKey = trim($cvm['gemini_api_key'] ?? '');
                $model  = trim($cvm['gemini_model'] ?? '') ?: 'gemini-2.0-flash';
            } else {
                // Prefer a Claude key configured directly on the CV Match card;
                // fall back to the Chat agent's key for backward compatibility.
                $chat   = Setting::where('group', 'chat')->pluck('value', 'key')->toArray();
                $apiKey = trim($cvm['claude_api_key'] ?? '') ?: trim($chat['apiKey'] ?? '');
                $model  = trim($cvm['claude_model'] ?? '') ?: (trim($chat['model'] ?? '') ?: 'claude-haiku-4-5');
            }

            if ($apiKey === '') {
                return response()->json(['message' => 'AI matching is not configured yet. Ask an admin to add an AI key, or use the standard compare.'], 422);
            }
            try {
                $ai = CvMatchService::scoreAiProvider($provider, $ref, $candidates, $apiKey, $model);
            } catch (\Exception $e) {
                return response()->json(['message' => 'AI matching is temporarily unavailable. Please try again — you were not charged.'], 502);
            }
            $results = $candidates->map(function ($c) use ($ai) {
                $m = $ai[$c->id] ?? ['score' => 0, 'breakdown' => ['matched_skills' => [], 'missing_skills' => [], 'reason' => '']];
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

        // Charge on success.
        Company::where('id', $company->id)->decrement('cv_match_credits', $cost);
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
