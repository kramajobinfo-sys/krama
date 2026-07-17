<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── roles ──────────────────────────────────────────────────────────────
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
        });

        // ── permissions ────────────────────────────────────────────────────────
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique();
            $table->string('area', 50);
            $table->string('label', 100);
        });

        // ── role_permissions (pivot) ───────────────────────────────────────────
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('permission_id');
            $table->primary(['role_id', 'permission_id']);
        });

        // ── auth_tokens ────────────────────────────────────────────────────────
        Schema::create('auth_tokens', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('type', 20)->default('refresh');
            $table->string('token_hash', 255);
            $table->timestamp('expires_at');
            $table->timestamp('created_at')->nullable();
        });

        // ── categories ─────────────────────────────────────────────────────────
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 120)->unique();
            $table->string('icon', 60)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
        });

        // ── locations ──────────────────────────────────────────────────────────
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->enum('type', ['country', 'province', 'city'])->default('city');
            $table->string('name', 120);
        });

        // ── companies ──────────────────────────────────────────────────────────
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('name', 255);
            $table->string('registration_no', 100)->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('website', 500)->nullable();
            $table->string('address', 500)->nullable();
            $table->unsignedBigInteger('location_id')->nullable()->index();
            $table->string('logo_url', 500)->nullable();
            $table->longText('description')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'suspended'])->default('pending');
            $table->boolean('is_verified')->default(false);
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });

        // ── jobs ───────────────────────────────────────────────────────────────
        // experience_level starts as ENUM; 2026_06_20_080538 converts it to VARCHAR
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->index();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->unsignedBigInteger('location_id')->nullable()->index();
            $table->string('title', 255);
            $table->string('slug', 255)->unique();
            $table->enum('job_type', ['full_time', 'part_time', 'contract', 'internship'])->default('full_time');
            $table->enum('experience_level', ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])->nullable();
            $table->decimal('salary_min', 10, 2)->nullable();
            $table->decimal('salary_max', 10, 2)->nullable();
            $table->string('salary_currency', 3)->default('USD');
            $table->enum('salary_period', ['month', 'year', 'hour', 'day'])->default('month');
            $table->boolean('is_remote')->default(false);
            $table->longText('description')->nullable();
            $table->longText('requirements')->nullable();
            $table->longText('benefits')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->enum('status', ['draft', 'pending', 'published', 'rejected', 'closed'])->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->unsignedInteger('views')->default(0);
            $table->date('expires_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // ── resumes ────────────────────────────────────────────────────────────
        // data column added by 2026_06_20_010006_add_data_to_resumes_table
        Schema::create('resumes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('candidate_id')->index();
            $table->string('headline', 255)->nullable();
            $table->text('summary')->nullable();
            $table->string('file_url', 500)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        // ── resume_sections ────────────────────────────────────────────────────
        Schema::create('resume_sections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resume_id')->index();
            $table->string('type', 50);
            $table->tinyInteger('sort_order')->unsigned()->default(0);
            $table->json('content')->nullable();
        });

        // ── applications ───────────────────────────────────────────────────────
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_id')->index();
            $table->unsignedBigInteger('candidate_id')->index();
            $table->unsignedBigInteger('resume_id')->nullable();
            $table->text('cover_note')->nullable();
            $table->enum('stage', ['applied', 'reviewed', 'shortlisted', 'interview', 'offered', 'rejected'])->default('applied');
            $table->timestamps();
            $table->unique(['job_id', 'candidate_id']);
        });

        // ── saved_jobs ─────────────────────────────────────────────────────────
        Schema::create('saved_jobs', function (Blueprint $table) {
            $table->unsignedBigInteger('candidate_id');
            $table->unsignedBigInteger('job_id');
            $table->timestamp('created_at')->nullable();
            $table->unique(['candidate_id', 'job_id']);
        });

        // ── plans ──────────────────────────────────────────────────────────────
        // trial_days added by 2026_06_24_000001_add_trial_days_to_plans
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->decimal('price', 10, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->enum('interval', ['month', 'year', 'once'])->default('month');
            $table->unsignedSmallInteger('job_post_limit')->nullable();
            $table->unsignedSmallInteger('featured_credits')->default(0);
            $table->json('features_json')->nullable();
            $table->boolean('is_active')->default(true);
        });

        // ── subscriptions ──────────────────────────────────────────────────────
        // status enum expanded by 2026_06_22_000003_add_pending_trial_to_subscriptions_status
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->index();
            $table->unsignedBigInteger('plan_id')->index();
            $table->enum('status', ['active', 'past_due', 'canceled', 'expired'])->default('active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('renews_at')->nullable();
        });

        // ── payments ───────────────────────────────────────────────────────────
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->index();
            $table->unsignedBigInteger('subscription_id')->nullable()->index();
            $table->string('invoice_no', 50)->nullable();
            $table->decimal('amount', 10, 2)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->string('method', 50)->nullable();
            $table->enum('status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        // ── banners ────────────────────────────────────────────────────────────
        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->text('message')->nullable();
            $table->string('cta_label', 100)->nullable();
            $table->string('cta_url', 500)->nullable();
            $table->string('theme', 50)->default('teal');
            $table->string('icon', 50)->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('image_fit', 20)->default('cover');
            $table->string('text_align', 20)->default('left');
            $table->boolean('is_active')->default(false);
            $table->date('starts_at')->nullable();
            $table->date('ends_at')->nullable();
            $table->tinyInteger('sort_order')->unsigned()->default(0);
            $table->timestamp('created_at')->nullable();
        });

        // ── settings ───────────────────────────────────────────────────────────
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('group', 50);
            $table->string('key', 100);
            $table->text('value')->nullable();
            $table->unique(['group', 'key']);
        });

        // ── notifications ──────────────────────────────────────────────────────
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('type', 100);
            $table->string('title', 255);
            $table->text('body')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        // ── social_accounts ────────────────────────────────────────────────────
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('provider', 50);
            $table->string('provider_id', 255);
            $table->text('access_token')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->unique(['user_id', 'provider']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('banners');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
        Schema::dropIfExists('saved_jobs');
        Schema::dropIfExists('applications');
        Schema::dropIfExists('resume_sections');
        Schema::dropIfExists('resumes');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('auth_tokens');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
