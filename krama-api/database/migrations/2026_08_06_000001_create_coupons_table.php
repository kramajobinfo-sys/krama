<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();            // stored uppercased; matched case-insensitively
            $table->string('label', 120)->nullable();        // admin note, e.g. "Water Festival 2026"
            $table->string('kind', 24)->default('promo');    // promo | referral_welcome | referral_reward
            $table->string('scope', 20)->default('single_use'); // single_use (one redemption ever) | per_employer (once per company)

            // Reward — any combination may be set.
            $table->unsignedTinyInteger('percent_off')->nullable();      // 1..100
            $table->decimal('amount_off', 10, 2)->nullable();
            $table->string('amount_currency', 8)->default('USD');
            $table->unsignedInteger('bonus_featured_credits')->nullable();
            $table->unsignedInteger('bonus_free_days')->nullable();

            // Constraints.
            $table->unsignedBigInteger('plan_id')->nullable();           // restrict to a single plan
            $table->decimal('min_amount', 10, 2)->nullable();            // minimum pre-VAT charge
            $table->unsignedInteger('max_redemptions')->nullable();      // null = unlimited (per_employer); single_use defaults to 1
            $table->unsignedInteger('redeemed_count')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();        // admin user id
            $table->timestamps();

            $table->index(['is_active', 'expires_at']);
            $table->index('kind');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
