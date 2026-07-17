<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateJobAlertsTable extends Migration
{
    public function up()
    {
        Schema::create('job_alerts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('candidate_id');
            $table->string('keyword', 150)->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('location_id')->nullable();
            $table->string('job_type', 30)->nullable();   // full_time, part_time, contract, internship
            $table->boolean('is_remote')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('candidate_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('location_id')->references('id')->on('locations')->onDelete('set null');

            $table->index('candidate_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('job_alerts');
    }
}
