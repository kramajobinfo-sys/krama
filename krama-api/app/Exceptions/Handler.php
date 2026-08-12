<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontReport = [];

    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register()
    {
        $this->reportable(function (Throwable $e) {});
    }

    public function render($request, Throwable $e)
    {
        // Always return JSON for /api routes
        if ($request->is('api/*')) {
            if ($e instanceof ValidationException) {
                return response()->json([
                    'message' => 'Validation failed.',
                    'errors'  => $e->errors(),
                ], 422);
            }

            if ($e instanceof AuthenticationException) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            // A failed findOrFail() / route-model-binding miss is a 404, not a 500. This also
            // means a record that exists but belongs to another tenant reads as "not found"
            // (our employer queries scope by company), so it never leaks existence.
            if ($e instanceof ModelNotFoundException) {
                return response()->json(['message' => 'Not found.'], 404);
            }

            // Policy/gate denials → 403.
            if ($e instanceof AuthorizationException) {
                return response()->json(['message' => $e->getMessage() ?: 'This action is unauthorized.'], 403);
            }

            if ($e instanceof HttpException) {
                return response()->json(['message' => $e->getMessage() ?: 'HTTP error.'], $e->getStatusCode());
            }

            if (config('app.debug')) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'trace'   => collect($e->getTrace())->take(5),
                ], 500);
            }

            return response()->json(['message' => 'Server error.'], 500);
        }

        return parent::render($request, $e);
    }
}
