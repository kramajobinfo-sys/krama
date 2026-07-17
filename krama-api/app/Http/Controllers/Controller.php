<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Log;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    /**
     * Abort with 403 unless the authenticated user holds $permission.
     * Loads role.permissions once if not already hydrated (free on subsequent calls
     * because Eloquent caches the relation on the model instance).
     */
    protected function requirePermission(string $permission): void
    {
        $user = auth()->user();

        if (! $user) {
            abort(403, 'Forbidden.');
        }

        if (! $user->relationLoaded('role') || ! optional($user->role)->relationLoaded('permissions')) {
            $user->load('role.permissions');
        }

        if (! $user->hasPermission($permission)) {
            abort(403, 'Forbidden.');
        }
    }

    protected function auditLog(string $action, array $context = []): void
    {
        Log::channel('audit')->info($action, array_merge([
            'user_id' => optional(auth()->user())->id,
            'email'   => optional(auth()->user())->email,
            'ip'      => request()->ip(),
            'ua'      => substr(request()->userAgent() ?? '', 0, 200),
        ], $context));
    }
}
