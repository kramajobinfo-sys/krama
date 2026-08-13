<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// A private evaluation of an interview by one team member. ratings is a {criterion: 1-5} map;
// one scorecard per author per interview. Employer-only — never exposed to candidates.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_scorecards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_id')->constrained('interviews')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
            $table->json('ratings')->nullable();
            $table->enum('recommendation', ['strong_hire', 'hire', 'maybe', 'no_hire'])->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique(['interview_id', 'author_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_scorecards');
    }
};
