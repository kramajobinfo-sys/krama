<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Outreach toolkit for the campaigns tool: reusable templates, uploaded recipient lists
// (e.g. 700 organizations from a CSV), and scheduling on top of the existing email_campaigns.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('subject', 200);
            $table->longText('body');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });

        Schema::create('email_lists', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->unsignedInteger('recipient_count')->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('email_list_recipients', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('list_id')->index();
            $table->string('email', 190);
            $table->string('name', 190)->nullable();
            $table->string('org', 190)->nullable();
            $table->boolean('unsubscribed')->default(false);
            $table->timestamp('created_at')->nullable();
            $table->unique(['list_id', 'email']);
        });

        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->unsignedBigInteger('template_id')->nullable()->after('id');
            $table->unsignedBigInteger('list_id')->nullable()->after('audience');
            $table->timestamp('scheduled_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->dropColumn(['template_id', 'list_id', 'scheduled_at']);
        });
        Schema::dropIfExists('email_list_recipients');
        Schema::dropIfExists('email_lists');
        Schema::dropIfExists('email_templates');
    }
};
