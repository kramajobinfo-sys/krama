<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// jobs.slug ended up with TWO identical unique indexes: `jobs_slug_unique` (from the original
// create_core_tables migration's ->unique()) and `uq_jobs_slug` (added again by the later
// database_health_indexes migration). Both enforce the same guarantee, so `uq_jobs_slug` is
// pure write overhead. Drop it and keep `jobs_slug_unique` as the single source of truth.
return new class extends Migration
{
    private function indexExists(string $index): bool
    {
        return count(DB::select(
            'SHOW INDEX FROM `jobs` WHERE Key_name = ?', [$index]
        )) > 0;
    }

    public function up(): void
    {
        // Only drop the duplicate if BOTH indexes are present — never leave the column
        // without any unique guard.
        if ($this->indexExists('uq_jobs_slug') && $this->indexExists('jobs_slug_unique')) {
            Schema::table('jobs', function (Blueprint $table) {
                $table->dropUnique('uq_jobs_slug');
            });
        }
    }

    public function down(): void
    {
        // Restore the redundant index only if it isn't already there.
        if (! $this->indexExists('uq_jobs_slug')) {
            Schema::table('jobs', function (Blueprint $table) {
                $table->unique('slug', 'uq_jobs_slug');
            });
        }
    }
};
