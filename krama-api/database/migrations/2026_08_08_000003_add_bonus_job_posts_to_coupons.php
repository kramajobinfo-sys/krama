<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// A fourth coupon/referral reward type: bonus job-posting quantity. A coupon (promo or referral)
// can grant extra published-job slots on top of the plan's quota. Mirrors the featured-credits
// bonus: coupons.bonus_job_posts is the reward value, payments.coupon_job_posts snapshots it at
// checkout, subscriptions.bonus_job_posts is the granted extra quota (added to the effective
// job_post_limit). Effective limit = (sub.job_post_limit ?? plan.job_post_limit) + bonus_job_posts,
// and unlimited (null) stays unlimited.
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('coupons', 'bonus_job_posts')) {
            Schema::table('coupons', function (Blueprint $table) {
                $table->unsignedInteger('bonus_job_posts')->nullable()->after('bonus_free_days');
            });
        }
        if (! Schema::hasColumn('subscriptions', 'bonus_job_posts')) {
            Schema::table('subscriptions', function (Blueprint $table) {
                $table->unsignedInteger('bonus_job_posts')->default(0)->after('bonus_featured_credits');
            });
        }
        if (! Schema::hasColumn('payments', 'coupon_job_posts')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->unsignedInteger('coupon_job_posts')->default(0)->after('coupon_free_days');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('coupons', 'bonus_job_posts')) {
            Schema::table('coupons', fn (Blueprint $t) => $t->dropColumn('bonus_job_posts'));
        }
        if (Schema::hasColumn('subscriptions', 'bonus_job_posts')) {
            Schema::table('subscriptions', fn (Blueprint $t) => $t->dropColumn('bonus_job_posts'));
        }
        if (Schema::hasColumn('payments', 'coupon_job_posts')) {
            Schema::table('payments', fn (Blueprint $t) => $t->dropColumn('coupon_job_posts'));
        }
    }
};
