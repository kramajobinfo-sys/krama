<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// A candidate's answer to one screening question, captured at apply time. `passed` is the
// knockout result (null when the question isn't a knockout). Employer-visible only.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('application_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('question_id')->constrained('job_screening_questions')->cascadeOnDelete();
            $table->text('answer_text')->nullable();   // human-readable answer (multi_choice joined with ", ")
            $table->boolean('passed')->nullable();     // knockout result; null if not a knockout question
            $table->timestamps();
            $table->unique(['application_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_answers');
    }
};
