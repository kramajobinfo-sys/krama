<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * M-5: enforce invoice-number uniqueness at the database level so a race in the
 * boost/subscribe invoice generators can never mint two payments with the same
 * invoice_no. NULLs remain allowed (MySQL permits multiple NULLs under a UNIQUE
 * index), so payments without an invoice number are unaffected.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->unique('invoice_no', 'payments_invoice_no_unique');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique('payments_invoice_no_unique');
        });
    }
};
