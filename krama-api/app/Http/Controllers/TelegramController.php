<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TelegramController extends Controller
{
    // POST /api/employer/telegram/link — issue a one-time deep link the user opens to connect.
    public function link(Request $request)
    {
        $user = $request->user();

        $cfg         = Setting::where('group', 'telegram')->pluck('value', 'key')->toArray();
        $botUsername = (string) ($cfg['bot_username'] ?? '');

        if (empty($cfg['enabled']) || (int) $cfg['enabled'] !== 1 || empty($cfg['bot_token']) || $botUsername === '') {
            return response()->json(['message' => 'Telegram is not set up yet. Ask the administrator to enable and activate the bot.'], 422);
        }

        $token = Str::random(32);
        $user->telegram_link_token = $token;
        $user->save();

        return response()->json([
            'url'          => 'https://t.me/' . $botUsername . '?start=' . $token,
            'bot_username' => $botUsername,
            'connected'    => ! empty($user->telegram_chat_id),
        ]);
    }

    // GET /api/employer/telegram/status — poll after the user opens the deep link.
    public function status(Request $request)
    {
        return response()->json(['connected' => ! empty($request->user()->telegram_chat_id)]);
    }

    // POST /api/employer/telegram/unlink
    public function unlink(Request $request)
    {
        $user                      = $request->user();
        $user->telegram_chat_id    = null;
        $user->telegram_link_token = null;
        $user->save();

        return response()->json(['connected' => false]);
    }

    // POST /api/employer/telegram/test — send a test message to the linked chat.
    public function test(Request $request)
    {
        $user = $request->user();
        if (empty($user->telegram_chat_id)) {
            return response()->json(['message' => 'Connect your Telegram first.'], 422);
        }

        $ok = TelegramService::notifyChat(
            $user->telegram_chat_id,
            "✅ <b>Krama</b> — Telegram alerts connected. You'll get a message here when a candidate applies to your jobs."
        );

        if (! $ok) {
            return response()->json(['message' => 'Could not send. Make sure the bot is enabled and you have started it.'], 422);
        }

        return response()->json(['message' => 'Test message sent.']);
    }

    // POST /api/telegram/webhook — PUBLIC. Telegram delivers bot updates here.
    // Verifies the secret header, then links the chat on a "/start <token>" deep-link press.
    public function webhook(Request $request)
    {
        $secret = (string) (Setting::where('group', 'telegram')->where('key', 'webhook_secret')->value('value') ?? '');

        // Only Telegram knows the secret we set via setWebhook; reject anything else silently (200).
        if ($secret === '' || ! hash_equals($secret, (string) $request->header('X-Telegram-Bot-Api-Secret-Token'))) {
            return response()->json(['ok' => true]);
        }

        $msg    = $request->input('message');
        $text   = is_array($msg) ? (string) ($msg['text'] ?? '') : '';
        $chatId = is_array($msg) ? ($msg['chat']['id'] ?? null) : null;

        if ($chatId && preg_match('/^\/start\s+(\S+)/', $text, $m)) {
            $user = User::where('telegram_link_token', $m[1])->first();
            if ($user) {
                $user->telegram_chat_id    = (string) $chatId;
                $user->telegram_link_token = null;
                $user->save();
                TelegramService::notifyChat((string) $chatId, "✅ <b>Connected to Krama!</b>\nYou'll be notified here when a candidate applies to your jobs.");
            }
        } elseif ($chatId && preg_match('/^\/start\b/', $text)) {
            TelegramService::notifyChat((string) $chatId, "👋 Hi! To receive Krama alerts here, open your employer dashboard → My Profile → Connect Telegram.");
        }

        return response()->json(['ok' => true]);
    }
}
