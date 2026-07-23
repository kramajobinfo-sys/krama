<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->string('working_days', 80)->nullable()->after('is_remote');   // e.g. "Monday to Friday"
            $table->string('working_time', 80)->nullable()->after('working_days'); // e.g. "8:00 AM – 5:00 PM"
            $table->string('map_location', 500)->nullable()->after('working_time'); // address or a maps URL
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table) {
            $table->dropColumn(['working_days', 'working_time', 'map_location']);
        });
    }
};
