<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            // When set and in the future, the job is boosted/featured. A daily
            // command clears is_featured once this passes. Null = not boosted.
            $table->timestamp('featured_until')->nullable()->after('is_featured');
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn('featured_until');
        });
    }
};
