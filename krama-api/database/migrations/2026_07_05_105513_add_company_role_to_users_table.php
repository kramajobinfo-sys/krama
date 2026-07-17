<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCompanyRoleToUsersTable extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Links a recruiter user to a company
            $table->unsignedBigInteger('company_id')->nullable()->after('role_id');
            // null = regular employer account owner (company_admin by convention via companies.user_id)
            // 'company_admin' = explicitly granted admin within a company (future use)
            // 'recruitment' = recruiter sub-account, requires company admin approval for jobs
            $table->string('company_role', 32)->nullable()->after('company_id');

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn(['company_id', 'company_role']);
        });
    }
}
