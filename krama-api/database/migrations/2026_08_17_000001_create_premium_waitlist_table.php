<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Waitlist for Premium Featured homepage slots — employers join when all slots are
 * taken. One row per company (unique). No FK cascade (prod defaults to MyISAM), so
 * pinned to InnoDB and cleaned up in code when a company buys / is comped.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('premium_waitlist', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->unsignedBigInteger('company_id')->unique();
            $table->timestamp('notified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('premium_waitlist');
    }
};
