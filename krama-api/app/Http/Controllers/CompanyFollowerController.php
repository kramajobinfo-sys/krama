<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CompanyFollowerController extends Controller
{
    // POST /api/companies/{id}/follow
    public function follow($id)
    {
        $this->requirePermission('save_jobs');
        $user = Auth::user();

        Company::findOrFail($id);

        DB::table('company_followers')->updateOrInsert(
            ['candidate_id' => $user->id, 'company_id' => $id],
            ['created_at' => now()]
        );

        $count = DB::table('company_followers')->where('company_id', $id)->count();
        return response()->json(['following' => true, 'follower_count' => $count]);
    }

    // DELETE /api/companies/{id}/follow
    public function unfollow($id)
    {
        $this->requirePermission('save_jobs');
        $user = Auth::user();

        DB::table('company_followers')
            ->where('candidate_id', $user->id)
            ->where('company_id', $id)
            ->delete();

        $count = DB::table('company_followers')->where('company_id', $id)->count();
        return response()->json(['following' => false, 'follower_count' => $count]);
    }

    // GET /api/companies/{id}/follow
    public function status($id)
    {
        $this->requirePermission('save_jobs');
        $user = Auth::user();

        $following = DB::table('company_followers')
            ->where('candidate_id', $user->id)
            ->where('company_id', $id)
            ->exists();

        $count = DB::table('company_followers')->where('company_id', $id)->count();
        return response()->json(['following' => $following, 'follower_count' => $count]);
    }

    // GET /api/candidate/following
    public function myFollowing()
    {
        $this->requirePermission('save_jobs');
        $user = Auth::user();

        $companies = Company::whereIn('id', function ($q) use ($user) {
            $q->select('company_id')
              ->from('company_followers')
              ->where('candidate_id', $user->id);
        })
        ->with('location:id,name')
        ->select('id', 'name', 'logo_url', 'industry', 'location_id', 'is_verified', 'website')
        ->get()
        ->map(function ($c) use ($user) {
            $openJobs = \App\Models\Job::where('company_id', $c->id)
                ->where('status', 'published')->count();
            $followedAt = DB::table('company_followers')
                ->where('candidate_id', $user->id)
                ->where('company_id', $c->id)
                ->value('created_at');
            return [
                'id'           => $c->id,
                'name'         => $c->name,
                'logo_url'     => $c->logo_url,
                'industry'     => $c->industry,
                'location'     => $c->location ? $c->location->name : null,
                'is_verified'  => $c->is_verified,
                'website'      => $c->website,
                'open_jobs'    => $openJobs,
                'followed_at'  => $followedAt,
            ];
        });

        return response()->json(['data' => $companies]);
    }
}
