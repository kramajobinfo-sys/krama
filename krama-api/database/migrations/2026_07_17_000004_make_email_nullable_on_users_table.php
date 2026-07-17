<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    // Phone-only accounts have no email, so email must be nullable.
    // Raw ALTER (no doctrine/dbal). The UNIQUE index stays — MySQL allows
    // multiple NULLs, so many phone-only users can coexist.
    public function up(): void
    {
        DB::statement('ALTER TABLE `users` MODIFY `email` VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE `users` MODIFY `email` VARCHAR(255) NOT NULL');
    }
};
