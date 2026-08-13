<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Custom application questions an employer attaches to a job. Answered by the candidate at
// apply time; a knockout question flags applicants who don't meet a hard requirement.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_screening_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
            $table->enum('type', ['text', 'textarea', 'yes_no', 'single_choice', 'multi_choice', 'number', 'date']);
            $table->string('label', 300);
            $table->json('options')->nullable();          // choice options
            $table->boolean('required')->default(true);
            $table->boolean('knockout')->default(false);   // fail => "does not meet requirement"
            $table->json('knockout_config')->nullable();   // e.g. {"op":">=","value":3} or {"equals":"yes"} or {"accept":["A","B"]}
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['job_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_screening_questions');
    }
};
