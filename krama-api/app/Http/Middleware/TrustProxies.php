<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * The trusted proxies for this application.
     *
     * @var array<int, string>|string|null
     */
    // Trust the shared-host reverse proxy (cPanel/LiteSpeed terminates TLS and
    // forwards X-Forwarded-Proto: https). Without this, $request->isSecure() is
    // false behind the proxy, so $request->url() / asset() build http:// URLs —
    // which an https page blocks as mixed content (e.g. uploaded banner images).
    protected $proxies = '*';

    /**
     * The headers that should be used to detect proxies.
     *
     * NOTE: X-Forwarded-For is deliberately NOT trusted. With $proxies='*' (needed so the
     * shared-host proxy's X-Forwarded-Proto is honored for correct https URLs) trusting
     * X-Forwarded-For would let any client spoof their IP via that header — which would
     * defeat the IP-keyed brute-force/OTP rate limiters and forge the IP in audit logs.
     * Dropping it means $request->ip() is always the real connection IP (REMOTE_ADDR).
     * If a CDN (e.g. Cloudflare) is ever placed in front, set $proxies to its IP ranges
     * and re-add HEADER_X_FORWARDED_FOR so per-client IPs resolve correctly again.
     *
     * @var int
     */
    protected $headers =
        Request::HEADER_X_FORWARDED_HOST |
        Request::HEADER_X_FORWARDED_PORT |
        Request::HEADER_X_FORWARDED_PROTO |
        Request::HEADER_X_FORWARDED_AWS_ELB;
}
