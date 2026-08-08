<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// The free plan granted to verified non-commercial organizations. It is marked with
// is_org_plan so it can be found unambiguously (not by name) and kept out of self-serve:
// is_active=false hides it from public pricing + blocks PaymentController::subscribe.
// It is assigned only by CompanyController::orgReview when an admin verifies an org.
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('plans', 'is_org_plan')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->boolean('is_org_plan')->default(false)->after('custom_pricing');
            });
        }

        // Seed exactly one org plan if none exists yet. Free ($0, no trial), unlimited
        // job posts (job_post_limit null), a few featured credits, hidden from self-serve.
        $exists = DB::table('plans')->where('is_org_plan', true)->exists();
        if (! $exists) {
            DB::table('plans')->insert([
                'name'             => 'Organization',
                'price'            => 0,
                'discount_percent' => 0,
                'currency'         => 'USD',
                'interval'         => 'month',
                'job_post_limit'   => null,   // unlimited posting for verified orgs
                'trial_days'       => null,   // free plan, not a trial (never expires)
                'featured_credits' => 3,
                'features_json'    => json_encode(['Free for verified non-profits', 'Unlimited job posts', 'Verified organization badge']),
                'is_active'        => false,  // never self-serve — assigned on verification only
                'custom_pricing'   => false,
                'is_org_plan'      => true,
                'sort_order'       => 99,
            ]);
        }
    }

    public function down(): void
    {
        // Leave the seeded plan in place (it may back live subscriptions); only drop the column.
        if (Schema::hasColumn('plans', 'is_org_plan')) {
            Schema::table('plans', function (Blueprint $table) {
                $table->dropColumn('is_org_plan');
            });
        }
    }
};
