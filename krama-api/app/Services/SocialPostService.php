<?php

namespace App\Services;

use App\Models\Job;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Auto-share a newly-published job to social media (Telegram channel,
 * Facebook Page, LinkedIn). Config lives in the admin-only `social_post`
 * settings group. Every send is non-blocking — a failure is logged and never
 * breaks the job-publish flow.
 */
class SocialPostService
{
    public static function settings(): array
    {
        return Setting::where('group', 'social_post')->pluck('value', 'key')->toArray();
    }

    private static function on($v): bool
    {
        return ! empty($v) && (int) $v === 1;
    }

    /**
     * Share a job once, at publish time. No-op unless the feature is enabled,
     * the job opted in (share_social), and it hasn't been shared already.
     */
    public static function shareJob(Job $job): void
    {
        $cfg = self::settings();
        if (! self::on($cfg['enabled'] ?? null)) return;
        if (! $job->share_social) return;
        if ($job->social_posted_at) return;

        $job->loadMissing('company', 'location');
        $text  = self::buildText($job);
        $url   = self::jobUrl($job);
        $image = self::imageForJob($job); // local file path (preferred), public URL, or null

        $attempted = false;

        // Telegram channel — reuses the shared bot (telegram group bot_token).
        if (self::on($cfg['telegram_enabled'] ?? null) && ! empty($cfg['telegram_channel']) && TelegramService::botToken() !== '') {
            $attempted = true;
            try { self::postTelegram(trim($cfg['telegram_channel']), $text . "\n" . $url, $image); }
            catch (\Throwable $e) { Log::warning('Social post (telegram) failed for job ' . $job->id . ': ' . $e->getMessage()); }
        }

        // Facebook Page — photo post when an image is present, else a feed link post.
        if (self::on($cfg['facebook_enabled'] ?? null) && ! empty($cfg['facebook_page_id']) && ! empty($cfg['facebook_page_token'])) {
            $attempted = true;
            try { self::postFacebook($cfg['facebook_page_id'], $cfg['facebook_page_token'], $text, $url, $image); }
            catch (\Throwable $e) { Log::warning('Social post (facebook) failed for job ' . $job->id . ': ' . $e->getMessage()); }
        }

        // LinkedIn — organization or member author URN.
        if (self::on($cfg['linkedin_enabled'] ?? null) && ! empty($cfg['linkedin_token']) && ! empty($cfg['linkedin_author_urn'])) {
            $attempted = true;
            try { self::postLinkedIn($cfg['linkedin_token'], $cfg['linkedin_author_urn'], $text . "\n" . $url); }
            catch (\Throwable $e) { Log::warning('Social post (linkedin) failed for job ' . $job->id . ': ' . $e->getMessage()); }
        }

        // Record that the publish-time share ran, so a re-publish won't re-post.
        if ($attempted) {
            $job->forceFill(['social_posted_at' => now()])->save();
        }
    }

    public static function buildText(Job $job): string
    {
        $company = optional($job->company)->name;
        $loc     = $job->is_remote ? 'Remote' : (optional($job->location)->name ?? '');

        $lines = ['🆕 ' . $job->title . ($company ? ' at ' . $company : '')];
        $meta  = [];
        if ($loc) $meta[] = '📍 ' . $loc;
        $sal = self::salary($job);
        if ($sal) $meta[] = '💰 ' . $sal;
        if ($meta) $lines[] = implode('  ·  ', $meta);
        $lines[] = '👇 Apply on Krama:';
        return implode("\n", $lines);
    }

    private static function salary(Job $job): ?string
    {
        if (! $job->salary_min && ! $job->salary_max) return null;
        $cur = $job->salary_currency ?: 'USD';
        $sym = $cur === 'USD' ? '$' : $cur . ' ';
        $per = ['hour' => '/hr', 'day' => '/day', 'month' => '/mo', 'year' => '/yr'][$job->salary_period] ?? '/mo';
        $fmt = fn ($n) => number_format((float) $n);
        if ($job->salary_min && $job->salary_max) return $sym . $fmt($job->salary_min) . '–' . $fmt($job->salary_max) . $per;
        if ($job->salary_max) return 'Up to ' . $sym . $fmt($job->salary_max) . $per;
        return $sym . $fmt($job->salary_min) . '+' . $per;
    }

