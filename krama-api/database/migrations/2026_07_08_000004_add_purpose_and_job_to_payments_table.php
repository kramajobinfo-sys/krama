<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Distinguishes subscription payments from one-off featured-job boosts.
            $table->string('purpose', 30)->default('subscription')->after('subscription_id');
            $table->unsignedBigInteger('job_id')->nullable()->after('purpose')->index();
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['purpose', 'job_id']);
        });
    }
};
