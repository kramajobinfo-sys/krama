<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('forum_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reporter_id')->index();
            $table->string('reportable_type', 20);   // 'thread' | 'reply'
            $table->unsignedBigInteger('reportable_id');
            $table->string('reason', 60);             // spam | abuse | off_topic | other
            $table->string('note', 500)->nullable();
            $table->string('status', 20)->default('open'); // open | resolved | dismissed
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['reportable_type', 'reportable_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_reports');
    }
};
