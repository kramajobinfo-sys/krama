<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_campaigns', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->string('subject', 200);
            $table->longText('body');                 // HTML body (inner content)
            $table->string('audience', 40);            // all_candidates | all_employers | all_users
            $table->string('status', 20)->default('draft'); // draft | sending | sent | failed
            $table->unsignedInteger('total_recipients')->default(0);
            $table->unsignedInteger('sent_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('sent_at')->nullable();
            $table->index(['status', 'created_at']);
        });

        // Marketing opt-out (transactional emails still send; marketing campaigns skip these users).
        if (! Schema::hasColumn('users', 'marketing_opt_out')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('marketing_opt_out')->default(false)->after('status');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('email_campaigns');
        if (Schema::hasColumn('users', 'marketing_opt_out')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('marketing_opt_out');
            });
        }
    }
};
