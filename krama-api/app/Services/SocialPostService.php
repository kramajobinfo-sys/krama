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
        $req   = self::requirementsBlock($job); // "\n\n📋 Requirements:\n…" or '' — placed AFTER the apply link

        $attempted = false;

        // Telegram channel — reuses the shared bot (telegram group bot_token).
        if (self::on($cfg['telegram_enabled'] ?? null) && ! empty($cfg['telegram_channel']) && TelegramService::botToken() !== '') {
            $attempted = true;
            try { self::postTelegram(trim($cfg['telegram_channel']), $text, $url, $image, $req); }
            catch (\Throwable $e) { Log::warning('Social post (telegram) failed for job ' . $job->id . ': ' . $e->getMessage()); }
        }

        // Telegram forum group — post into the topic for the job's category (auto-created + cached).
        if (self::on($cfg['telegram_topics_enabled'] ?? null) && ! empty($cfg['telegram_forum_chat']) && TelegramService::botToken() !== '') {
            $attempted = true;
            try {
                $forum   = trim($cfg['telegram_forum_chat']);
                $threadId = self::resolveCategoryTopic($forum, $job);
                if ($threadId) self::postTelegram($forum, $text, $url, $image, $req, $threadId);
            } catch (\Throwable $e) { Log::warning('Social post (telegram topic) failed for job ' . $job->id . ': ' . $e->getMessage()); }
        }

        // Facebook Page — photo post when an image is present, else a feed link post.
        if (self::on($cfg['facebook_enabled'] ?? null) && ! empty($cfg['facebook_page_id']) && ! empty($cfg['facebook_page_token'])) {
            $attempted = true;
            try { self::postFacebook($cfg['facebook_page_id'], $cfg['facebook_page_token'], $text, $url, $image, $req); }
            catch (\Throwable $e) { Log::warning('Social post (facebook) failed for job ' . $job->id . ': ' . $e->getMessage()); }
        }

        // LinkedIn — organization or member author URN.
        if (self::on($cfg['linkedin_enabled'] ?? null) && ! empty($cfg['linkedin_token']) && ! empty($cfg['linkedin_author_urn'])) {
            $attempted = true;
            try { self::postLinkedIn($cfg['linkedin_token'], $cfg['linkedin_author_urn'], $text . "\n" . $url . $req, $image); }
            catch (\Throwable $e) { Log::warning('Social post (linkedin) failed for job ' . $job->id . ': ' . $e->getMessage()); }
        }

        // Record that the publish-time share ran, so a re-publish won't re-post.
        if ($attempted) {
            $job->forceFill(['social_posted_at' => now()])->save();
        }
    }

    public static function buildText(Job $job): string
    {
        // Banner (#1) is sent as the photo; the apply link (#8) is the inline button /
        // link. This caption carries the rest as labelled lines (empty ones are skipped).
        $company = optional($job->company)->name;
        $loc     = $job->is_remote ? 'Remote' : (optional($job->location)->name ?? '');
        $sal     = self::salary($job);

        $lines = ['🆕 We\'re hiring!', ''];
        if ($company)           $lines[] = '🏢 ' . $company;               // Company name
        $lines[]                = '💼 ' . $job->title;                     // Position
        if ($sal)               $lines[] = '💰 ' . $sal;                   // Salary
        if ($job->working_days) $lines[] = '📅 ' . $job->working_days;     // Working day
        if ($job->working_time) $lines[] = '🕐 ' . $job->working_time;     // Working time
        if ($loc)               $lines[] = '📍 ' . $loc;                   // Location
        $lines[]                = '';
        $lines[]                = '👇 Apply on Krama:';
        return implode("\n", $lines);
    }

    private static function salary(Job $job): ?string
    {
        if (! $job->salary_min && ! $job->salary_max) return null;
        $cur = $job->salary_currency ?: 'USD';
        $sym = $cur === 'USD' ? '$' : $cur . ' ';
        $per = ['hour' => '/hour', 'day' => '/day', 'month' => '/month', 'year' => '/year'][$job->salary_period] ?? '/month';
        $fmt = fn ($n) => number_format((float) $n);
        if ($job->salary_min && $job->salary_max) return $sym . $fmt($job->salary_min) . '–' . $fmt($job->salary_max) . $per;
        if ($job->salary_max) return 'Up to ' . $sym . $fmt($job->salary_max) . $per;
        return $sym . $fmt($job->salary_min) . '+' . $per;
    }

    // The Requirements section for the social caption, shown BELOW the apply link.
    // Returns '' when the job has no requirements. Leading blank line separates it from the CTA.
    public static function requirementsBlock(Job $job): string
    {
        $req = self::htmlToText($job->requirements ?? '');
        if ($req === '') return '';
        // Keep the post readable and within caption limits (Telegram caps at 1024 total).
        if (mb_strlen($req) > 600) $req = rtrim(mb_substr($req, 0, 600)) . '…';
        return "\n\n📋 Requirements:\n" . $req;
    }

    // Convert stored rich-text (sanitized HTML) into plain text suitable for a social caption:
    // list items become "• " bullets, block tags become line breaks, remaining tags are stripped.
    private static function htmlToText(?string $html): string
    {
        $s = trim((string) $html);
        if ($s === '') return '';
        $s = preg_replace('#<li[^>]*>#i', "\n• ", $s);
        $s = preg_replace('#<br\s*/?>#i', "\n", $s);
        $s = preg_replace('#</(p|div|ul|ol|h[1-6]|tr)>#i', "\n", $s);
        $s = strip_tags($s);
        $s = html_entity_decode($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $s = preg_replace('/[ \t]+/', ' ', $s);          // collapse runs of spaces
        $s = preg_replace('/ *\n */', "\n", $s);          // trim spaces around line breaks
        $s = preg_replace('/\n{3,}/', "\n\n", $s);        // collapse blank-line runs
        return trim($s);
    }

    public static function jobUrl(Job $job): string
    {
        // Canonical shareable URL — the same one the SEO layer publishes in the canonical
        // tag, sitemap and JSON-LD. The docroot .htaccess dynamic-rendering rule serves it
        // as the SPA for humans and the crawlable Blade page (OG card + JobPosting) for
        // bots, so shared links unfurl with a rich preview.
        // NOTE: must be the SLUG, not the id — /jobs/{id} 404s for crawlers.
        if (! empty($job->slug)) {
            return url('/jobs/' . $job->slug);
        }

        // Legacy fallback for any job without a slug: FRONTEND_URL?job=<id> deep link.
        $base = rtrim(config('app.frontend_url', 'http://localhost/krama'), '/');
        return $base . '?job=' . $job->id;
    }

    // ── Platform posters — throw on failure; shareJob() wraps each in try/catch ──

    public static function postTelegram(string $channel, string $text, string $url = '', ?string $image = null, string $suffix = '', ?int $threadId = null): void
    {
        $token = TelegramService::botToken();
        // Telegram rejects inline-button URLs that aren't a public http(s) address
        // (localhost / private IPs are refused with "Wrong HTTP URL"), which would fail the
        // whole send. So only use a tappable button for a public URL; otherwise fall back to
        // the link in the message text (Telegram accepts any URL as plain text).
        $publicUrl = $url !== ''
            && preg_match('#^https?://#i', $url)
            && ! preg_match('#^https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?|[^/]+\.local\b|\d{1,3}(\.\d{1,3}){3})#i', $url);
        // The shared bot sends with parse_mode=HTML, so escape &, <, > in the (plain-text)
        // message/caption — otherwise a title like "Food & Beverage" triggers a parse error.
        // The apply URL is a tappable button for a public link, or appended in-text otherwise.
        // The Requirements block ($suffix) always follows the call-to-action.
        $body   = ($publicUrl ? $text : trim($text . ($url !== '' ? "\n" . $url : ''))) . $suffix;
        $safe   = htmlspecialchars($body, ENT_NOQUOTES, 'UTF-8');
        $markup = $publicUrl ? ['inline_keyboard' => [[['text' => '👉 View & Apply on Krama', 'url' => $url]]]] : null;
        // With a banner image, post it as a photo + caption (like a hiring poster);
        // otherwise a plain text message. (Telegram caption cap is 1024 chars.)
        $res = $image
            ? TelegramService::sendPhoto($token, $channel, $image, mb_substr($safe, 0, 1024), $markup, $threadId)
            : TelegramService::sendMessage($token, $channel, $safe, $markup, $threadId);
        if (empty($res['ok'])) throw new \RuntimeException($res['error'] ?? 'telegram send failed');
    }

    // Resolve (or create + cache) the forum-topic id for a job's category. The category→topic
    // map is persisted in the social_post settings, so each topic is created once and reused.
    private static function resolveCategoryTopic(string $forumChat, Job $job): ?int
    {
        $job->loadMissing('category');
        $name = trim(optional($job->category)->name ?? '') ?: 'Other';
        $name = mb_substr($name, 0, 128); // Telegram topic-name cap
        $key  = mb_strtolower($name);

        $row = Setting::where('group', 'social_post')->where('key', 'telegram_topic_map')->first();
        $map = ($row && $row->value) ? json_decode($row->value, true) : [];
        if (! is_array($map)) $map = [];
        if (! empty($map[$key]['id'])) return (int) $map[$key]['id'];

        $res = TelegramService::createForumTopic(TelegramService::botToken(), $forumChat, $name);
        if (empty($res['ok']) || empty($res['topic_id'])) {
            Log::warning('createForumTopic failed for "' . $name . '": ' . ($res['error'] ?? 'unknown'));
            return null;
        }
        $map[$key] = ['id' => (int) $res['topic_id'], 'name' => $name];
        Setting::updateOrInsert(['group' => 'social_post', 'key' => 'telegram_topic_map'], ['value' => json_encode($map)]);
        return (int) $res['topic_id'];
    }

    public static function postFacebook(string $pageId, string $token, string $message, string $link, ?string $image = null, string $suffix = ''): void
    {
        // Photo post when an image is present (uploads the local file so it works even
        // when the URL isn't publicly reachable); otherwise a plain feed link post.
        // The Requirements block ($suffix) follows the apply link.
        if ($image) {
            $caption = $message . "\n" . $link . $suffix;
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
                ['message' => $message . "\n" . $link . $suffix, 'link' => $link, 'access_token' => $token]
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

    public static function postLinkedIn(string $token, string $authorUrn, string $text, ?string $image = null): void
    {
        $media = null;

        if ($image) {
            // LinkedIn image share is a 3-step flow: register the upload, PUT the bytes,
            // then create the post referencing the returned asset URN.
            // 1) Register upload.
            $reg = Http::timeout(15)->withToken($token)
                ->withHeaders(['X-Restli-Protocol-Version' => '2.0.0'])
                ->post('https://api.linkedin.com/v2/assets?action=registerUpload', [
                    'registerUploadRequest' => [
                        'recipes' => ['urn:li:digitalmediaRecipe:feedshare-image'],
                        'owner'   => $authorUrn,
                        'serviceRelationships' => [[
                            'relationshipType' => 'OWNER',
                            'identifier'       => 'urn:li:userGeneratedContent',
                        ]],
                    ],
                ]);
            if (! $reg->successful()) throw new \RuntimeException('linkedin registerUpload http ' . $reg->status() . ' ' . $reg->body());

            $body  = $reg->json();
            $asset = $body['value']['asset'] ?? null;
            // uploadMechanism is keyed by a dotted class name — iterate to find the uploadUrl.
            $uploadUrl = null;
            foreach (($body['value']['uploadMechanism'] ?? []) as $mech) {
                if (! empty($mech['uploadUrl'])) { $uploadUrl = $mech['uploadUrl']; break; }
            }
            if (! $asset || ! $uploadUrl) throw new \RuntimeException('linkedin registerUpload: missing asset/uploadUrl');

            // 2) Upload the image bytes to the returned URL.
            $bytes = self::readImageBytes($image);
            if ($bytes === null) throw new \RuntimeException('linkedin: could not read image bytes');
            $up = Http::timeout(30)->withToken($token)->withBody($bytes, 'application/octet-stream')->post($uploadUrl);
            if (! $up->successful()) throw new \RuntimeException('linkedin upload http ' . $up->status());

            $media = [[
                'status'      => 'READY',
                'media'       => $asset,
                'description' => ['text' => mb_substr($text, 0, 200)],
                'title'       => ['text' => 'Job opening'],
            ]];
        }

        $share = [
            'shareCommentary'    => ['text' => $text],
            'shareMediaCategory' => $media ? 'IMAGE' : 'NONE',
        ];
        if ($media) $share['media'] = $media;

        $resp = Http::timeout(15)
            ->withToken($token)
            ->withHeaders(['X-Restli-Protocol-Version' => '2.0.0'])
            ->post('https://api.linkedin.com/v2/ugcPosts', [
                'author'          => $authorUrn,
                'lifecycleState'  => 'PUBLISHED',
                'specificContent' => ['com.linkedin.ugc.ShareContent' => $share],
                'visibility'      => ['com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'],
            ]);
        if (! $resp->successful()) throw new \RuntimeException('linkedin http ' . $resp->status() . ' ' . $resp->body());
    }

    // Read an image as raw bytes — from a local file (preferred) or by fetching a URL.
    private static function readImageBytes(string $image): ?string
    {
        if (is_file($image)) {
            $bytes = @file_get_contents($image);
            return $bytes === false ? null : $bytes;
        }
        try {
            $r = Http::timeout(15)->get($image);
            return $r->successful() ? $r->body() : null;
        } catch (\Throwable $e) {
            return null;
        }
    }
}
