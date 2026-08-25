<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Allow candidate-scoped payments (self-serve Candidate Premium). Employer payments keep
// company_id; candidate payments set candidate_id and leave company_id null.
return new class extends Migration
{
    public function up(): void
    {
        // Make company_id nullable via raw SQL (avoids the doctrine/dbal requirement for ->change()).
        DB::statement('ALTER TABLE `payments` MODIFY `company_id` BIGINT UNSIGNED NULL');

        Schema::table('payments', function (Blueprint $table) {
            $table->unsignedBigInteger('candidate_id')->nullable()->after('company_id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('candidate_id');
        });
        DB::statement('ALTER TABLE `payments` MODIFY `company_id` BIGINT UNSIGNED NOT NULL');
    }
};
