<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            // Personal coupons (referral welcome/reward) belong to one company and are only
            // redeemable by it — surfaced pre-applied at that company's checkout. Promo coupons
            // leave this null and are typeable by anyone.
            $table->unsignedBigInteger('owner_company_id')->nullable()->after('created_by');
            $table->index('owner_company_id');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropIndex(['owner_company_id']);
            $table->dropColumn('owner_company_id');
        });
    }
};
