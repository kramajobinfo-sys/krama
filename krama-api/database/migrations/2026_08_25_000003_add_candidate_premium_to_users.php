<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Candidate Premium — currently unlocks the full "who viewed your profile" list (free
// candidates see only the most recent few). Granted by an admin for now; a self-serve
// purchase can set the same column later.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('candidate_premium_until')->nullable()->after('profile_views_seen_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('candidate_premium_until');
        });
    }
};
