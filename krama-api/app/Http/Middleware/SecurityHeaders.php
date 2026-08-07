<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next)
    {
        // Generated BEFORE the response is built so Blade can stamp it onto the inline
        // <style> and the ld+json <script> (see resources/views/seo/layout.blade.php).
        $nonce = rtrim(strtr(base64_encode(random_bytes(16)), '+/', '-_'), '=');
        $request->attributes->set('cspNonce', $nonce);
        View::share('cspNonce', $nonce);

        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        // X-XSS-Protection: 0 — intentional. The auditor is removed in Chrome 78+ and
        // enabling it can introduce bypass vectors. CSP is the correct defence.
        $response->headers->set('X-XSS-Protection', '0');
        // Two policies. The API returns JSON, which needs to execute and style nothing —
        // it keeps the strictest possible policy. Server-rendered HTML (the Digital CV at
        // /cv/{token}, and the SEO pages) DOES carry an inline stylesheet and a ld+json
        // block, and a blanket "style-src 'none'" silently stripped every style from those
        // pages — the CV rendered as unstyled browser-default serif. Those two inline
        // blocks are allowed by nonce, so no 'unsafe-inline' is needed and injected markup
        // still cannot bring its own styles or scripts.
        $isHtml = str_contains((string) $response->headers->get('Content-Type'), 'text/html');

        $response->headers->set('Content-Security-Policy', $isHtml
            ? "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; "
                . "img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; "
                . "style-src 'nonce-{$nonce}' https://fonts.googleapis.com; script-src 'nonce-{$nonce}'; connect-src 'none'"
            : "default-src 'none'; script-src 'none'; style-src 'none'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self'; frame-ancestors 'none'");

        return $response;
    }
}
