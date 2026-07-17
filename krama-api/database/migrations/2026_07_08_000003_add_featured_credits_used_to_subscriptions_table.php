<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            // Featured-listing credits spent on this subscription. Remaining =
            // plan.featured_credits - featured_credits_used.
            $table->unsignedSmallInteger('featured_credits_used')->default(0)->after('job_post_limit');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('featured_credits_used');
        });
    }
};
