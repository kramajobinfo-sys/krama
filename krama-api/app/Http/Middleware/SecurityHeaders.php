<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        // X-XSS-Protection: 0 — intentional. The auditor is removed in Chrome 78+ and
        // enabling it can introduce bypass vectors. CSP is the correct defence.
        $response->headers->set('X-XSS-Protection', '0');
        // Restrict responses to same origin + allow images and fonts from CDN only.
        // Adjust 'img-src' and 'font-src' to match your CDN domain before going live.
        $response->headers->set(
            'Content-Security-Policy',
            "default-src 'none'; script-src 'none'; style-src 'none'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self'; frame-ancestors 'none'"
        );

        return $response;
    }
}
