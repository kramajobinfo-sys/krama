<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // KHR-per-USD rate used to print the Khmer Riel total on a tax invoice,
            // snapshotted at issue time so the invoice stays immutable (GDT requires
            // the total shown in KHR). Null on non-tax / non-USD invoices.
            $table->decimal('fx_rate', 12, 4)->nullable()->after('vat_amount');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn('fx_rate');
        });
    }
};
