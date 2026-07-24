<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Widen settings.value from TEXT (64 KB) to MEDIUMTEXT (16 MB) so inline
     * data-URI values — brand logo/favicon, home_content payloads — fit without
     * being rejected or truncated.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE `settings` MODIFY `value` MEDIUMTEXT NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE `settings` MODIFY `value` TEXT NULL');
    }
};
