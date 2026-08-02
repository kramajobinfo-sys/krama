<?php

namespace App\Http\Controllers;

use App\Models\WaitlistSubscriber;
use Illuminate\Http\Request;

class WaitlistController extends Controller
{
    // POST /api/waitlist — PUBLIC: capture "notify me when jobs launch" from the empty state.
    public function store(Request $request)
    {
        $data = $request->validate([
            'email'   => 'required|email|max:191',
            'keyword' => 'nullable|string|max:150',
            'source'  => 'nullable|string|max:40',
        ]);

        WaitlistSubscriber::firstOrCreate(
            ['email' => strtolower(trim($data['email']))],
            ['keyword' => $data['keyword'] ?? null, 'source' => $data['source'] ?? 'find_jobs']
        );

        return response()->json(['ok' => true, 'message' => 'You’re on the list — we’ll email you when jobs go live.']);
    }
}
