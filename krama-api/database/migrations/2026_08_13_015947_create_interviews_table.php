<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// An interview scheduled by an employer for a specific application. company_id is denormalised
// for tenant-isolation queries. interviewer_id is an optional team member (users).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('scheduled_by')->constrained('users')->cascadeOnDelete();
            $table->foreignId('interviewer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['phone', 'video', 'in_person'])->default('video');
            $table->dateTime('scheduled_at');
            $table->unsignedSmallInteger('duration_min')->default(30);
            $table->string('timezone', 64)->nullable();
            $table->string('location', 300)->nullable();     // in-person address
            $table->string('meeting_url', 500)->nullable();  // video link
            $table->text('notes')->nullable();
            $table->enum('status', ['scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show'])->default('scheduled');
            $table->timestamps();
            $table->index(['company_id', 'scheduled_at']);
            $table->index('application_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
