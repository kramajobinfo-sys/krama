<?php

namespace App\Http\Controllers;

use App\Helpers\EmailTemplates;
use App\Helpers\MailConfig;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class SettingController extends Controller
{
    // Allowed groups and their keys with simple validation rules.
    // This whitelist prevents arbitrary key creation via the API.
    private const SCHEMA = [
        // The ONE place AI credentials are configured. Every AI feature (chat agent,
        // CV match, AI job-draft) resolves through App\Services\AiConfig, so a key
        // pasted here reaches all of them. Each provider keeps its own key/model so
        // switching back and forth never discards the other one's credentials.
        'ai' => [
            'provider'       => 'nullable|in:gemini,claude',
            'gemini_api_key' => 'nullable|string|max:255',
            'gemini_model'   => 'nullable|string|max:80',
            'claude_api_key' => 'nullable|string|max:255',
            'claude_model'   => 'nullable|string|max:80',
        ],
        'chat' => [
            'enabled'        => 'boolean',
            'botName'        => 'string|max:80',
            'launcher'       => 'string|max:80',
            'welcome'        => 'string|max:500',
            'endpoint'       => 'nullable|url|max:255',
            // DEPRECATED — moved to the shared `ai` group above. Still accepted and read
            // as a fallback so existing installs keep working, but the admin UI no longer
            // writes them; having two copies of the same key is what let them drift apart.
            'provider'       => 'nullable|string|in:gemini,anthropic',
            'apiKey'         => 'nullable|string|max:255',   // Anthropic
            'model'          => 'nullable|string|max:80',    // Anthropic
            'gemini_api_key' => 'nullable|string|max:255',
            'gemini_model'   => 'nullable|string|max:80',
            'system_prompt'  => 'nullable|string|max:5000',
            // Global daily spend guards enforced by ChatController (fails closed).
            'daily_request_limit' => 'nullable|integer|min:0|max:1000000',
            'daily_token_limit'   => 'nullable|integer|min:0|max:100000000',
        ],
        // Two-sided employer referral rewards. Amounts are issued as personal single-use coupons
        // (welcome → the new employer; referrer → the person who referred them, on the referee's
        // first paid subscription). Read by App\Services\ReferralService.
        'referral' => [
            'enabled'              => 'boolean',
            'expiry_days'          => 'nullable|integer|min:1|max:3650',
            'welcome_percent_off'  => 'nullable|integer|min:0|max:100',
            'welcome_amount_off'   => 'nullable|numeric|min:0',
            'welcome_credits'      => 'nullable|integer|min:0|max:1000',
            'welcome_free_days'    => 'nullable|integer|min:0|max:3650',
            'welcome_job_posts'    => 'nullable|integer|min:0|max:1000',
            'referrer_percent_off' => 'nullable|integer|min:0|max:100',
            'referrer_amount_off'  => 'nullable|numeric|min:0',
            'referrer_credits'     => 'nullable|integer|min:0|max:1000',
            'referrer_free_days'   => 'nullable|integer|min:0|max:3650',
            'referrer_job_posts'   => 'nullable|integer|min:0|max:1000',
        ],
        'payment' => [
            'khqr_enabled'      => 'boolean',
            'aba_enabled'       => 'boolean',
            'acleda_enabled'    => 'boolean',
            'wing_enabled'      => 'boolean',
            'merchant_name'     => 'string|max:120',
            'bakong_token'      => 'nullable|string|max:4000',
            'merchant_city'     => 'nullable|string|max:80',
            'aba_merchant_id'   => 'nullable|string|max:120',
            'aba_api_key'       => 'nullable|string|max:255',
            'aba_sandbox'       => 'boolean',
            'stripe_secret_key' => 'nullable|string|max:255',
        ],
        'tax' => [
            'vat_enabled'            => 'boolean',
            'vat_rate'               => 'nullable|numeric|min:0|max:100',
            'supplier_legal_name'    => 'nullable|string|max:190',
            'supplier_legal_name_kh' => 'nullable|string|max:190',
            'supplier_vat_tin'       => 'nullable|string|max:50',
            'supplier_address'       => 'nullable|string|max:255',
            'exchange_rate_khr'      => 'nullable|numeric|min:0|max:100000',
        ],
        'seo' => [
            'google_indexing_enabled' => 'boolean',
            'google_indexing_key'     => 'nullable|string|max:8000',
        ],
        'homepage' => [
            'featured_companies_limit' => 'integer|min:1|max:50',
            'featured_jobs_limit'      => 'integer|min:1|max:50',
            'top_employers_limit'      => 'integer|min:1|max:50',
        ],
        'brand' => [
            'brandName'  => 'nullable|string|max:80',
            'logoUrl'    => 'nullable|string|max:3000000',
            'faviconUrl' => 'nullable|string|max:3000000',
            'primaryColor'   => 'nullable|string|max:20',
            'accentColor'    => 'nullable|string|max:20',
            // Public contact details (shown in the site footer / contact section).
            'phone'        => 'nullable|string|max:60',
            'contactEmail' => 'nullable|string|max:120',
            'address'      => 'nullable|string|max:300',
            // Public social links (footer icons). Blank = icon hidden.
            'telegramUrl'  => 'nullable|string|max:300',
            'facebookUrl'  => 'nullable|string|max:300',
        ],
        'social' => [
            'google_enabled'      => 'boolean',
            'google_client_id'    => 'nullable|string|max:255',
            'facebook_enabled'    => 'boolean',
            'facebook_app_id'     => 'nullable|string|max:255',
            // Used server-side only, to confirm an access token was minted for THIS app
            // (see AuthController::verifyFacebookToken). Never sent to the browser.
            'facebook_app_secret' => 'nullable|string|max:255',
        ],
        'payment_config' => [
            'data' => 'nullable|string|max:500000',
        ],
        'home_content' => [
            'data' => 'nullable|string|max:500000',
        ],
        'smtp' => [
            'enabled'      => 'boolean',
            'host'         => 'nullable|string|max:255',
            'port'         => 'nullable|integer|min:1|max:65535',
            'encryption'   => 'nullable|in:tls,ssl,',
            'username'     => 'nullable|string|max:255',
            'password'     => 'nullable|string|max:255',
            'from_address' => 'nullable|string|max:255',
            'from_name'    => 'nullable|string|max:80',
        ],
        'featured' => [
            'boost_price'    => 'numeric|min:0|max:100000',
            'boost_currency' => 'string|max:3',
            'boost_days'     => 'integer|min:1|max:365',
        ],
        'cv_match' => [
            'enabled'            => 'boolean',
            'pack_size'          => 'integer|min:1|max:100000',
            'pack_price'         => 'numeric|min:0|max:100000',
            'currency'           => 'string|max:3',
            'cost_deterministic' => 'integer|min:0|max:1000',
            'cost_ai'            => 'integer|min:0|max:1000',
            // DEPRECATED — moved to the shared `ai` group. See the note on `chat` above.
            'ai_provider'        => 'nullable|in:claude,gemini',
            'claude_api_key'     => 'nullable|string|max:255',
            'claude_model'       => 'nullable|string|max:80',
            'gemini_api_key'     => 'nullable|string|max:255',
            'gemini_model'       => 'nullable|string|max:80',
        ],
        // Support chat offered inside the employer/candidate dashboards. `mode` is the seam:
        // `telegram_link` opens a chat with the bot; `in_app` will render a message thread
        // once the Telegram bridge is built. See App\Http\Controllers\SupportController.
        'support' => [
            'enabled'           => 'boolean',   // master switch
            // Per-audience switches, so support can run for employers only, candidates
            // only, both, or neither. All default ON when the row is absent.
            'enabled_employer'  => 'boolean',
            'enabled_candidate' => 'boolean',
            'mode'             => 'nullable|in:telegram_link,in_app',
            'telegram_handle'  => 'nullable|string|max:64',   // defaults to telegram.bot_username
            // Dedicated Topics-enabled supergroup for in-app support threads (one topic per
            // user). Falls back to telegram.chat_id, which mixes support in with the
            // automated job/application notifications — set this for `in_app` mode.
            'telegram_group_id' => 'nullable|string|max:32',
            'hours'            => 'nullable|string|max:120',
            'note'             => 'nullable|string|max:300',
        ],
        'telegram' => [
            'enabled'        => 'boolean',
            'bot_token'      => 'nullable|string|max:255',
            'chat_id'        => 'nullable|string|max:64',
            'bot_username'   => 'nullable|string|max:64',
            'webhook_secret' => 'nullable|string|max:128',
        ],
        'sms' => [
            'enabled'         => 'boolean',
            'driver'          => 'nullable|in:twilio,http',
            'twilio_sid'      => 'nullable|string|max:255',
            'twilio_token'    => 'nullable|string|max:255',
            'twilio_from'     => 'nullable|string|max:32',
            'http_url'        => 'nullable|string|max:500',
            'http_method'     => 'nullable|in:GET,POST',
            'http_to_param'   => 'nullable|string|max:40',
            'http_text_param' => 'nullable|string|max:40',
            'http_extra'      => 'nullable|string|max:1000',
            'http_header'     => 'nullable|string|max:255',
        ],
        'social_post' => [
            'enabled'             => 'boolean',
            'telegram_enabled'    => 'boolean',
            'telegram_channel'    => 'nullable|string|max:128',   // @channel or -100... id (reuses the shared bot)
            'telegram_topics_enabled' => 'boolean',               // post jobs into per-category forum topics
            'telegram_forum_chat'     => 'nullable|string|max:64', // forum supergroup id (@name or -100…)
            'telegram_topic_map'      => 'nullable|string|max:8000', // JSON category→topic cache (managed by the app)
            'facebook_enabled'    => 'boolean',
            'facebook_page_id'    => 'nullable|string|max:64',
            'facebook_page_token' => 'nullable|string|max:512',
            'linkedin_enabled'    => 'boolean',
            'linkedin_token'      => 'nullable|string|max:1024',
            'linkedin_author_urn' => 'nullable|string|max:128',   // urn:li:organization:123 or urn:li:person:abc
        ],
    ];

    // Secret/credential keys that must never be overwritten with a blank value on save
    // (prevents losing a stored token when a form is submitted with the field empty).
    private const SECRET_KEYS = [
        'bot_token', 'webhook_secret',            // telegram
        'twilio_token',                            // sms
        'apiKey',                                  // chat (Anthropic key)
        'claude_api_key', 'gemini_api_key',        // cv-match engines
        'password',                                // smtp
        'bakong_token', 'aba_api_key', 'stripe_secret_key', // payment gateways
        'facebook_page_token', 'linkedin_token',   // social_post
        'facebook_app_secret',                     // social login — app secret
        'google_indexing_key',                     // seo — Google service-account JSON
    ];

    /**
     * L-1: a key is unsafe to expose on the public settings endpoint if it is an
     * internal chat config field or its name looks like a credential (token/secret/
     * password/api key). Applied to EVERY public group, not just `chat`, so a secret
     * accidentally stored in payment_config/social is never served to the world.
     */
    private static function isPublicSensitiveKey(string $key): bool
    {
        if (in_array($key, ['endpoint', 'system_prompt'], true)) {
            return true;
        }

        return (bool) preg_match('/(token|secret|password|api[_-]?key)/i', $key);
    }

    // GET /api/settings/{group} — public: safe groups only (homepage, partial chat)
    public function publicGroup($group)
    {
        $allowed = ['homepage', 'chat', 'brand', 'home_content', 'social', 'payment_config'];

        if (! in_array($group, $allowed)) {
            abort(403, 'Forbidden.');
        }

        $settings = Cache::remember("public.settings.{$group}", 3600, function () use ($group) {
            $rows = Setting::where('group', $group)->get();
            $out  = [];
            foreach ($rows as $row) {
                // L-1: never expose credentials or internal config on the PUBLIC endpoint,
                // regardless of which whitelisted group they were stored in.
                if (self::isPublicSensitiveKey($row->key)) {
                    continue;
                }
                $out[$row->key] = $this->castValue($row->value);
            }
            return $out;
        });

        return response()->json($settings)
            ->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
    }

    // GET /api/admin/settings/{group} — admin: full group including secrets
    public function adminGroup(Request $request, $group)
    {
        $this->requirePermission('site_settings');

        if (! array_key_exists($group, self::SCHEMA)) {
            abort(404, 'Unknown settings group.');
        }

        $rows = Setting::where('group', $group)->get();

        $settings = [];
        foreach ($rows as $row) {
            $settings = self::appendSetting($settings, $row);
        }

        return response()->json($settings);
    }

    // GET /api/admin/settings — admin: all groups
    public function adminAll(Request $request)
    {
        $this->requirePermission('site_settings');

        $all = Setting::all()->groupBy('group')->map(function ($rows) {
            $out = [];
            foreach ($rows as $row) {
                $out = self::appendSetting($out, $row);
            }
            return $out;
        });

        return response()->json($all);
    }

    /**
     * Add one setting row to an output array. Credentials (SECRET_KEYS) are NEVER sent to
     * the browser — the value is blanked and a companion `{key}_set` boolean signals whether
     * one is stored. Combined with the blank-preserve guard in update(), the admin UI shows
     * "configured / not set" and only overwrites a secret when a new value is typed.
     */
    private function appendSetting(array $out, $row): array
    {
        if (in_array($row->key, self::SECRET_KEYS, true)) {
            $out[$row->key]          = '';
            $out[$row->key . '_set'] = trim((string) $row->value) !== '';
        } else {
            $out[$row->key] = $this->castValue($row->value);
        }
        return $out;
    }

    // PATCH /api/admin/settings/{group} — admin: update one or many keys in a group
    public function update(Request $request, $group)
    {
        $this->requirePermission('site_settings');

        if (! array_key_exists($group, self::SCHEMA)) {
            abort(404, 'Unknown settings group.');
        }

        $schema  = self::SCHEMA[$group];
        $allowed = array_keys($schema);
        $input   = $request->only($allowed);

        if (empty($input)) {
            return response()->json(['message' => 'No recognised keys provided.'], 422);
        }

        // castValue() turns an all-digit stored value into an int when settings are READ,
        // so the admin form loads e.g. facebook_app_id as the number 878759271633172 and
        // posts it straight back — where a `string` rule rejects it ("The facebook app id
        // must be a string"). Only all-digit values are affected, which is why a Google
        // client ID (letters and dots) never tripped it. Normalise numbers to strings for
        // string-typed keys so any numeric-looking setting survives the round trip.
        foreach ($input as $key => $value) {
            if ((is_int($value) || is_float($value)) && str_contains($schema[$key], 'string')) {
                $input[$key] = (string) $value;
            }
        }
        $request->merge($input);

        // Validate each submitted key against its rule
        $rules = [];
        foreach ($input as $key => $_) {
            $rules[$key] = 'sometimes|' . $schema[$key];
        }
        $validated = $request->validate($rules);

        $written = [];
        foreach ($validated as $key => $value) {
            // Safeguard: never overwrite a stored secret (token/password/key) with a
            // blank submission — this keeps admins from losing a saved credential when a
            // form is saved with the field left empty. To change a secret, submit a new
            // non-empty value.
            if (in_array($key, self::SECRET_KEYS, true) && ($value === null || $value === '')) {
                continue;
            }
            Setting::updateOrInsert(
                ['group' => $group, 'key' => $key],
                ['value' => is_bool($value) ? (int) $value : $value]
            );
            $written[] = $key;
        }

        Cache::forget("public.settings.{$group}");
        if ($group === 'smtp') {
            MailConfig::forgetCache();
        }
        $this->auditLog('settings.updated', ['group' => $group, 'keys' => $written]);

        // Return the full updated group
        $rows = Setting::where('group', $group)->get();
        $out  = [];
        foreach ($rows as $row) {
            $out[$row->key] = $this->castValue($row->value);
        }

        return response()->json($out);
    }

    // POST /api/admin/settings/smtp/test — send a test email using current DB SMTP config
    // GET /api/admin/exchange-rate — the live NBC official USD→KHR rate plus the manual
    // fallback, so the Tax settings screen can show which rate tax invoices will use.
    public function nbcExchangeRate()
    {
        $manual = (float) (Setting::where('group', 'tax')->where('key', 'exchange_rate_khr')->value('value') ?: 0);
        $nbc    = \App\Services\ExchangeRateService::fetchFromNbc();

        return response()->json([
            'nbc_rate'  => $nbc,                                                       // riel/US$ from NBC, or null if unreachable
            'fallback'  => $manual > 0 ? $manual : 4100,                               // used when NBC is down
            'effective' => \App\Services\ExchangeRateService::usdToKhr($manual > 0 ? $manual : null),
            'source'    => $nbc ? 'nbc' : 'fallback',
        ]);
    }

    // POST /api/admin/seo/indexing/test — verify the saved Google service-account key works.
    public function testGoogleIndexing()
    {
        $this->requirePermission('site_settings');
        return response()->json(\App\Services\GoogleIndexingService::test());
    }

    public function testSmtp(Request $request)
    {
        $this->requirePermission('site_settings');

        $data = $request->validate(['email' => 'required|email|max:255']);

        if (! MailConfig::isConfigured()) {
            return response()->json(['message' => 'SMTP is not configured or not enabled. Save your settings first.'], 422);
        }

        try {
            MailConfig::applyFromDb();
            $fromName = config('mail.from.name', 'Krama');
            $html = "<div style='font-family:system-ui,sans-serif;padding:32px;max-width:600px;margin:0 auto'>
                <h2 style='color:#0d9488'>{$fromName} — SMTP Test</h2>
                <p>This is a test email confirming your SMTP configuration is working correctly.</p>
                <p style='color:#6b7280;font-size:13px'>Sent from the Krama admin panel.</p>
            </div>";
            Mail::html($html, fn ($m) => $m->to($data['email'])->subject('SMTP Test — ' . $fromName));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Send failed: ' . $e->getMessage()], 422);
        }

        return response()->json(['message' => 'Test email sent to ' . $data['email']]);
    }

    // POST /api/admin/settings/telegram/test — send a test message using current DB Telegram config
    public function testTelegram(Request $request)
    {
        $this->requirePermission('site_settings');

        $rows   = Setting::where('group', 'telegram')->pluck('value', 'key')->toArray();
        $token  = (string) ($rows['bot_token'] ?? '');
        $chatId = (string) ($rows['chat_id'] ?? '');

        if ($token === '' || $chatId === '') {
            return response()->json(['message' => 'Enter and save the bot token and chat ID first.'], 422);
        }

        $res = \App\Services\TelegramService::sendMessage(
            $token,
            $chatId,
            "✅ <b>Krama</b> — Telegram test message.\nYour bot is connected and can post to this chat."
        );

        if (! $res['ok']) {
            return response()->json(['message' => 'Telegram send failed: ' . $res['error']], 422);
        }

        return response()->json(['message' => 'Test message sent to chat ' . $chatId . '.']);
    }

    // POST /api/admin/settings/telegram/activate — validate the token, store the bot @username,
    // and register the webhook so Telegram delivers the /start deep-link presses to us.
    // Required for the employer "Connect Telegram" auto-link flow.
    public function activateTelegram(Request $request)
    {
        $this->requirePermission('site_settings');

        $token = (string) (Setting::where('group', 'telegram')->where('key', 'bot_token')->value('value') ?? '');
        if ($token === '') {
            return response()->json(['message' => 'Enter and save the bot token first.'], 422);
        }

        // 1) Validate token + read the bot username (used to build t.me deep links).
        $me = \App\Services\TelegramService::getMe($token);
        if (! $me['ok']) {
            return response()->json(['message' => 'Invalid bot token: ' . $me['error']], 422);
        }

        // 2) Ensure a webhook secret exists (verifies inbound Telegram calls).
        $secret = (string) (Setting::where('group', 'telegram')->where('key', 'webhook_secret')->value('value') ?? '');
        if ($secret === '') {
            $secret = bin2hex(random_bytes(24));
        }

        // 3) Register the webhook at <app>/api/telegram/webhook (must be public HTTPS).
        $webhookUrl = rtrim(config('app.url'), '/') . '/api/telegram/webhook';
        $hook = \App\Services\TelegramService::setWebhook($webhookUrl, $secret, $token);

        // Persist bot_username + webhook_secret regardless (username is always useful).
        Setting::updateOrInsert(['group' => 'telegram', 'key' => 'bot_username'], ['value' => $me['username']]);
        Setting::updateOrInsert(['group' => 'telegram', 'key' => 'webhook_secret'], ['value' => $secret]);
        Cache::forget('public.settings.telegram');

        if (! $hook['ok']) {
            return response()->json([
                'message'      => 'Bot verified (@' . $me['username'] . '), but webhook registration failed: ' . $hook['error']
                    . ' — this needs a public HTTPS URL, so it only works on your live domain.',
                'bot_username' => $me['username'],
                'webhook_ok'   => false,
            ], 422);
        }

        $this->auditLog('settings.telegram_activated', ['bot' => $me['username'], 'webhook' => $webhookUrl]);

        return response()->json([
            'message'      => 'Bot @' . $me['username'] . ' activated and webhook registered.',
            'bot_username' => $me['username'],
            'webhook_url'  => $webhookUrl,
            'webhook_ok'   => true,
        ]);
    }

    // POST /api/admin/settings/sms/test — send a test SMS using the current DB config
    public function testSms(Request $request)
    {
        $this->requirePermission('site_settings');

        $data  = $request->validate(['phone' => 'required|string|max:20']);
        $phone = \App\Helpers\Phone::normalize($data['phone']);
        if (! \App\Helpers\Phone::isValid($phone)) {
            return response()->json(['message' => 'Enter a valid phone number.'], 422);
        }

        if (! \App\Services\SmsService::isEnabled()) {
            return response()->json(['message' => 'SMS is not enabled. Save and enable your settings first.'], 422);
        }

        $res = \App\Services\SmsService::send($phone, 'Krama test SMS — your gateway is working.');
        if (! $res['ok']) {
            return response()->json(['message' => 'SMS send failed: ' . $res['error']], 422);
        }

        return response()->json(['message' => 'Test SMS sent to ' . $phone . '.']);
    }

    // POST /api/admin/settings/social/test — post a sample message to each
    // enabled + configured social platform, returning a per-platform result.
    public function testSocial(Request $request)
    {
        $this->requirePermission('site_settings');

        $cfg  = Setting::where('group', 'social_post')->pluck('value', 'key')->toArray();
        $on   = fn ($k) => ! empty($cfg[$k]) && (int) $cfg[$k] === 1;
        $text = "✅ Krama — social posting test.\nThis is a sample job-share message.";
        $results = [];

        if ($on('telegram_enabled')) {
            if (empty($cfg['telegram_channel']) || \App\Services\TelegramService::botToken() === '') {
                $results['telegram'] = 'Set the Telegram bot token (Telegram tab) and a channel first.';
            } else {
                try { \App\Services\SocialPostService::postTelegram(trim($cfg['telegram_channel']), $text); $results['telegram'] = 'OK'; }
                catch (\Throwable $e) { $results['telegram'] = 'Failed: ' . $e->getMessage(); }
            }
        }
        if ($on('facebook_enabled')) {
            if (empty($cfg['facebook_page_id']) || empty($cfg['facebook_page_token'])) {
                $results['facebook'] = 'Enter the Page ID and Page access token first.';
            } else {
                try { \App\Services\SocialPostService::postFacebook($cfg['facebook_page_id'], $cfg['facebook_page_token'], $text, config('app.frontend_url')); $results['facebook'] = 'OK'; }
                catch (\Throwable $e) { $results['facebook'] = 'Failed: ' . $e->getMessage(); }
            }
        }
        if ($on('linkedin_enabled')) {
            if (empty($cfg['linkedin_token']) || empty($cfg['linkedin_author_urn'])) {
                $results['linkedin'] = 'Enter the access token and author URN first.';
            } else {
                try { \App\Services\SocialPostService::postLinkedIn($cfg['linkedin_token'], $cfg['linkedin_author_urn'], $text); $results['linkedin'] = 'OK'; }
                catch (\Throwable $e) { $results['linkedin'] = 'Failed: ' . $e->getMessage(); }
            }
        }

        if (empty($results)) {
            return response()->json(['message' => 'No platforms enabled. Enable at least one and save first.'], 422);
        }

        return response()->json(['message' => 'Test complete.', 'results' => $results]);
    }

    // ----------------------------------------------------------------

    // Coerce stored string values back to their native types
    private function castValue($value)
    {
        if ($value === '1' || $value === '0') {
            return (bool)(int)$value;
        }
        if (is_numeric($value) && strpos($value, '.') === false) {
            // Leave anything past JS's safe-integer range as a string: these are always
            // identifiers (app / page / chat ids), never quantities, and JSON.parse would
            // round them and silently corrupt the value on the way back.
            if (abs((float) $value) > 9007199254740991) {
                return $value;
            }

            return (int)$value;
        }
        return $value;
    }
}
