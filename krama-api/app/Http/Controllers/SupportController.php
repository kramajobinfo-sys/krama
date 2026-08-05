<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Support-chat configuration for the employer and candidate dashboards.
 *
 * The dashboards ask this endpoint HOW to offer support rather than hardcoding a Telegram
 * link, so the channel can change without shipping new frontend builds. Today it answers
 * `telegram_link` (open a chat with the bot). When the in-app bridge lands it answers
 * `in_app` and the same page renders a message thread instead — no rework in the UI beyond
 * the branch that is already there.
 */
class SupportController extends Controller
{
    // GET /api/support/config — for any signed-in user (candidate or employer).
    public function config(Request $request)
    {
        $s    = Setting::where('group', 'support')->pluck('value', 'key')->toArray();
        $user = $request->user();

        $audience = self::audienceOf($user);
        $enabled  = self::enabledFor($user);

        $mode = in_array($s['mode'] ?? '', ['telegram_link', 'in_app'], true)
            ? $s['mode'] : 'telegram_link';

        // Prefer an explicit support handle; otherwise reuse the notification bot.
        $handle = trim($s['telegram_handle'] ?? '') ?: trim((string) Setting::where('group', 'telegram')
            ->where('key', 'bot_username')->value('value'));
        $handle = ltrim($handle, '@');

        $url = null;
        if ($mode === 'telegram_link' && $handle !== '' && $user) {
            // The /start payload identifies the user to whoever answers, and is signed so a
            // future webhook can trust it and resolve the account without a lookup table.
            // Telegram allows [A-Za-z0-9_-], max 64 chars.
            $url = 'https://t.me/' . $handle . '?start=' . self::supportToken($user->id);
        }

        // Nothing to open and no bridge yet → tell the UI to stay hidden rather than
        // render a dead button.
        if ($mode === 'telegram_link' && ! $url) {
            $enabled = false;
        }

        return response()->json([
            'enabled'  => $enabled,
            'mode'     => $mode,
            'url'      => $url,
            'handle'   => $handle ?: null,
            'hours'    => trim($s['hours'] ?? '') ?: null,
            'note'     => trim($s['note'] ?? '') ?: null,
            // Which audience switch applied — useful when debugging "why is it hidden?".
            'audience' => $audience,
            // Surfaced so the UI can explain the channel; not required to render.
            'telegram_ready' => TelegramService::isEnabled(),
        ]);
    }

    /** 'employer' | 'candidate' | null (staff or unknown → only the master switch applies). */
    private static function audienceOf($user): ?string
    {
        $slug = ($user && $user->role) ? (string) $user->role->slug : '';

        return in_array($slug, ['employer', 'candidate'], true) ? $slug : null;
    }

    /**
     * Master switch AND the per-audience switch. Every flag defaults ON, so support stays
     * reachable unless an admin deliberately turns it off.
     *
     * Enforced on send() as well as config(), because hiding the page in the UI is not the
     * same as disabling the feature — the endpoint is still reachable directly.
     */
    private static function enabledFor($user): bool
    {
        $s    = Setting::where('group', 'support')->pluck('value', 'key')->toArray();
        $flag = function (string $key) use ($s): bool {
            return ! array_key_exists($key, $s)
                || ! in_array($s[$key], ['0', 0, false, null], true);
        };

        $audience = self::audienceOf($user);

        return $flag('enabled') && ($audience === null || $flag('enabled_' . $audience));
    }

    // GET /api/support/thread — this user's conversation, and marks agent replies as read.
    public function thread(Request $request)
    {
        $user   = $request->user();
        $thread = DB::table('support_threads')->where('user_id', $user->id)->first();

        if (! $thread) {
            return response()->json(['messages' => [], 'unread' => 0, 'status' => 'open']);
        }

        $messages = DB::table('support_messages')->where('thread_id', $thread->id)
            ->orderBy('id')->limit(200)
            ->get(['id', 'sender', 'body', 'agent_name', 'created_at']);

        // Opening the thread clears the badge.
        if ($thread->unread_for_user > 0) {
            DB::table('support_threads')->where('id', $thread->id)->update(['unread_for_user' => 0]);
        }

        return response()->json([
            'messages' => $messages,
            'unread'   => 0,
            'status'   => $thread->status,
        ]);
    }

    // GET /api/support/unread — cheap poll for the nav badge.
    public function unread(Request $request)
    {
        return response()->json(['count' => (int) DB::table('support_threads')
            ->where('user_id', $request->user()->id)->value('unread_for_user')]);
    }

