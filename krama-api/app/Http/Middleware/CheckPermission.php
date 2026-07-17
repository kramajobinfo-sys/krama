<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission)
    {
        $user = auth()->user();

        if (! $user) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Load role.permissions if not already on this request's user instance.
        // hasPermission() checks relationLoaded('permissions'), so this must be
        // done explicitly — Eloquent does not load nested relations automatically.
        // Loading here once means downstream controllers get the relation for free
        // from Eloquent's in-memory cache (no extra DB round-trip).
        if (! $user->relationLoaded('role') || ! optional($user->role)->relationLoaded('permissions')) {
            $user->load('role.permissions');
        }

        if (! $user->hasPermission($permission)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
