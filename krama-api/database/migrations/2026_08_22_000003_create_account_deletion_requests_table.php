<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('account_deletion_requests', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            // Nullable: a request can be submitted from the public page without a login.
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('email');
            $table->string('role', 40)->nullable();
            $table->string('reason', 500)->nullable();
            $table->string('status', 20)->default('pending'); // pending | done | rejected
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('handled_at')->nullable();
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('account_deletion_requests');
    }
};
