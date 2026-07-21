<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('forum_replies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('thread_id')->index();
            $table->unsignedBigInteger('user_id')->index();      // author
            $table->unsignedBigInteger('parent_id')->nullable();  // quoted reply (flat display, optional)
            $table->text('body');
            $table->boolean('is_hidden')->default(false);          // moderator soft-hide
            $table->integer('vote_score')->default(0);             // cached net upvotes
            $table->timestamps();

            $table->fullText(['body']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_replies');
    }
};