    // POST /api/support/message — store the user's message and relay it to the support group.
    public function send(Request $request)
    {
        $data = $request->validate(['body' => 'required|string|max:4000']);
        $user = $request->user();

        // Hiding the page is not disabling the feature — this endpoint is reachable directly.
        if (! self::enabledFor($user)) {
            return response()->json(['message' => 'Support chat is not available.'], 403);
        }

        $group = self::supportGroupId();
        if ($group === '') {
            return response()->json(['message' => 'Support chat is not configured yet.'], 422);
        }

        $thread = DB::table('support_threads')->where('user_id', $user->id)->first();
        if (! $thread) {
            $id = DB::table('support_threads')->insertGetId([
                'user_id' => $user->id, 'status' => 'open',
                'created_at' => now(), 'updated_at' => now(),
            ]);
            $thread = DB::table('support_threads')->find($id);
        }

        $token = TelegramService::botToken();

        // One Telegram topic per user, created lazily on the first message.
        if (! $thread->telegram_topic_id) {
            $name  = mb_substr(($user->name ?: 'User') . ' #' . $user->id, 0, 120);
            $topic = TelegramService::createForumTopic($token, $group, $name);
            if (! $topic['ok']) {
                Log::warning('Support: createForumTopic failed: ' . $topic['error'], [
                    'user_id' => $user->id, 'group' => $group,
                ]);
                return response()->json([
                    'message' => 'Support chat is temporarily unavailable. Please try again shortly.',
                ], 502);
            }
            DB::table('support_threads')->where('id', $thread->id)
                ->update(['telegram_topic_id' => $topic['topic_id'], 'updated_at' => now()]);
            $thread->telegram_topic_id = $topic['topic_id'];

            // Header post so whoever answers has the context without asking.
            TelegramService::sendMessage($token, $group, self::threadHeader($user), null, $topic['topic_id']);
        }

        $sent = TelegramService::sendMessage($token, $group, e($data['body']), null, (int) $thread->telegram_topic_id);
        if (! $sent['ok']) {
            Log::warning('Support: relay to Telegram failed: ' . $sent['error'], ['user_id' => $user->id]);
            return response()->json([
                'message' => 'Couldn’t deliver that just now. Please try again.',
            ], 502);
        }

        $msgId = DB::table('support_messages')->insertGetId([
            'thread_id' => $thread->id, 'sender' => 'user', 'body' => $data['body'],
            'telegram_message_id' => null,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('support_threads')->where('id', $thread->id)
            ->update(['last_user_at' => now(), 'status' => 'open', 'updated_at' => now()]);

        return response()->json([
            'message' => DB::table('support_messages')->find($msgId),
        ], 201);
    }

    /**
     * Called by the Telegram webhook for a message posted inside a support topic.
     * Returns true when it was stored as an agent reply.
     */
    public static function ingestAgentReply(array $msg): bool
    {
        $topicId = (int) ($msg['message_thread_id'] ?? 0);
        $text    = trim((string) ($msg['text'] ?? ''));
        $msgId   = (int) ($msg['message_id'] ?? 0);
        if (! $topicId || $text === '' || ! $msgId) {
            return false;
        }
        // The bot's own relayed messages come back through the webhook too.
        if (! empty($msg['from']['is_bot'])) {
            return false;
        }

        $thread = DB::table('support_threads')->where('telegram_topic_id', $topicId)->first();
        if (! $thread) {
            return false;
        }

        // Telegram retries updates; the unique index makes this idempotent.
        if (DB::table('support_messages')->where('telegram_message_id', $msgId)->exists()) {
            return true;
        }

        $name = trim(($msg['from']['first_name'] ?? '') . ' ' . ($msg['from']['last_name'] ?? ''));

        DB::table('support_messages')->insert([
            'thread_id' => $thread->id, 'sender' => 'agent', 'body' => $text,
            'agent_name' => mb_substr($name !== '' ? $name : 'Krama Support', 0, 80),
            'telegram_message_id' => $msgId,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('support_threads')->where('id', $thread->id)->update([
            'last_agent_at'   => now(),
            'unread_for_user' => DB::raw('unread_for_user + 1'),
            'updated_at'      => now(),
        ]);

        return true;
    }

    /** Chat id of the dedicated support group (falls back to the notification chat). */
    public static function supportGroupId(): string
    {
        $s = Setting::where('group', 'support')->pluck('value', 'key')->toArray();

        return trim($s['telegram_group_id'] ?? '') ?: trim((string) Setting::where('group', 'telegram')
            ->where('key', 'chat_id')->value('value'));
    }

    private static function threadHeader($user): string
    {
        $bits = ['🆘 <b>Support thread</b>'];
        $bits[] = 'User: <b>' . e($user->name ?: 'Unknown') . '</b> (#' . $user->id . ')';
        if ($user->email) $bits[] = 'Email: ' . e($user->email);
        if (! empty($user->phone)) $bits[] = 'Phone: ' . e($user->phone);
        $role = is_object($user->role ?? null) ? ($user->role->slug ?? '') : (string) ($user->role ?? '');
        if ($role) $bits[] = 'Role: ' . e($role);
        $bits[] = '';
        $bits[] = '<i>Reply in this topic — your messages go straight to them in Krama.</i>';

        return implode("\n", $bits);
    }

    /**
     * Opaque, signed per-user token: "s<id>-<hmac>".
     *
     * Carries the user id so support knows who is writing, plus a short HMAC so the id
     * cannot be swapped to impersonate someone else. Verify with verifySupportToken().
     */
    public static function supportToken(int $userId): string
    {
        return 's' . $userId . '-' . self::sign($userId);
    }

    /** @return int|null the user id, or null when the token is missing/tampered with. */
    public static function verifySupportToken(?string $token): ?int
    {
        if (! $token || ! preg_match('/^s(\d+)-([0-9a-f]{10})$/', $token, $m)) {
            return null;
        }
        $id = (int) $m[1];

        return hash_equals(self::sign($id), $m[2]) ? $id : null;
    }

    private static function sign(int $userId): string
    {
        return substr(hash_hmac('sha256', 'support:' . $userId, (string) config('app.key')), 0, 10);
    }
}
