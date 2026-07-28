<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Seed a discounted Yearly plan so it exists after deploy. Idempotent: skips if any
     * yearly-interval plan already exists (e.g. one created via the admin UI), so it never
     * creates duplicates. Admins can edit its price/discount/limits afterwards in the UI.
     */
    public function up(): void
    {
        $hasYearly = DB::table('plans')->where('interval', 'year')->exists();
        if ($hasYearly) {
            return;
        }

        DB::table('plans')->insert([
            'name'             => 'Professional — Yearly',
            'price'            => 180.00,   // list price (12 × $15 monthly)
            'discount_percent' => 20,       // 20% off → $144/year effective
            'currency'         => 'USD',
            'interval'         => 'year',
            'job_post_limit'   => 20,
            'trial_days'       => null,
            'featured_credits' => 3,
            'features_json'    => json_encode(['Priority support', 'Save 20% vs monthly']),
            'is_active'        => 1,
            'custom_pricing'   => 0,
            'sort_order'       => 6,
        ]);
    }

    public function down(): void
    {
        DB::table('plans')
            ->where('name', 'Professional — Yearly')
            ->where('interval', 'year')
            ->delete();
    }
};
