<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Stores the on-disk filename of the organization proof document (kept on the
// private 'local' disk, streamed via GET /companies/{id}/org-document). Separate
// from org_doc_url, which holds the serve-route URL shown to admins/owners.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('org_doc_path', 255)->nullable()->after('org_doc_url');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('org_doc_path');
        });
    }
};
