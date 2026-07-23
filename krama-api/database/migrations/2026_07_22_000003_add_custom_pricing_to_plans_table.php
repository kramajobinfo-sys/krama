<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            // When true, the public pricing card shows "Custom" + a "Contact sales"
            // button (dark card) instead of the price. Previously this was inferred
            // from the plan name containing "enterprise"; now it's admin-controlled.
            $table->boolean('custom_pricing')->default(false)->after('is_active');
        });

        // Preserve current behaviour: any plan that USED to be treated as custom
        // (name contains "enterprise") keeps the treatment via the new flag.
        DB::table('plans')->whereRaw('LOWER(name) LIKE ?', ['%enterprise%'])
            ->update(['custom_pricing' => true]);
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('custom_pricing');
        });
    }
};
