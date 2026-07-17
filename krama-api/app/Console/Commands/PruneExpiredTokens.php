<?php

namespace App\Console\Commands;

use App\Models\AuthToken;
use Illuminate\Console\Command;

class PruneExpiredTokens extends Command
{
    protected $signature = 'tokens:prune';

    protected $description = 'Delete expired rows from auth_tokens (password-reset and refresh tokens)';

    public function handle(): int
    {
        $deleted = AuthToken::where('expires_at', '<', now())->delete();

        $this->info("Pruned {$deleted} expired token(s).");

        return self::SUCCESS;
    }
}
