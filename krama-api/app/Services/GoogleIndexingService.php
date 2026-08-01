<?php

namespace App\Services;

use App\Models\Job;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Push URL updates to the Google Indexing API so job pages appear in / disappear from
 * Google for Jobs quickly (Google recommends this for JobPosting/BroadcastEvent content).
 *
 * Config lives in the `seo` settings group: `google_indexing_enabled` (bool) and
 * `google_indexing_key` (a Google Cloud service-account JSON key). The service account must
 * be added as an Owner of the site in Google Search Console. Auth uses a self-signed RS256
 * JWT (via openssl — no external package) exchanged for an OAuth2 token; the token is cached.
 *
 * All calls are best-effort and non-fatal: a failure only logs, it never blocks a job action.
 */
class GoogleIndexingService
{
    private const TOKEN_URL = 'https://oauth2.googleapis.com/token';
    private const PUBLISH_URL = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
    private const SCOPE = 'https://www.googleapis.com/auth/indexing';

    /** The decoded service-account key array, or null when not configured. */
    private static function key(): ?array
    {
        $s = Setting::where('group', 'seo')->pluck('value', 'key')->toArray();
        if (empty($s['google_indexing_enabled']) || (int) $s['google_indexing_enabled'] !== 1) {
            return null;
        }
        $raw = (string) ($s['google_indexing_key'] ?? '');
        if ($raw === '') return null;

        $data = json_decode($raw, true);
        return (is_array($data) && ! empty($data['client_email']) && ! empty($data['private_key'])) ? $data : null;
    }

    public static function enabled(): bool
    {
        return self::key() !== null;
    }

    /** Notify Google about a job page. $type = 'URL_UPDATED' | 'URL_DELETED'. Best-effort. */
    public static function notifyJob(Job $job, string $type): void
    {
        if (! $job->slug) return;
        self::publish(url('/jobs/' . $job->slug), $type);
    }

    /** Publish a single URL notification. Silently no-ops when disabled or the URL isn't public. */
    public static function publish(string $url, string $type = 'URL_UPDATED'): bool
    {
        // Google only accepts verified, publicly reachable https URLs — skip localhost/dev.
        if (! preg_match('#^https?://#i', $url) || preg_match('#localhost|127\.0\.0\.1|\.local(?::|/|$)#i', $url)) {
            return false;
        }
        $token = self::accessToken();
        if (! $token) return false;

        try {
            $resp = Http::withToken($token)->timeout(10)->post(self::PUBLISH_URL, [
                'url'  => $url,
                'type' => $type,
            ]);
            if (! $resp->successful()) {
                Log::warning('google_indexing.publish_failed', ['status' => $resp->status(), 'body' => $resp->body(), 'url' => $url]);
                return false;
            }
            return true;
        } catch (\Throwable $e) {
            Log::warning('google_indexing.publish_error', ['error' => $e->getMessage(), 'url' => $url]);
            return false;
        }
    }

    /** OAuth2 access token from the service account (cached ~55 min). Null when unavailable. */
    public static function accessToken(): ?string
    {
        $key = self::key();
        if (! $key) return null;

        $cacheKey = 'google_indexing.token.' . md5($key['client_email']);
        if ($cached = Cache::get($cacheKey)) return $cached;

        try {
            $now = time();
            $header = ['alg' => 'RS256', 'typ' => 'JWT'];
            $claim  = [
                'iss'   => $key['client_email'],
                'scope' => self::SCOPE,
                'aud'   => self::TOKEN_URL,
                'iat'   => $now,
                'exp'   => $now + 3600,
            ];
            $b64 = fn ($d) => rtrim(strtr(base64_encode(json_encode($d)), '+/', '-_'), '=');
            $signingInput = $b64($header) . '.' . $b64($claim);

            $signature = '';
            if (! openssl_sign($signingInput, $signature, $key['private_key'], OPENSSL_ALGO_SHA256)) {
                Log::warning('google_indexing.sign_failed');
                return null;
            }
            $jwt = $signingInput . '.' . rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');

            $resp = Http::asForm()->timeout(10)->post(self::TOKEN_URL, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion'  => $jwt,
            ]);
            if (! $resp->successful() || ! $resp->json('access_token')) {
                Log::warning('google_indexing.token_failed', ['status' => $resp->status(), 'body' => $resp->body()]);
                return null;
            }
            $token = $resp->json('access_token');
            Cache::put($cacheKey, $token, now()->addMinutes(55));
            return $token;
        } catch (\Throwable $e) {
            Log::warning('google_indexing.token_error', ['error' => $e->getMessage()]);
            return null;
        }
    }

    /** For the admin "Test connection" button. Returns ['ok'=>bool, 'message'=>string]. */
    public static function test(): array
    {
        $s = Setting::where('group', 'seo')->pluck('value', 'key')->toArray();
        if (empty($s['google_indexing_key'])) {
            return ['ok' => false, 'message' => 'No service-account key saved yet.'];
        }
        $data = json_decode((string) $s['google_indexing_key'], true);
        if (! is_array($data) || empty($data['client_email']) || empty($data['private_key'])) {
            return ['ok' => false, 'message' => 'The key is not a valid service-account JSON (needs client_email + private_key).'];
        }
        // Temporarily treat as enabled for the token attempt regardless of the toggle.
        $token = self::accessTokenFor($data);
        return $token
            ? ['ok' => true, 'message' => 'Connected — obtained a Google access token for ' . $data['client_email'] . '. Make sure this account is an Owner of your site in Search Console.']
            : ['ok' => false, 'message' => 'Could not get a Google token. Check the key is valid and the Indexing API is enabled in Google Cloud.'];
    }

    /** Token attempt for an explicit key (used by test, bypassing the enabled toggle). */
    private static function accessTokenFor(array $key): ?string
    {
        try {
            $now = time();
            $b64 = fn ($d) => rtrim(strtr(base64_encode(json_encode($d)), '+/', '-_'), '=');
            $signingInput = $b64(['alg' => 'RS256', 'typ' => 'JWT']) . '.' . $b64([
                'iss' => $key['client_email'], 'scope' => self::SCOPE, 'aud' => self::TOKEN_URL, 'iat' => $now, 'exp' => $now + 3600,
            ]);
            $signature = '';
            if (! openssl_sign($signingInput, $signature, $key['private_key'], OPENSSL_ALGO_SHA256)) return null;
            $jwt = $signingInput . '.' . rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
            $resp = Http::asForm()->timeout(10)->post(self::TOKEN_URL, [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion' => $jwt,
            ]);
            return $resp->successful() ? $resp->json('access_token') : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
