<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // ── Roles ─────────────────────────────────────────────────────────────
        $roles = [
            ['slug' => 'super_admin', 'name' => 'Super Admin',  'description' => 'Full platform access including role management.'],
            ['slug' => 'admin',       'name' => 'Admin',         'description' => 'Platform administration except role management.'],
            ['slug' => 'candidate',   'name' => 'Candidate',     'description' => 'Job seeker — can apply, save jobs, manage resume.'],
            ['slug' => 'employer',    'name' => 'Employer',      'description' => 'Company recruiter — can post jobs and review applicants.'],
        ];
        DB::table('roles')->insertOrIgnore($roles);

        $roleIds = DB::table('roles')->pluck('id', 'slug');

        // ── Permissions ───────────────────────────────────────────────────────
        $permissions = [
            ['slug' => 'site_settings',    'area' => 'admin',     'label' => 'Manage site settings & reference data'],
            ['slug' => 'approve_companies', 'area' => 'admin',    'label' => 'Approve/reject/suspend companies'],
            ['slug' => 'approve_jobs',      'area' => 'admin',    'label' => 'Approve/reject job postings'],
            ['slug' => 'view_reports',      'area' => 'admin',    'label' => 'View analytics & reports'],
            ['slug' => 'view_audit',        'area' => 'admin',    'label' => 'View audit logs'],
            ['slug' => 'manage_payments',   'area' => 'admin',    'label' => 'Manage payments & subscriptions'],
            ['slug' => 'manage_plans',      'area' => 'admin',    'label' => 'Create & edit subscription plans'],
            ['slug' => 'manage_users',      'area' => 'admin',    'label' => 'View & manage user accounts'],
            ['slug' => 'suspend_users',     'area' => 'admin',    'label' => 'Suspend/activate user accounts'],
            ['slug' => 'manage_roles',      'area' => 'admin',    'label' => 'Assign roles to users (super admin only)'],
            ['slug' => 'post_jobs',         'area' => 'employer', 'label' => 'Post & manage job listings'],
            ['slug' => 'view_applicants',   'area' => 'employer', 'label' => 'View & manage applicants'],
            ['slug' => 'apply_jobs',        'area' => 'candidate','label' => 'Apply to job listings'],
            ['slug' => 'save_jobs',         'area' => 'candidate','label' => 'Save job listings'],
        ];
        DB::table('permissions')->insertOrIgnore($permissions);

        $permIds = DB::table('permissions')->pluck('id', 'slug');

        // ── Role → Permission mapping ─────────────────────────────────────────
        $adminPerms = [
            'site_settings', 'approve_companies', 'approve_jobs', 'view_reports', 'view_audit',
            'manage_payments', 'manage_plans', 'manage_users', 'suspend_users',
        ];
        $employerPerms  = ['post_jobs', 'view_applicants'];
        $candidatePerms = ['apply_jobs', 'save_jobs'];

        $rolePerms = [];
        foreach (array_keys($permIds->toArray()) as $slug) {
            $rolePerms[] = ['role_id' => $roleIds['super_admin'], 'permission_id' => $permIds[$slug]];
        }
        foreach ($adminPerms as $slug) {
            $rolePerms[] = ['role_id' => $roleIds['admin'], 'permission_id' => $permIds[$slug]];
        }
        foreach ($employerPerms as $slug) {
            $rolePerms[] = ['role_id' => $roleIds['employer'], 'permission_id' => $permIds[$slug]];
        }
        foreach ($candidatePerms as $slug) {
            $rolePerms[] = ['role_id' => $roleIds['candidate'], 'permission_id' => $permIds[$slug]];
        }
        DB::table('role_permissions')->insertOrIgnore($rolePerms);

        // ── Categories (IDs 1–8 match MockDataSeeder hardcoded values) ────────
        $categories = [
            ['name' => 'Information Technology',    'slug' => 'information-technology',   'icon' => 'monitor',       'status' => 'active'],
            ['name' => 'Accounting',                'slug' => 'accounting',               'icon' => 'calculator',    'status' => 'active'],
            ['name' => 'Finance',                   'slug' => 'finance',                  'icon' => 'trending-up',   'status' => 'active'],
            ['name' => 'Marketing',                 'slug' => 'marketing',                'icon' => 'megaphone',     'status' => 'active'],
            ['name' => 'Human Resources',           'slug' => 'human-resources',          'icon' => 'users',         'status' => 'active'],
            ['name' => 'Engineering',               'slug' => 'engineering',              'icon' => 'settings-2',    'status' => 'active'],
            ['name' => 'Administrative',            'slug' => 'administrative',           'icon' => 'clipboard-list','status' => 'active'],
            ['name' => 'Construction & Real Estate','slug' => 'construction-real-estate', 'icon' => 'building-2',   'status' => 'active'],
            ['name' => 'Healthcare',                'slug' => 'healthcare',               'icon' => 'heart-pulse',   'status' => 'active'],
            ['name' => 'Education',                 'slug' => 'education',                'icon' => 'graduation-cap','status' => 'active'],
            ['name' => 'Hospitality & Tourism',     'slug' => 'hospitality-tourism',      'icon' => 'hotel',         'status' => 'active'],
            ['name' => 'Legal',                     'slug' => 'legal',                    'icon' => 'scale',         'status' => 'active'],
        ];
        DB::table('categories')->insertOrIgnore($categories);

        // ── Locations (IDs must match MockDataSeeder: 2=Phnom Penh, 3=Siem Reap…) ──
        $locations = [
            ['parent_id' => null, 'type' => 'city', 'name' => 'Remote / Online'],  // id=1
            ['parent_id' => null, 'type' => 'city', 'name' => 'Phnom Penh'],       // id=2
            ['parent_id' => null, 'type' => 'city', 'name' => 'Siem Reap'],        // id=3
            ['parent_id' => null, 'type' => 'city', 'name' => 'Battambang'],       // id=4
            ['parent_id' => null, 'type' => 'city', 'name' => 'Takeo'],            // id=5
            ['parent_id' => null, 'type' => 'city', 'name' => 'Prey Veng'],        // id=6
            ['parent_id' => null, 'type' => 'city', 'name' => 'Kampong Cham'],
            ['parent_id' => null, 'type' => 'city', 'name' => 'Kandal'],
            ['parent_id' => null, 'type' => 'city', 'name' => 'Kampot'],
            ['parent_id' => null, 'type' => 'city', 'name' => 'Sihanoukville'],
        ];
        DB::table('locations')->insertOrIgnore($locations);

        // ── Subscription Plans ────────────────────────────────────────────────
        $plans = [
            [
                'name'             => 'Free Trial',
                'price'            => 0,
                'currency'         => 'USD',
                'interval'         => 'once',
                'job_post_limit'   => 2,
                'featured_credits' => 0,
                'features_json'    => json_encode(['2 job posts', '30-day trial', 'Basic listing']),
                'is_active'        => 1,
            ],
            [
                'name'             => 'Basic',
                'price'            => 29,
                'currency'         => 'USD',
                'interval'         => 'month',
                'job_post_limit'   => 5,
                'featured_credits' => 1,
                'features_json'    => json_encode(['5 job posts/month', '1 featured listing', 'Applicant tracking', 'Email support']),
                'is_active'        => 1,
            ],
            [
                'name'             => 'Professional',
                'price'            => 79,
                'currency'         => 'USD',
                'interval'         => 'month',
                'job_post_limit'   => 20,
                'featured_credits' => 5,
                'features_json'    => json_encode(['20 job posts/month', '5 featured listings', 'Resume access', 'Priority support', 'Analytics dashboard']),
                'is_active'        => 1,
            ],
            [
                'name'             => 'Enterprise',
                'price'            => 199,
                'currency'         => 'USD',
                'interval'         => 'month',
                'job_post_limit'   => null,
                'featured_credits' => 20,
                'features_json'    => json_encode(['Unlimited job posts', '20 featured listings', 'Full resume access', 'Dedicated account manager', 'Custom branding', 'API access']),
                'is_active'        => 1,
            ],
        ];
        DB::table('plans')->insertOrIgnore($plans);

        // ── Default Settings ──────────────────────────────────────────────────
        $settings = [
            ['group' => 'homepage', 'key' => 'featured_jobs_limit',      'value' => '8'],
            ['group' => 'homepage', 'key' => 'featured_companies_limit',  'value' => '6'],
            ['group' => 'homepage', 'key' => 'top_employers_limit',       'value' => '8'],
            ['group' => 'brand',    'key' => 'brandName',                 'value' => 'Krama'],
            ['group' => 'chat',     'key' => 'enabled',                   'value' => '0'],
        ];
        DB::table('settings')->insertOrIgnore($settings);

        // ── Super-admin user ──────────────────────────────────────────────────
        $superAdminRoleId = $roleIds['super_admin'];
        $exists = DB::table('users')->where('email', 'admin@krama.local')->exists();
        if (! $exists) {
            DB::table('users')->insert([
                'role_id'           => $superAdminRoleId,
                'name'              => 'Krama Admin',
                'email'             => 'admin@krama.local',
                'password_hash'     => Hash::make('Admin@1234'),
                'status'            => 'active',
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        }

        // ── Mock company & job data ───────────────────────────────────────────
        $this->call(MockDataSeeder::class);
    }
}
