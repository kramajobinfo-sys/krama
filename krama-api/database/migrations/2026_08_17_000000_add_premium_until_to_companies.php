<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Premium Featured homepage slot (paid, time-boxed). A company is "premium" while
 * premium_until is in the future — mirrors jobs.featured_until for the boost flow.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->timestamp('premium_until')->nullable()->after('cover_banner_url')->index();
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropIndex(['premium_until']);
            $table->dropColumn('premium_until');
        });
    }
};
