<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('forum_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->unsignedBigInteger('thread_id')->index();
            // last time this subscriber was included in a digest / notified, to avoid re-sending
            $table->timestamp('last_notified_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'thread_id'], 'forum_sub_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_subscriptions');
    }
};
