<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompanyFollowersTable extends Migration
{
    public function up()
    {
        Schema::create('company_followers', function (Blueprint $table) {
            $table->unsignedBigInteger('candidate_id');
            $table->unsignedBigInteger('company_id');
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['candidate_id', 'company_id']);
            $table->foreign('candidate_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->index('company_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('company_followers');
    }
}
