<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Let otp_codes carry an email as well as a phone, so e-mail sign-up can use the same
 * verify-before-create flow (code issued, account only created once it checks out).
 *
 * `phone` becomes nullable because an email code has no phone. Done with raw SQL rather
 * than ->change() so no doctrine/dbal dependency is needed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('otp_codes', function (Blueprint $table) {
            $table->string('email', 190)->nullable()->after('phone')->index();
        });

        // MODIFY keeps the existing index; ->change() would need doctrine/dbal.
        DB::statement('ALTER TABLE `otp_codes` MODIFY `phone` VARCHAR(20) NULL');
    }

    public function down(): void
    {
        // Rows with no phone can't satisfy the NOT NULL we're restoring.
        DB::table('otp_codes')->whereNull('phone')->delete();

        Schema::table('otp_codes', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropColumn('email');
        });

        DB::statement('ALTER TABLE `otp_codes` MODIFY `phone` VARCHAR(20) NOT NULL');
    }
};
