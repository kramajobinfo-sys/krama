<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Append 'hired' as the terminal pipeline stage (after 'offered'). Raw ALTER because
// Laravel Schema/doctrine-dbal can't cleanly modify a MySQL ENUM. Append-only — existing
// rows and stage values are untouched, so this is non-breaking.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE `applications` MODIFY `stage` ENUM('applied','reviewed','shortlisted','interview','offered','hired','rejected') NOT NULL DEFAULT 'applied'");
    }

    public function down(): void
    {
        // Demote any 'hired' rows to 'offered' first, or shrinking the enum would fail.
        DB::table('applications')->where('stage', 'hired')->update(['stage' => 'offered']);
        DB::statement("ALTER TABLE `applications` MODIFY `stage` ENUM('applied','reviewed','shortlisted','interview','offered','rejected') NOT NULL DEFAULT 'applied'");
    }
};
