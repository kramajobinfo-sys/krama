<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Telegram chat linked via the bot deep-link flow. When set, the user
            // receives Telegram alerts (employers: new application on their jobs).
            $table->string('telegram_chat_id', 64)->nullable()->after('allow_candidate_messages');
            // One-time token embedded in the t.me deep link; the webhook matches it on
            // /start, stores the chat id, then clears this token.
            $table->string('telegram_link_token', 64)->nullable()->after('telegram_chat_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telegram_chat_id', 'telegram_link_token']);
        });
    }
};
