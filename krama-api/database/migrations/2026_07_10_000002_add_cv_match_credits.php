<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            // Prepaid CV-match credit balance (bought in packs, spent per comparison).
            $table->unsignedInteger('cv_match_credits')->default(0)->after('is_verified');
        });
        Schema::table('payments', function (Blueprint $table) {
            // For 'cv_credits' purchases: how many credits this payment grants on fulfilment.
            $table->unsignedInteger('credits')->nullable()->after('gateway_ref');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('cv_match_credits');
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('credits');
        });
    }
};
