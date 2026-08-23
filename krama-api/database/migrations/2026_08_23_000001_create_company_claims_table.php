<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_claims', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();
            $table->unsignedBigInteger('company_id');   // the company being claimed
            $table->unsignedBigInteger('user_id');       // the employer requesting ownership
            $table->string('email');
            $table->string('message', 500)->nullable();
            $table->string('status', 20)->default('pending'); // pending | approved | rejected
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('handled_at')->nullable();
            $table->unsignedBigInteger('handled_by')->nullable();
            $table->index(['status', 'created_at']);
            $table->index('company_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_claims');
    }
};
