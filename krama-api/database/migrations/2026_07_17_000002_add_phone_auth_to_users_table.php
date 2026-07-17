<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // When the phone number was confirmed via SMS OTP (null = unverified).
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
            // Phone can be used to log in, so it must be unique. MySQL allows multiple NULLs,
            // so email-only accounts (phone = null) are unaffected.
            $table->unique('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone']);
            $table->dropColumn('phone_verified_at');
        });
    }
};
