<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $defaults = [
            ['group' => 'featured', 'key' => 'boost_price', 'value' => '19'],
            ['group' => 'featured', 'key' => 'boost_currency', 'value' => 'USD'],
            ['group' => 'featured', 'key' => 'boost_days', 'value' => '30'],
        ];

        foreach ($defaults as $row) {
            DB::table('settings')->updateOrInsert(
                ['group' => $row['group'], 'key' => $row['key']],
                ['value' => $row['value']]
            );
        }
    }

    public function down(): void
    {
        DB::table('settings')->where('group', 'featured')->delete();
    }
};