    public static function jobUrl(Job $job): string
    {
        // FRONTEND_URL is the public index.html; the SPA reads ?job=<id> as a deep link.
        $base = rtrim(config('app.frontend_url', 'http://localhost/krama'), '/');
        return $base . '?job=' . $job->id;
    }

    // ── Platform posters — throw on failure; shareJob() wraps each in try/catch ──

    public static function postTelegram(string $channel, string $text, ?string $image = null): void
    {
        // The shared bot sends with parse_mode=HTML, so escape &, <, > in the
        // (plain-text) message/caption — otherwise a job title like "Food & Beverage"
        // makes Telegram reject the whole message with a parse error.
        $safe  = htmlspecialchars($text, ENT_NOQUOTES, 'UTF-8');
        $token = TelegramService::botToken();
        // With a banner image, post it as a photo + caption (like a hiring poster);
        // otherwise a plain text message. (Telegram caption cap is 1024 chars.)
        $res = $image
            ? TelegramService::sendPhoto($token, $channel, $image, mb_substr($safe, 0, 1024))
            : TelegramService::sendMessage($token, $channel, $safe);
        if (empty($res['ok'])) throw new \RuntimeException($res['error'] ?? 'telegram send failed');
    }

    public static function postFacebook(string $pageId, string $token, string $message, string $link, ?string $image = null): void
    {
        // Photo post when an image is present (uploads the local file so it works even
        // when the URL isn't publicly reachable); otherwise a plain feed link post.
        if ($image) {
            $caption = $message . "\n" . $link;
            $endpoint = 'https://graph.facebook.com/v19.0/' . $pageId . '/photos';
            if (is_file($image)) {
                $resp = Http::timeout(20)->attach('source', file_get_contents($image), basename($image))
                    ->post($endpoint, ['caption' => $caption, 'access_token' => $token]);
            } else {
                $resp = Http::timeout(20)->asForm()->post($endpoint, ['url' => $image, 'caption' => $caption, 'access_token' => $token]);
            }
        } else {
            $resp = Http::timeout(12)->asForm()->post(
                'https://graph.facebook.com/v19.0/' . $pageId . '/feed',
                ['message' => $message . "\n" . $link, 'link' => $link, 'access_token' => $token]
            );
        }
        if (! $resp->successful()) throw new \RuntimeException('facebook http ' . $resp->status() . ' ' . $resp->body());
    }

    // Resolve a job's social image to a local file path (preferred — lets us upload
    // the bytes so delivery works even when the URL isn't public) or fall back to the
    // stored URL. Returns null when the job has no image.
    private static function imageForJob(Job $job): ?string
    {
        $img = $job->social_image;
        if (! $img) return null;
        $path  = parse_url($img, PHP_URL_PATH) ?: $img;
        $local = public_path('uploads/' . basename($path));
        return is_file($local) ? $local : $img;
    }

    public static function postLinkedIn(string $token, string $authorUrn, string $text): void
    {
        $resp = Http::timeout(12)
            ->withToken($token)
            ->withHeaders(['X-Restli-Protocol-Version' => '2.0.0'])
            ->post('https://api.linkedin.com/v2/ugcPosts', [
                'author'          => $authorUrn,
                'lifecycleState'  => 'PUBLISHED',
                'specificContent' => [
                    'com.linkedin.ugc.ShareContent' => [
                        'shareCommentary'    => ['text' => $text],
                        'shareMediaCategory' => 'NONE',
                    ],
                ],
                'visibility' => ['com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'],
            ]);
        if (! $resp->successful()) throw new \RuntimeException('linkedin http ' . $resp->status() . ' ' . $resp->body());
    }
}
