<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * In-app support chat, bridged to a Telegram support group.
 *
 * One thread per user. Each thread maps to a Telegram forum topic in the support group, so
 * an agent's reply inside that topic can be routed back to the right user by topic id.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_threads', function (Blueprint $table) {
            // Prod MariaDB defaults to MyISAM; pin InnoDB or the FKs are silently dropped
            // and long utf8mb4 indexes hit the 1000-byte key cap.
            $table->engine = 'InnoDB';

            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            // Telegram forum topic id (message_thread_id). Null until the first message is
            // relayed, so a thread can exist before the group is configured.
            $table->unsignedBigInteger('telegram_topic_id')->nullable();
            $table->string('status', 12)->default('open');        // open | closed
            $table->unsignedInteger('unread_for_user')->default(0);
            $table->timestamp('last_user_at')->nullable();
            $table->timestamp('last_agent_at')->nullable();
            $table->timestamps();

            $table->unique('user_id');                 // one support thread per user
            $table->index('telegram_topic_id');        // webhook looks threads up by topic
        });

        Schema::create('support_messages', function (Blueprint $table) {
            $table->engine = 'InnoDB';

            $table->id();
            $table->foreignId('thread_id')->constrained('support_threads')->cascadeOnDelete();
            $table->string('sender', 8);                          // user | agent
            $table->text('body');
            $table->string('agent_name', 80)->nullable();          // Telegram name of the replier
            $table->unsignedBigInteger('telegram_message_id')->nullable();
            $table->timestamps();

            $table->index(['thread_id', 'id']);
            // Telegram can redeliver an update; this makes the relay idempotent.
            $table->unique('telegram_message_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_messages');
        Schema::dropIfExists('support_threads');
    }
};
