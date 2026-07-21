<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('forum_votes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('votable_type', 20);   // 'thread' | 'reply'
            $table->unsignedBigInteger('votable_id');
            $table->tinyInteger('value')->default(1); // +1 upvote (schema allows future downvote)
            $table->timestamps();

            $table->unique(['user_id', 'votable_type', 'votable_id'], 'forum_vote_unique');
            $table->index(['votable_type', 'votable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_votes');
    }
};
