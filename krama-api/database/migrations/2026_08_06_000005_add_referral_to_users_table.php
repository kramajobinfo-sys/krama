<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Every employer gets a unique shareable referral code; referred_by records who
            // referred this user (set at registration when a valid code is entered).
            $table->string('referral_code', 16)->nullable()->unique()->after('status');
            $table->unsignedBigInteger('referred_by')->nullable()->after('referral_code');
            $table->index('referred_by');
        });

        // Backfill a code for every existing employer (role_id 4 = Employer).
        $used = [];
        $employers = DB::table('users')->where('role_id', 4)->whereNull('referral_code')->pluck('id');
        foreach ($employers as $id) {
            do {
                $code = strtoupper(Str::random(8));
            } while (isset($used[$code]) || DB::table('users')->where('referral_code', $code)->exists());
            $used[$code] = true;
            DB::table('users')->where('id', $id)->update(['referral_code' => $code]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['referred_by']);
            $table->dropColumn(['referral_code', 'referred_by']);
        });
    }
};
