<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

class AddCompanyPendingToJobsStatus extends Migration
{
    public function up()
    {
        DB::statement("ALTER TABLE jobs MODIFY COLUMN status ENUM('draft','pending','company_pending','published','rejected','closed') NOT NULL DEFAULT 'draft'");
    }

    public function down()
    {
        DB::statement("UPDATE jobs SET status = 'draft' WHERE status = 'company_pending'");
        DB::statement("ALTER TABLE jobs MODIFY COLUMN status ENUM('draft','pending','published','rejected','closed') NOT NULL DEFAULT 'draft'");
    }
}
