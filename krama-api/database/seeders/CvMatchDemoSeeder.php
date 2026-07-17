<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Job;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Demo candidate résumés for testing the CV Match feature (admin + employer).
 * Idempotent: re-running updates the same demo users (matched by email) instead
 * of creating duplicates. All demo emails end in "@cvdemo.test".
 */
class CvMatchDemoSeeder extends Seeder
{
    public function run(): void
    {
        $candidateRoleId = 3; // roles: 1 super_admin, 2 admin, 3 candidate, 4 employer

        $people = [
            [
                'name' => 'Sokha Chan', 'email' => 'sokha.chan@cvdemo.test',
                'headline' => 'Senior Frontend Engineer',
                'summary'  => 'Frontend engineer with 6 years building React and TypeScript web apps, design systems, and accessible UIs for fintech and e-commerce.',
                'skills'   => ['React', 'TypeScript', 'Next.js', 'Redux', 'Tailwind CSS', 'HTML', 'CSS', 'Jest'],
                'experience' => [
                    ['title' => 'Senior Frontend Engineer', 'company' => 'Wing Bank', 'period' => '2022–Present'],
                    ['title' => 'Frontend Engineer', 'company' => 'Smart Axiata', 'period' => '2020–2022'],
                    ['title' => 'UI Developer', 'company' => 'Pathmazing', 'period' => '2018–2020'],
                    ['title' => 'Junior Web Developer', 'company' => 'Codingate', 'period' => '2017–2018'],
                ],
                'education'  => ['BSc Computer Science, Royal University of Phnom Penh'],
                'languages'  => ['Khmer', 'English'],
                'certifications' => ['AWS Certified Cloud Practitioner'],
            ],
            [
                'name' => 'Dara Kim', 'email' => 'dara.kim@cvdemo.test',
                'headline' => 'Full-Stack Developer',
                'summary'  => 'Full-stack developer comfortable across React front ends and Node.js APIs, with PostgreSQL and Docker in production.',
                'skills'   => ['React', 'Node.js', 'TypeScript', 'Express', 'PostgreSQL', 'Docker', 'REST APIs'],
                'experience' => [
                    ['title' => 'Full-Stack Developer', 'company' => 'BongThom', 'period' => '2021–Present'],
                    ['title' => 'Web Developer', 'company' => 'Slash', 'period' => '2019–2021'],
                    ['title' => 'Software Intern', 'company' => 'KOSIGN', 'period' => '2018–2019'],
                ],
                'education'  => ['BSc Software Engineering, Institute of Technology of Cambodia'],
                'languages'  => ['Khmer', 'English'],
                'certifications' => [],
            ],
            [
                'name' => 'Vichea Prom', 'email' => 'vichea.prom@cvdemo.test',
                'headline' => 'Backend Engineer',
                'summary'  => 'Backend engineer focused on scalable Node.js and Python services, databases, and cloud infrastructure.',
                'skills'   => ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'Microservices'],
                'experience' => [
                    ['title' => 'Backend Engineer', 'company' => 'ABA Bank', 'period' => '2021–Present'],
                    ['title' => 'Software Engineer', 'company' => 'Cellcard', 'period' => '2019–2021'],
                    ['title' => 'Backend Developer', 'company' => 'Sabay', 'period' => '2018–2019'],
                ],
                'education'  => ['BSc Information Technology, Norton University'],
                'languages'  => ['Khmer', 'English'],
                'certifications' => ['AWS Certified Solutions Architect – Associate'],
            ],
            [
                'name' => 'Nita Sokhom', 'email' => 'nita.sokhom@cvdemo.test',
                'headline' => 'UI/UX Designer',
                'summary'  => 'Product designer crafting design systems and prototypes, with front-end fluency in HTML, CSS, and JavaScript.',
                'skills'   => ['Figma', 'Adobe XD', 'Design Systems', 'Prototyping', 'HTML', 'CSS', 'JavaScript'],
                'experience' => [
                    ['title' => 'UI/UX Designer', 'company' => 'Pi Pay', 'period' => '2021–Present'],
                    ['title' => 'Product Designer', 'company' => 'Morakot', 'period' => '2019–2021'],
                ],
                'education'  => ['BA Graphic Design, Limkokwing University'],
                'languages'  => ['Khmer', 'English', 'French'],
                'certifications' => [],
            ],
            [
                'name' => 'Ratana Meng', 'email' => 'ratana.meng@cvdemo.test',
                'headline' => 'Data Analyst',
                'summary'  => 'Data analyst turning raw data into dashboards and insights using Python, SQL, and BI tools.',
                'skills'   => ['Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'Pandas', 'Statistics'],
                'experience' => [
                    ['title' => 'Data Analyst', 'company' => 'Prince Bank', 'period' => '2020–Present'],
                    ['title' => 'Business Analyst', 'company' => 'Manulife', 'period' => '2018–2020'],
                ],
                'education'  => ['BSc Statistics & Economics, RUPP'],
                'languages'  => ['Khmer', 'English'],
                'certifications' => ['Google Data Analytics Certificate'],
            ],
            [
                'name' => 'Panha Sok', 'email' => 'panha.sok@cvdemo.test',
                'headline' => 'Frontend Engineer',
                'summary'  => 'React and TypeScript frontend engineer building design-system-driven web apps with Next.js and Redux.',
                'skills'   => ['React', 'TypeScript', 'Next.js', 'Redux', 'Tailwind CSS', 'HTML', 'CSS'],
                'experience' => [
                    ['title' => 'Frontend Engineer', 'company' => 'Chip Mong Bank', 'period' => '2021–Present'],
                    ['title' => 'Frontend Developer', 'company' => 'Edemy', 'period' => '2019–2021'],
                    ['title' => 'Web Developer', 'company' => 'Web Essentials', 'period' => '2018–2019'],
                ],
                'education'  => ['BSc Computer Science, Royal University of Phnom Penh'],
                'languages'  => ['Khmer', 'English'],
                'certifications' => [],
            ],
            [
                'name' => 'Bopha Lim', 'email' => 'bopha.lim@cvdemo.test',
                'headline' => 'Junior Frontend Developer',
                'summary'  => 'Junior developer building responsive websites with React and modern JavaScript, eager to grow into a frontend role.',
                'skills'   => ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
                'experience' => [
                    ['title' => 'Junior Frontend Developer', 'company' => 'Codingate', 'period' => '2023–Present'],
                ],
                'education'  => ['Diploma in Web Development, ODC'],
                'languages'  => ['Khmer', 'English'],
                'certifications' => [],
            ],
        ];

        // Published jobs of the company with the most listings — used to make the
        // demo candidates applicants so Employer CV Match has a pool too.
        $topCompanyId = Job::where('status', 'published')
            ->selectRaw('company_id, COUNT(*) c')->groupBy('company_id')
            ->orderByDesc('c')->value('company_id');
        $jobIds = Job::where('status', 'published')
            ->where('company_id', $topCompanyId)
            ->orderBy('id')->limit(6)->pluck('id')->all();

        $now = now();
        $made = 0;

        foreach ($people as $i => $p) {
            // User model has $timestamps = false and created_at/updated_at are not
            // fillable, so forceFill to guarantee timestamps are written.
            $user = User::firstOrNew(['email' => $p['email']]);
            $user->forceFill([
                'role_id'           => $candidateRoleId,
                'name'              => $p['name'],
                'password_hash'     => Hash::make('Candidate@123'),
                'status'            => 'active',
                'email_verified_at' => $now,
                'created_at'        => $user->created_at ?: $now,
                'updated_at'        => $now,
            ])->save();

            // One primary résumé per demo candidate (refresh its data on re-run).
            $resume = Resume::updateOrCreate(
                ['candidate_id' => $user->id, 'is_primary' => true],
                [
                    'headline' => $p['headline'],
                    'summary'  => $p['summary'],
                    'data'     => [
                        'skills'         => $p['skills'],
                        'experience'     => $p['experience'],
                        'education'      => $p['education'],
                        'languages'      => $p['languages'],
                        'certifications' => $p['certifications'],
                    ],
                ]
            );

            // Make them applicants (spread across the top company's jobs) so the
            // Employer CV Match applicant pool is populated. Skipped if no jobs.
            if (!empty($jobIds)) {
                $jobId = $jobIds[$i % count($jobIds)];
                Application::firstOrCreate(
                    ['job_id' => $jobId, 'candidate_id' => $user->id],
                    ['resume_id' => $resume->id, 'cover_note' => 'Interested in this role — see my résumé.', 'stage' => 'applied', 'created_at' => $now, 'updated_at' => $now]
                );
            }

            $made++;
        }

        $this->command->info("CvMatchDemoSeeder: {$made} demo candidate résumés ready.");
        $this->command->info("Applicants attached to company_id={$topCompanyId} jobs: " . implode(',', $jobIds));
    }
}
