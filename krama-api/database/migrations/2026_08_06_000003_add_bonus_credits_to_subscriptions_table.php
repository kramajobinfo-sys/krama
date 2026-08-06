<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Extra featured credits granted on top of the plan's pool (e.g. from a coupon).
            // Remaining = (plan.featured_credits + bonus_featured_credits) - featured_credits_used.
            $table->unsignedInteger('bonus_featured_credits')->default(0)->after('featured_credits_used');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('bonus_featured_credits');
        });
    }
};
