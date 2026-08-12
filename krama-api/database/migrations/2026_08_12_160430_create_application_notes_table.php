<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Employer-private notes on an applicant (per application). company_id is denormalised for
// cheap tenant-isolation queries and future company-wide note listing. Never exposed to candidates.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('application_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->timestamps();
            $table->index('application_id');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_notes');
    }
};
