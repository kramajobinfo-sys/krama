<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Snapshot of the coupon applied to this payment, so the reward can be granted when a
            // gateway payment is later confirmed, and the invoice can itemise the discount.
            $table->string('coupon_code', 40)->nullable()->after('fx_rate');
            $table->decimal('coupon_discount', 10, 2)->default(0)->after('coupon_code');
            $table->unsignedInteger('coupon_credits')->default(0)->after('coupon_discount');
            $table->unsignedInteger('coupon_free_days')->default(0)->after('coupon_credits');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['coupon_code', 'coupon_discount', 'coupon_credits', 'coupon_free_days']);
        });
    }
};
