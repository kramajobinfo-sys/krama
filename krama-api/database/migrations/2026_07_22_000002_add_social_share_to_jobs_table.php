<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            // Per-job opt-in for auto-sharing to social media when published.
            $table->boolean('share_social')->default(true)->after('is_featured');
            // Set once the job has been pushed to social — keeps re-publishes from re-posting.
            $table->timestamp('social_posted_at')->nullable()->after('published_at');
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn(['share_social', 'social_posted_at']);
        });
    }
};
