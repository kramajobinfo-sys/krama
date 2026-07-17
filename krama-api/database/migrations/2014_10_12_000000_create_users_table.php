<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id')->nullable()->index();
            $table->string('name', 120);
            $table->string('email', 255)->unique();
            $table->string('password_hash', 255);
            $table->string('phone', 20)->nullable();
            // bio added by 2026_06_20_061422_add_bio_to_users_table
            $table->string('avatar_url', 500)->nullable();
            $table->enum('status', ['active', 'suspended', 'pending'])->default('active');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
