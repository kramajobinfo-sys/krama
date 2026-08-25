<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// "Who viewed your profile" — one row per (candidate, viewing company); the count and
// last_viewed_at are upserted as an employer re-opens the candidate's profile.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profile_views', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('candidate_id')->index();
            $table->unsignedBigInteger('company_id')->index();
            $table->unsignedInteger('view_count')->default(1);
            $table->timestamp('first_viewed_at')->nullable();
            $table->timestamp('last_viewed_at')->nullable()->index();
            $table->timestamps();
            $table->unique(['candidate_id', 'company_id']);
        });

        // When the candidate last opened their "who viewed you" list — powers the "N new" badge.
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('profile_views_seen_at')->nullable()->after('company_role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profile_views');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('profile_views_seen_at');
        });
    }
};
