<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * VAT (Cambodia) support:
     *  - companies: the employer's own VAT registration details (opt-in → tax invoice).
     *  - payments: an immutable snapshot of the tax breakdown at the moment of payment,
     *    so an issued invoice never changes if settings/registration change later.
     * The whole feature is gated by the `tax.vat_enabled` setting (admin).
     */
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('vat_tin', 50)->nullable()->after('registration_no');       // employer VAT TIN
            $table->string('vat_legal_name', 190)->nullable()->after('vat_tin');        // registered legal name
            $table->string('vat_address', 255)->nullable()->after('vat_legal_name');    // registered address
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->boolean('is_tax_invoice')->default(false)->after('amount');
            $table->decimal('subtotal', 10, 2)->nullable()->after('is_tax_invoice');       // taxable amount (excl. VAT)
            $table->decimal('vat_rate', 5, 2)->default(0)->after('subtotal');              // e.g. 10.00
            $table->decimal('vat_amount', 10, 2)->default(0)->after('vat_rate');           // VAT charged
            $table->string('customer_vat_tin', 50)->nullable()->after('vat_amount');       // snapshot
            $table->string('customer_legal_name', 190)->nullable()->after('customer_vat_tin'); // snapshot
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['vat_tin', 'vat_legal_name', 'vat_address']);
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['is_tax_invoice', 'subtotal', 'vat_rate', 'vat_amount', 'customer_vat_tin', 'customer_legal_name']);
        });
    }
};
