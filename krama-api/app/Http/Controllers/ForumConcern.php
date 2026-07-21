<?php

namespace App\Http\Controllers;

use App\Models\ForumVote;
use App\Models\Notification;
use App\Models\Setting;
use App\Models\User;

/**
 * Shared helpers for the forum controllers: config gating, optional auth on
 * public routes, upvote toggling, and @mention notification parsing.
 */
trait ForumConcern
{
    private ?array $forumCfg = null;

    protected function forumConfig(): array
    {
        if ($this->forumCfg === null) {
            $this->forumCfg = Setting::where('group', 'forum')->pluck('value', 'key')->toArray();
        }
        return $this->forumCfg;
    }

    protected function forumEnabledOrAbort(): void
    {
        $cfg = $this->forumConfig();
        // default ON if the row is somehow absent
        if (array_key_exists('enabled', $cfg) && ! (bool) $cfg['enabled']) {
            abort(403, 'The community forum is currently disabled.');
        }
    }

    // On public read routes (no auth:api middleware), honour allow_guest_read:
    // if guests may not read, a valid token is still accepted via the api guard.
    protected function guestReadOrAbort(): void
    {
        $cfg = $this->forumConfig();
        $allowGuest = ! array_key_exists('allow_guest_read', $cfg) || (bool) $cfg['allow_guest_read'];
        if (! $allowGuest && ! $this->optionalUser()) {
            abort(401, 'Please log in to view the community.');
        }
    }

    // Resolve the authenticated user from a JWT if one was sent, even on a
    // route without the auth:api middleware. Returns null for guests.
    protected function optionalUser(): ?User
    {
        try {
            return auth('api')->user();
        } catch (\Throwable $e) {
            return null;
        }
    }

    protected function minBodyLen(): int
    {
        $cfg = $this->forumConfig();
        return max(1, (int) ($cfg['min_body_len'] ?? 10));
    }

    /**
     * Toggle an upvote for the current user on a thread/reply and keep the
     * cached vote_score in sync. Returns ['score' => int, 'voted' => bool].
     */
    protected function toggleVote(string $type, $model): array
    {
        $userId = auth()->id();
        $existing = ForumVote::where('user_id', $userId)
            ->where('votable_type', $type)
            ->where('votable_id', $model->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $model->decrement('vote_score');
            $voted = false;
        } else {
            ForumVote::create([
                'user_id'      => $userId,
                'votable_type' => $type,
                'votable_id'   => $model->id,
                'value'        => 1,
            ]);
            $model->increment('vote_score');
            $voted = true;
        }

        return ['score' => (int) $model->fresh()->vote_score, 'voted' => $voted];
    }

    // Which of the given votable ids the current user has upvoted (for UI state).
    protected function votedIds(string $type, array $ids): array
    {
        if (! $ids || ! auth()->check()) return [];
        return ForumVote::where('user_id', auth()->id())
            ->where('votable_type', $type)
            ->whereIn('votable_id', $ids)
            ->pluck('votable_id')->all();
    }

    /**
     * Parse @[Name](userId) mention tokens from a body and notify those users.
     * Skips the actor themselves. Safe no-op when nothing matches.
     */
    protected function notifyMentions(string $body, int $actorId, string $actorName, string $threadTitle): void
    {
        if (! preg_match_all('/@\[[^\]]+\]\((\d+)\)/', $body, $m)) return;

        $ids = array_unique(array_map('intval', $m[1]));
        foreach ($ids as $id) {
            if ($id === $actorId) continue;
            if (! User::whereKey($id)->exists()) continue;
            Notification::record(
                $id,
                'forum_mention',
                $actorName . ' mentioned you',
                'in "' . $threadTitle . '"'
            );
        }
    }
}
