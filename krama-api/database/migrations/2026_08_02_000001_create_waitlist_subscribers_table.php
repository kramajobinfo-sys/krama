<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Anonymous "notify me when jobs launch" captures from the public empty state.
        Schema::create('waitlist_subscribers', function (Blueprint $table) {
            $table->engine = 'InnoDB'; // some hosts default to MyISAM
            $table->id();
            $table->string('email', 191);
            $table->string('keyword', 150)->nullable();   // optional role/interest they typed
            $table->string('source', 40)->nullable();     // where they signed up, e.g. "find_jobs"
            $table->boolean('notified')->default(false);  // for a future "we launched" mailout
            $table->timestamps();
            $table->unique('email');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlist_subscribers');
    }
};
