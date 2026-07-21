<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('forum_threads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('category_id')->index();
            $table->unsignedBigInteger('user_id')->index();   // author
            $table->string('title', 200);
            $table->string('slug', 220)->index();              // pretty URL (routed by id)
            $table->text('body');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_locked')->default(false);
            $table->boolean('is_hidden')->default(false);      // moderator soft-hide
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('reply_count')->default(0);
            $table->integer('vote_score')->default(0);         // cached net upvotes
            $table->timestamp('last_activity_at')->nullable()->index();
            $table->unsignedBigInteger('last_reply_user_id')->nullable();
            $table->timestamps();

            $table->fullText(['title', 'body']);               // MySQL InnoDB full-text search
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_threads');
    }
};
