<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Generic external-gateway reference (currently the Stripe Checkout Session id,
            // used to verify the payment via GET /v1/checkout/sessions/{id}).
            $table->string('gateway_ref', 255)->nullable()->after('md5');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('gateway_ref');
        });
    }
};
