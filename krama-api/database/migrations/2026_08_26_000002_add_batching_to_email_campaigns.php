<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Daily-batch sending for custom-list campaigns: send batch_size recipients per day,
// tracking progress by the last recipient id processed (batch_cursor).
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->unsignedInteger('batch_size')->nullable()->after('list_id');   // null/0 = send all at once
            $table->unsignedBigInteger('batch_cursor')->default(0)->after('batch_size'); // last recipient id processed
        });
    }

    public function down(): void
    {
        Schema::table('email_campaigns', function (Blueprint $table) {
            $table->dropColumn(['batch_size', 'batch_cursor']);
        });
    }
};
