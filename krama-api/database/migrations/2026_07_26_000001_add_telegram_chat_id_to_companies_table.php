<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Optional Telegram chat id for an employer/company. When set, paid invoices are
     * also DM'd to this chat via the shared Krama bot (in addition to email and the
     * admin channel). Left null = no employer Telegram delivery.
     */
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('telegram_chat_id', 64)->nullable()->after('social_links');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('telegram_chat_id');
        });
    }
};
