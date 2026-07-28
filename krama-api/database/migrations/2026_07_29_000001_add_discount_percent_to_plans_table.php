<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Percentage discount applied to a plan's list price at checkout.
     * 0 = no discount (full price). Used for e.g. discounted Yearly plans.
     * The amount actually charged is price * (100 - discount_percent) / 100.
     */
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->unsignedTinyInteger('discount_percent')->default(0)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('discount_percent');
        });
    }
};
