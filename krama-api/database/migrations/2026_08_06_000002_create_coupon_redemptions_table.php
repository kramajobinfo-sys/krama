<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupon_redemptions', function (Blueprint $table) {
            // See the coupons migration: MyISAM would void the transactional single-use
            // guarantee this table exists to enforce.
            $table->engine = 'InnoDB';

            $table->id();
            $table->unsignedBigInteger('coupon_id');
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('payment_id')->nullable();
            $table->unsignedBigInteger('subscription_id')->nullable();
            $table->decimal('discount_amount', 10, 2)->default(0);
            // A redemption is only "consumed" (counts against the coupon's limits and grants its
            // bonuses) once the linked payment is actually paid. Pending gateway payments leave
            // this null so an abandoned checkout never burns a single-use code.
            $table->timestamp('consumed_at')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['coupon_id', 'company_id']);
            $table->index(['coupon_id', 'consumed_at']);
            $table->index('payment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_redemptions');
    }
};
