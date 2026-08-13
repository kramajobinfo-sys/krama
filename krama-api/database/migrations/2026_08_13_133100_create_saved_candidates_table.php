<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// A company's saved candidate ("talent pool"). One row per company+candidate; company-scoped.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('saved_by')->constrained('users')->cascadeOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['company_id', 'candidate_id']);
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_candidates');
    }
};
