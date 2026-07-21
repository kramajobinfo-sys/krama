<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        // ── Permission: moderate_forum (attach to super_admin + admin) ──────────
        DB::table('permissions')->insertOrIgnore([
            ['slug' => 'moderate_forum', 'area' => 'admin', 'label' => 'Moderate the community forum'],
        ]);

        $permId  = DB::table('permissions')->where('slug', 'moderate_forum')->value('id');
        $roleIds = DB::table('roles')->whereIn('slug', ['super_admin', 'admin'])->pluck('id');
        foreach ($roleIds as $roleId) {
            DB::table('role_permissions')->insertOrIgnore([
                'role_id'       => $roleId,
                'permission_id' => $permId,
            ]);
        }

        // ── Settings: forum group ───────────────────────────────────────────────
        $settings = [
            ['group' => 'forum', 'key' => 'enabled',         'value' => '1'],
            ['group' => 'forum', 'key' => 'allow_guest_read', 'value' => '1'],
            ['group' => 'forum', 'key' => 'min_body_len',     'value' => '10'],
            ['group' => 'forum', 'key' => 'digest_enabled',   'value' => '1'],
        ];
        foreach ($settings as $row) {
            DB::table('settings')->updateOrInsert(
                ['group' => $row['group'], 'key' => $row['key']],
                ['value' => $row['value']]
            );
        }

        // ── Default categories ────────────────────────────────────────────────
        $cats = [
            ['name' => 'General Discussion',  'icon' => 'messages-square', 'color' => 'teal',    'description' => 'Anything about jobs, careers, and the Krama community.'],
            ['name' => 'Career Advice',       'icon' => 'compass',          'color' => 'saffron', 'description' => 'Résumé tips, interview prep, and growing your career.'],
            ['name' => 'Interview Experiences','icon' => 'mic',             'color' => 'teal',    'description' => 'Share and read real interview experiences.'],
            ['name' => 'Employers & Hiring',  'icon' => 'briefcase',        'color' => 'dark',    'description' => 'For employers — hiring tips and talking with candidates.'],
            ['name' => 'Feedback & Help',     'icon' => 'life-buoy',        'color' => 'saffron', 'description' => 'Questions and feedback about using Krama.'],
        ];
        $now = now();
        foreach ($cats as $i => $c) {
            DB::table('forum_categories')->updateOrInsert(
                ['slug' => Str::slug($c['name'])],
                [
                    'name'        => $c['name'],
                    'description' => $c['description'],
                    'icon'        => $c['icon'],
                    'color'       => $c['color'],
                    'sort_order'  => $i,
                    'is_active'   => true,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ]
            );
        }
    }

    public function down(): void
    {
        DB::table('settings')->where('group', 'forum')->delete();
        $permId = DB::table('permissions')->where('slug', 'moderate_forum')->value('id');
        if ($permId) {
            DB::table('role_permissions')->where('permission_id', $permId)->delete();
            DB::table('permissions')->where('id', $permId)->delete();
        }
        // categories left intact on rollback (data); drop table migration handles removal
    }
};
