<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Email open/click tracking for marketing campaigns. Aggregate unique counts live on
// email_campaigns; per-recipient events (deduped per type) live in email_campaign_events.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->unsignedInteger('opens')->default(0)->after('failed_count');   // unique opens
            $table->unsignedInteger('clicks')->default(0)->after('opens');          // unique clickers
        });

        Schema::create('email_campaign_events', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('campaign_id')->index();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('type', 10);            // open | click
            $table->string('url', 1000)->nullable();
            $table->timestamp('created_at')->nullable();
            // One row per (campaign, user, type) → unique opens / unique clickers.
            $table->unique(['campaign_id', 'user_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_campaign_events');
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->dropColumn(['opens', 'clicks']);
        });
    }
};
