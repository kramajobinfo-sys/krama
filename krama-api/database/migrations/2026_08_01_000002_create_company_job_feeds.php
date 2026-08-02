<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Provenance stamp on native jobs so a feed re-sync updates the same row
        // instead of duplicating. NULL for hand-posted jobs.
        if (! Schema::hasColumn('jobs', 'import_ref')) {
            Schema::table('jobs', function (Blueprint $t) {
                $t->string('import_ref', 191)->nullable()->after('slug');
                $t->index(['company_id', 'import_ref']);
            });
        }

        // One careers/ATS feed per company; imported items become NATIVE draft jobs.
        Schema::create('company_job_feeds', function (Blueprint $t) {
            $t->engine = 'InnoDB'; // host defaults to MyISAM (no FK cascade, 1000-byte key cap)
            $t->id();
            $t->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $t->string('url', 1000);
            $t->enum('format', ['rss', 'atom', 'json'])->default('rss');
            $t->boolean('enabled')->default(true);
            $t->timestamp('last_synced_at')->nullable();
            $t->string('last_status', 20)->nullable();   // ok | error
            $t->text('last_error')->nullable();
            $t->unsignedInteger('imported_count')->default(0);
            $t->timestamps();
            $t->unique('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_job_feeds');
        if (Schema::hasColumn('jobs', 'import_ref')) {
            Schema::table('jobs', function (Blueprint $t) {
                $t->dropIndex(['company_id', 'import_ref']);
                $t->dropColumn('import_ref');
            });
        }
    }
};
