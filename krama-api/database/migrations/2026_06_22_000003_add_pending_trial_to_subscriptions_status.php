<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE subscriptions MODIFY COLUMN status ENUM('pending','active','trial','canceled','refunded','expired') NOT NULL DEFAULT 'active'");
    }

    public function down(): void
    {
        // Back-fill any 'pending'/'trial' rows so we don't violate the old enum on rollback
        DB::statement("UPDATE subscriptions SET status = 'past_due' WHERE status IN ('pending','trial')");
        DB::statement("ALTER TABLE subscriptions MODIFY COLUMN status ENUM('active','past_due','canceled','expired') NOT NULL DEFAULT 'active'");
    }
};
