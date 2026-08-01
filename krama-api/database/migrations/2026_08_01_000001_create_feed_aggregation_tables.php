<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Admin-configured external feeds (job or company sources).
        Schema::create('feed_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);                       // display source name, e.g. "Bongthom"
            $table->string('url', 1000);                       // feed URL
            $table->enum('kind', ['jobs', 'companies'])->default('jobs');
            $table->enum('format', ['rss', 'atom', 'jsonld', 'json'])->default('rss');
            $table->boolean('enabled')->default(true);
            $table->json('mapping')->nullable();               // optional per-feed field mapping overrides
            $table->timestamp('last_fetched_at')->nullable();
            $table->string('last_status', 20)->nullable();     // ok | error
            $table->text('last_error')->nullable();
            $table->unsignedInteger('item_count')->default(0);
            $table->timestamps();
            $table->index(['enabled', 'kind']);
        });

        // Imported external job listings (kept separate from native `jobs`).
        Schema::create('external_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feed_source_id')->constrained('feed_sources')->cascadeOnDelete();
            $table->string('external_id', 191);                // stable id from the feed (guid/link hash)
            $table->string('source_name', 120);                // denormalized for display/attribution
            $table->string('apply_url', 1000);                 // link BACK to the original listing
            $table->string('title', 255);
            $table->string('company_name', 255)->nullable();
            $table->string('location_text', 255)->nullable();
            $table->string('job_type', 40)->nullable();
            $table->string('salary_text', 120)->nullable();    // feeds rarely give structured salary
            $table->text('description_excerpt')->nullable();   // SHORT snippet only (not full copyrighted body)
            $table->timestamp('posted_at')->nullable();
            $table->timestamp('fetched_at')->nullable();
            $table->boolean('is_active')->default(true);       // false = vanished from feed on last run
            $table->timestamps();
            $table->unique(['feed_source_id', 'external_id']);
            $table->index(['is_active', 'posted_at']);
        });

        // Imported external company profiles.
        Schema::create('external_companies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feed_source_id')->constrained('feed_sources')->cascadeOnDelete();
            $table->string('external_id', 191);
            $table->string('source_name', 120);
            $table->string('profile_url', 1000);               // link BACK to the original profile
            $table->string('name', 255);
            $table->string('logo_url', 1000)->nullable();
            $table->string('industry', 120)->nullable();
            $table->string('location_text', 255)->nullable();
            $table->string('website', 500)->nullable();
            $table->text('description_excerpt')->nullable();
            $table->timestamp('fetched_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['feed_source_id', 'external_id']);
            $table->index(['is_active', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('external_companies');
        Schema::dropIfExists('external_jobs');
        Schema::dropIfExists('feed_sources');
    }
};
