<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterJobsExperienceLevelToVarchar extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        \Illuminate\Support\Facades\DB::statement(
            "ALTER TABLE jobs MODIFY experience_level VARCHAR(60) NULL"
        );
    }

    public function down()
    {
        \Illuminate\Support\Facades\DB::statement(
            "ALTER TABLE jobs MODIFY experience_level ENUM('entry','junior','mid','senior','lead','executive') NULL"
        );
    }
}
