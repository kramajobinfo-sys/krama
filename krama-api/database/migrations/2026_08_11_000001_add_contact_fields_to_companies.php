<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Public contact details for a company: a phone number and a contact person (name + email).
// The Telegram link is NOT here — it lives in the existing social_links JSON (separate from
// telegram_chat_id, which is the job-post notification channel).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            if (! Schema::hasColumn('companies', 'phone')) {
                $table->string('phone', 40)->nullable()->after('address');
            }
            if (! Schema::hasColumn('companies', 'contact_name')) {
                $table->string('contact_name', 120)->nullable()->after('phone');
            }
            if (! Schema::hasColumn('companies', 'contact_email')) {
                $table->string('contact_email', 190)->nullable()->after('contact_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['phone', 'contact_name', 'contact_email']);
        });
    }
};
