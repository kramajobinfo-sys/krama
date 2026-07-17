<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cv_match_runs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->index();
            $table->unsignedBigInteger('user_id')->nullable(); // employer user who ran it
            $table->unsignedBigInteger('reference_id');        // reference resume id
            $table->string('reference_name')->nullable();      // snapshot (candidate may change/leave)
            $table->string('reference_headline')->nullable();  // snapshot
            $table->string('engine', 20);                      // deterministic | ai
            $table->string('mode', 20);                        // compare | suggest
            $table->unsignedInteger('cost')->default(0);       // credits charged
            $table->unsignedInteger('candidate_count')->default(0);
            $table->unsignedInteger('top_score')->nullable();
            $table->json('results');                           // full scored rows (re-viewable free)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cv_match_runs');
    }
};
