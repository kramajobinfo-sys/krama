<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Per-recipient send failures for a campaign, so admins can export the ones that didn't
// go out (bad address, over the host's hourly cap, etc.) and re-send them later.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_campaign_failures', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->unsignedBigInteger('campaign_id');
            $table->string('email', 190);
            $table->string('name', 190)->nullable();
            $table->string('org', 190)->nullable();
            $table->string('error', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['campaign_id', 'email']);   // one row per recipient per campaign
            $table->index('campaign_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_campaign_failures');
    }
};
