<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('forum_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60);
            $table->string('slug', 70)->unique();
            $table->unsignedInteger('thread_count')->default(0);
            $table->timestamps();
        });

        Schema::create('forum_thread_tag', function (Blueprint $table) {
            $table->unsignedBigInteger('thread_id')->index();
            $table->unsignedBigInteger('tag_id')->index();
            $table->primary(['thread_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_thread_tag');
        Schema::dropIfExists('forum_tags');
    }
};
