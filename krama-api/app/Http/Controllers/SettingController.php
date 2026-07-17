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
        'chat' => [
            'enabled'       => 'boolean',
            'botName'       => 'string|max:80',
            'launcher'      => 'string|max:80',
            'welcome'       => 'string|max:500',
            'endpoint'      => 'nullable|url|max:255',
            'apiKey'        => 'nullable|string|max:255',
            'model'         => 'nullable|string|max:80',
            'system_prompt' => 'nullable|string|max:5000',
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
            'stripe_secret_key' => 'nullable|string|max:255',
        ],
        'homepage' => [
            'featured_companies_limit' => 'integer|min:1|max:50',
            'featured_jobs_limit'      => 'integer|min:1|max:50',
            'top_employers_limit'      => 'integer|min:1|max:50',
        ],
        'brand' => [
            'brandName'  => 'nullable|string|max:80',
            'logoUrl'    => 'nullable|string|max:65535',
            'faviconUrl' => 'nullable|string|max:65535',
            'primaryColor'   => 'nullable|string|max:20',
            'accentColor'    => 'nullable|string|max:20',
        ],
        'social' => [
            'google_enabled'     => 'boolean',
            'google_client_id'   => 'nullable|string|max:255',
            'facebook_enabled'   => 'boolean',
            'facebook_app_id'    => 'nullable|string|max:255',
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
            'ai_provider'        => 'nullable|in:claude,gemini',
            'claude_api_key'     => 'nullable|string|max:255',
            'claude_model'       => 'nullable|string|max:80',
            'gemini_api_key'     => 'nullable|string|max:255',
            'gemini_model'       => 'nullable|string|max:80',
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
    ];

    // GET /api/settings/{group} — public: safe groups only (homepage, partial chat)
    public function publicGroup($group)
    {
        $allowed = ['homepage', 'chat', 'brand', 'home_content', 'social', 'payment_config'];

        if (! in_array($group, $allowed)) {
            abort(403, 'Forbidden.');
        }

        $sensitive = ['apiKey', 'endpoint', 'system_prompt'];

        $settings = Cache::remember("public.settings.{$group}", 3600, function () use ($group, $sensitive) {
            $rows = Setting::where('group', $group)->get();
            $out  = [];
            foreach ($rows as $row) {
                if ($group === 'chat' && in_array($row->key, $sensitive)) {
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
            $settings[$row->key] = $this->castValue($row->value);
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
                $out[$row->key] = $this->castValue($row->value);
            }
            return $out;
        });

        return response()->json($all);
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

        // Validate each submitted key against its rule
        $rules = [];
        foreach ($input as $key => $_) {
            $rules[$key] = 'sometimes|' . $schema[$key];
        }
        $validated = $request->validate($rules);

        foreach ($validated as $key => $value) {
            Setting::updateOrInsert(
                ['group' => $group, 'key' => $key],
                ['value' => is_bool($value) ? (int) $value : $value]
            );
        }

        Cache::forget("public.settings.{$group}");
        if ($group === 'smtp') {
            MailConfig::forgetCache();
        }
        $this->auditLog('settings.updated', ['group' => $group, 'keys' => array_keys($validated)]);

        // Return the full updated group
        $rows = Setting::where('group', $group)->get();
        $out  = [];
        foreach ($rows as $row) {
            $out[$row->key] = $this->castValue($row->value);
        }

        return response()->json($out);
    }

    // POST /api/admin/settings/smtp/test — send a test email using current DB SMTP config
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

    // ----------------------------------------------------------------

    // Coerce stored string values back to their native types
    private function castValue($value)
    {
        if ($value === '1' || $value === '0') {
            return (bool)(int)$value;
        }
        if (is_numeric($value) && strpos($value, '.') === false) {
            return (int)$value;
        }
        return $value;
    }
}
