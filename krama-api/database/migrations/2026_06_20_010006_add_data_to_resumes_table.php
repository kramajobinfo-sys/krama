<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddDataToResumesTable extends Migration
{
    public function up()
    {
        Schema::table('resumes', function (Blueprint $table) {
            $table->json('data')->nullable()->after('summary');
        });
    }

    public function down()
    {
        Schema::table('resumes', function (Blueprint $table) {
            $table->dropColumn('data');
        });
    }
}
