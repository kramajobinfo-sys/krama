<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tracks when the "your premium slot is expiring" reminder was last emailed, so the
 * daily premium:maintain command reminds once per cycle (cleared on renewal).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->timestamp('premium_reminder_sent_at')->nullable()->after('premium_until');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('premium_reminder_sent_at');
        });
    }
};
