<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->integer('sort_order')->default(0)->after('custom_pricing');
        });

        // Seed a sensible initial order (lowest price first) so nothing shifts
        // until an admin sets explicit values.
        $order = 1;
        foreach (\App\Models\Plan::orderBy('price')->orderBy('id')->get() as $plan) {
            $plan->sort_order = $order++;
            $plan->save();
        }
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('sort_order');
        });
    }
};
