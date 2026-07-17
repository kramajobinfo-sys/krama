<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExperienceLevelsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('experience_levels', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->string('name', 80);
            $table->string('slug', 80)->unique();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
        });

        \Illuminate\Support\Facades\DB::table('experience_levels')->insert([
            ['name' => 'Entry',     'slug' => 'entry',     'sort_order' => 1, 'status' => 'active'],
            ['name' => 'Junior',    'slug' => 'junior',    'sort_order' => 2, 'status' => 'active'],
            ['name' => 'Mid',       'slug' => 'mid',       'sort_order' => 3, 'status' => 'active'],
            ['name' => 'Senior',    'slug' => 'senior',    'sort_order' => 4, 'status' => 'active'],
            ['name' => 'Lead',      'slug' => 'lead',      'sort_order' => 5, 'status' => 'active'],
            ['name' => 'Executive', 'slug' => 'executive', 'sort_order' => 6, 'status' => 'active'],
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('experience_levels');
    }
}
