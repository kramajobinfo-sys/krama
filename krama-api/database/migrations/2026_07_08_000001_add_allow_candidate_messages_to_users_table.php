<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Employer preference: whether candidates may start a conversation with them.
            // Off by default — only the employer initiates (current design).
            $table->boolean('allow_candidate_messages')
                  ->default(false)
                  ->after('cv_visibility');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('allow_candidate_messages');
        });
    }
};
