<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->engine = 'InnoDB'; // prod MariaDB defaults to MyISAM; FKs need InnoDB
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->text('endpoint');
            // Push endpoints are long; index/unique on a sha256 hash instead of the full URL.
            $table->string('endpoint_hash', 64);
            $table->string('p256dh', 255);
            $table->string('auth', 255);
            $table->string('ua', 255)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['user_id', 'endpoint_hash']);
            $table->index('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
