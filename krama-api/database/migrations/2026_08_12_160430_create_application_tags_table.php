<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Free-form candidate tags on an application, scoped to the company. No separate tag catalogue —
// "custom tags" = any label the employer types; autocomplete comes from the company's DISTINCT
// labels. unique(application_id,label) prevents duplicate tags on one applicant.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('application_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('label', 40);
            $table->timestamps();
            $table->unique(['application_id', 'label']);
            $table->index(['company_id', 'label']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_tags');
    }
};
