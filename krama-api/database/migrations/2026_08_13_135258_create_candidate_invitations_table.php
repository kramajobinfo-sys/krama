<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// An employer's invitation for a candidate to apply to a specific published job. One invite per
// job+candidate. Status tracks the funnel; expires_at gates auto-expiry (computed on read).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidate_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('invited_by')->constrained('users')->cascadeOnDelete();
            $table->text('message')->nullable();
            $table->enum('status', ['sent', 'viewed', 'applied', 'declined', 'expired'])->default('sent');
            $table->dateTime('expires_at')->nullable();
            $table->dateTime('viewed_at')->nullable();
            $table->dateTime('responded_at')->nullable();
            $table->timestamps();
            $table->unique(['job_id', 'candidate_id']);
            $table->index('candidate_id');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_invitations');
    }
};
