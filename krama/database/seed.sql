-- =====================================================================
--  Krama Job Portal — sample/demo seed data
--  Run AFTER krama_schema.sql:
--    mysql -u root krama < database/krama_schema.sql
--    mysql -u root krama < database/seed.sql
--  (or import both, in this order, via phpMyAdmin → Import)
--
--  Demo password for EVERY account below is:  password
--  (bcrypt hash $2y$10$… is Laravel/PHP-compatible. If your backend uses a
--   different cost or algorithm, re-hash on first run.)
-- =====================================================================

USE `krama`;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
--  Users  (1 super admin, 1 admin, employers, candidates)
--  password = "password"
-- ---------------------------------------------------------------------
SET @pw := '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
SET @r_super := (SELECT id FROM roles WHERE slug='super_admin');
SET @r_admin := (SELECT id FROM roles WHERE slug='admin');
SET @r_emp   := (SELECT id FROM roles WHERE slug='employer');
SET @r_cand  := (SELECT id FROM roles WHERE slug='candidate');

INSERT INTO `users` (`id`,`role_id`,`name`,`email`,`password_hash`,`phone`,`status`,`email_verified_at`) VALUES
  (1, @r_super, 'Sophea Admin',     'admin@krama.test',        @pw, '+855 12 000 001', 'active', NOW()),
  (2, @r_admin, 'Dara Moderator',   'moderator@krama.test',    @pw, '+855 12 000 002', 'active', NOW()),
  -- employers
  (10, @r_emp, 'Rithy Sok',        'hr@ababank.test',         @pw, '+855 23 225 333', 'active', NOW()),
  (11, @r_emp, 'Chenda Pich',      'careers@smart.test',      @pw, '+855 81 900 111', 'active', NOW()),
  (12, @r_emp, 'Vibol Chan',       'jobs@wingbank.test',      @pw, '+855 23 999 989', 'active', NOW()),
  (13, @r_emp, 'Sreypov Meas',     'talent@manulife.test',    @pw, '+855 23 965 999', 'active', NOW()),
  (14, @r_emp, 'Pisey Long',       'hr@cellcard.test',        @pw, '+855 12 800 800', 'active', NOW()),
  -- candidates
  (20, @r_cand, 'Sokha Vann',      'sokha@gmail.test',        @pw, '+855 96 111 222', 'active', NOW()),
  (21, @r_cand, 'Nita Hong',       'nita@gmail.test',         @pw, '+855 70 333 444', 'active', NOW()),
  (22, @r_cand, 'Visal Tep',       'visal@gmail.test',        @pw, '+855 88 555 666', 'active', NOW());

-- map each role to its full permission set (super already mapped in schema)
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
  SELECT @r_admin, id FROM permissions
  WHERE slug IN ('view_dashboard','view_reports','approve_companies','approve_jobs',
                 'suspend_users','manage_categories','manage_locations','manage_cms');
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
  SELECT @r_emp, id FROM permissions
  WHERE slug IN ('view_dashboard','post_jobs','view_applicants','download_resume');
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
  SELECT @r_cand, id FROM permissions
  WHERE slug IN ('apply_jobs','build_resume','save_jobs');

-- ---------------------------------------------------------------------
--  Companies (approved, owned by the employers above)
-- ---------------------------------------------------------------------
INSERT INTO `companies` (`id`,`user_id`,`name`,`registration_no`,`industry`,`website`,`address`,`location_id`,`description`,`status`,`is_verified`) VALUES
  (100, 10, 'ABA Bank',     'KH-0001-ABA',  'Banking',          'https://ababank.com',  'Phnom Penh, Cambodia', 2, 'Leading commercial bank in Cambodia.',           'approved', 1),
  (101, 11, 'Smart Axiata', 'KH-0002-SMA',  'Telecommunications','https://smart.com.kh', 'Phnom Penh, Cambodia', 2, 'Largest mobile operator in the country.',         'approved', 1),
  (102, 12, 'Wing Bank',    'KH-0003-WNG',  'Banking',          'https://wingbank.com', 'Phnom Penh, Cambodia', 2, 'Mobile-first financial services.',                'approved', 1),
  (103, 13, 'Manulife',     'KH-0004-MNL',  'Insurance',        'https://manulife.com.kh','Phnom Penh, Cambodia',2, 'Life insurance and wealth management.',           'approved', 1),
  (104, 14, 'Cellcard',     'KH-0005-CEL',  'Telecommunications','https://cellcard.com.kh','Phnom Penh, Cambodia',2, '100% Cambodian-owned mobile network.',           'approved', 1),
  -- one pending company to demo the approval workflow
  (105, 14, 'Chip Mong',    'KH-0006-CMG',  'Retail',           'https://chipmong.com', 'Phnom Penh, Cambodia', 2, 'Property, retail and FMCG group.',                 'pending',  0);

-- ---------------------------------------------------------------------
--  Subscriptions
-- ---------------------------------------------------------------------
SET @p_free := (SELECT id FROM plans WHERE name='Free');
SET @p_std  := (SELECT id FROM plans WHERE name='Standard');
SET @p_prem := (SELECT id FROM plans WHERE name='Premium');
INSERT INTO `subscriptions` (`id`,`company_id`,`plan_id`,`status`,`renews_at`) VALUES
  (200, 100, @p_std,  'active', DATE_ADD(NOW(), INTERVAL 1 MONTH)),
  (201, 101, @p_prem, 'active', DATE_ADD(NOW(), INTERVAL 1 MONTH)),
  (202, 102, @p_std,  'active', DATE_ADD(NOW(), INTERVAL 1 MONTH)),
  (203, 103, @p_free, 'active', NULL),
  (204, 104, @p_prem, 'active', DATE_ADD(NOW(), INTERVAL 1 MONTH));

-- ---------------------------------------------------------------------
--  Jobs (published + featured, plus one pending for the moderation queue)
-- ---------------------------------------------------------------------
SET @c_it  := (SELECT id FROM categories WHERE slug='it');
SET @c_acc := (SELECT id FROM categories WHERE slug='accounting');
SET @c_fin := (SELECT id FROM categories WHERE slug='finance');
SET @c_mkt := (SELECT id FROM categories WHERE slug='marketing');
SET @c_hr  := (SELECT id FROM categories WHERE slug='hr');
SET @c_eng := (SELECT id FROM categories WHERE slug='engineering');

INSERT INTO `jobs`
  (`id`,`company_id`,`category_id`,`location_id`,`title`,`slug`,`job_type`,`experience_level`,
   `salary_min`,`salary_max`,`salary_currency`,`salary_period`,`is_remote`,`description`,`requirements`,`benefits`,
   `is_featured`,`status`,`views`,`expires_at`,`published_at`) VALUES
  (300,100,@c_it ,2,'Senior Software Engineer','senior-software-engineer','full_time','senior',2500,3500,'USD','month',1,
   'Build and scale the bank''s digital platform.','5+ years backend; Node or Java; SQL.','Health, bonus, hybrid.',1,'published',420,DATE_ADD(CURDATE(),INTERVAL 25 DAY),NOW()),
  (301,101,@c_mkt,2,'Digital Marketing Manager','digital-marketing-manager','full_time','mid',1500,2200,'USD','month',0,
   'Own performance marketing across channels.','3+ years digital; analytics.','Phone, data, bonus.',1,'published',310,DATE_ADD(CURDATE(),INTERVAL 20 DAY),NOW()),
  (302,102,@c_fin,2,'Financial Analyst','financial-analyst','full_time','junior',900,1300,'USD','month',0,
   'Reporting, forecasting and budgeting.','Finance degree; Excel.','Insurance, training.',1,'published',180,DATE_ADD(CURDATE(),INTERVAL 18 DAY),NOW()),
  (303,103,@c_acc,2,'Accountant','accountant','full_time','mid',800,1200,'USD','month',0,
   'Manage GL, AP/AR and month-end close.','ACCA part-qualified.','Medical, 13th month.',1,'published',150,DATE_ADD(CURDATE(),INTERVAL 15 DAY),NOW()),
  (304,104,@c_eng,3,'Network Engineer','network-engineer','full_time','mid',1200,1800,'USD','month',0,
   'Maintain and expand the mobile core network.','CCNA; 3+ years.','Allowance, OT.',1,'published',95,DATE_ADD(CURDATE(),INTERVAL 22 DAY),NOW()),
  (305,100,@c_hr ,2,'HR Business Partner','hr-business-partner','full_time','senior',1400,2000,'USD','month',0,
   'Partner with leaders on people strategy.','5+ years HR.','Bonus, hybrid.',0,'published',60,DATE_ADD(CURDATE(),INTERVAL 28 DAY),NOW()),
  (306,101,@c_it ,2,'Frontend Developer (React)','frontend-developer-react','full_time','junior',1000,1500,'USD','month',1,
   'Build customer-facing web apps.','React, TypeScript.','Remote-friendly.',0,'published',240,DATE_ADD(CURDATE(),INTERVAL 19 DAY),NOW()),
  (307,102,@c_it ,2,'DevOps Engineer','devops-engineer','full_time','senior',2000,3000,'USD','month',1,
   'CI/CD, containers and cloud infra.','Docker, K8s, AWS.','Stock, remote.',0,'published',130,DATE_ADD(CURDATE(),INTERVAL 21 DAY),NOW()),
  -- pending job for the admin approval queue
  (308,104,@c_mkt,2,'Content Writer (Khmer/English)','content-writer','contract','entry',600,900,'USD','month',1,
   'Write bilingual marketing content.','Khmer + English fluency.','Flexible hours.',0,'pending',0,DATE_ADD(CURDATE(),INTERVAL 30 DAY),NULL);

-- ---------------------------------------------------------------------
--  Résumés + applications (pipeline)
-- ---------------------------------------------------------------------
INSERT INTO `resumes` (`id`,`candidate_id`,`headline`,`summary`,`is_primary`) VALUES
  (400, 20, 'Full-Stack Developer', '4 years building web apps with React and Node.', 1),
  (401, 21, 'Marketing Specialist', 'Performance marketer with agency background.', 1),
  (402, 22, 'Junior Accountant',    'ACCA student seeking first full-time role.', 1);

INSERT INTO `resume_sections` (`resume_id`,`kind`,`title`,`subtitle`,`detail`,`start_date`,`end_date`,`sort_order`) VALUES
  (400,'experience','Software Developer','TechStart Co.','Built internal tools.','2022-01-01',NULL,0),
  (400,'education','BSc Computer Science','RUPP','First class.','2017-09-01','2021-06-01',1),
  (400,'skill','React, Node, SQL',NULL,NULL,NULL,NULL,2),
  (401,'experience','Marketing Exec','AdAgency','Ran paid campaigns.','2021-03-01',NULL,0),
  (402,'education','Accounting Diploma','NUM',NULL,'2020-09-01','2023-06-01',0);

INSERT INTO `applications` (`job_id`,`candidate_id`,`resume_id`,`cover_note`,`stage`) VALUES
  (300,20,400,'Keen to join ABA''s platform team.','interview'),
  (306,20,400,'Strong React fit.','shortlisted'),
  (301,21,401,'Marketing background matches well.','reviewed'),
  (303,22,402,'Eager to start my accounting career.','applied'),
  (302,22,402,'Open to finance roles too.','applied');

INSERT INTO `saved_jobs` (`candidate_id`,`job_id`) VALUES
  (20,307),(20,301),(21,300),(22,304);

-- ---------------------------------------------------------------------
--  Payments (matches admin payment-history demo)
-- ---------------------------------------------------------------------
INSERT INTO `payments` (`company_id`,`subscription_id`,`invoice_no`,`amount`,`currency`,`method`,`status`,`paid_at`,`created_at`) VALUES
  (100,200,'INV-2026-0042',49.00,'USD','aba','paid',  '2026-06-01 09:12:00','2026-06-01 09:10:00'),
  (101,201,'INV-2026-0041',99.00,'USD','khqr','paid', '2026-06-01 10:02:00','2026-06-01 10:00:00'),
  (102,202,'INV-2026-0040',49.00,'USD','aba','paid',  '2026-05-31 14:20:00','2026-05-31 14:18:00'),
  (104,204,'INV-2026-0039',99.00,'USD','aba','paid',  '2026-05-30 11:05:00','2026-05-30 11:00:00'),
  (103,203,'INV-2026-0038', 0.00,'USD','other','paid','2026-05-30 08:00:00','2026-05-30 08:00:00'),
  (101,201,'INV-2026-0035',99.00,'USD','khqr','pending',NULL,             '2026-05-29 16:40:00'),
  (102,202,'INV-2026-0031',49.00,'USD','wing','paid', '2026-05-01 09:00:00','2026-05-01 09:00:00'),
  (105,NULL,'INV-2026-0028',49.00,'USD','khqr','failed',NULL,             '2026-04-28 12:30:00'),
  (100,200,'INV-2026-0019',49.00,'USD','khqr','paid', '2026-04-01 09:00:00','2026-04-01 09:00:00'),
  (104,204,'INV-2026-0014',99.00,'USD','aba','refunded','2026-03-15 10:00:00','2026-03-15 10:00:00');

-- ---------------------------------------------------------------------
--  Banners (admin-managed promos)
-- ---------------------------------------------------------------------
INSERT INTO `banners` (`title`,`message`,`cta_label`,`cta_url`,`theme`,`icon`,`image_fit`,`text_align`,`is_active`,`sort_order`) VALUES
  ('Hire faster with Krama','Reach thousands of qualified candidates across Cambodia.','Post a job','/employer','saffron','rocket','cover','left',1,0),
  ('Get your company verified','Stand out with a verified badge employers trust.','Verify now','/employer/company','teal','badge-check','cover','left',1,1),
  ('Featured placement','Put your company at the top of the directory and get 3× more views.','Go featured','/pricing','dark','gift','cover','left',1,2),
  ('Job alerts','Get an email the moment a matching role is posted.','Create alert','/alerts','saffron','bell','cover','left',1,3);

-- ---------------------------------------------------------------------
--  Notifications
-- ---------------------------------------------------------------------
INSERT INTO `notifications` (`user_id`,`type`,`title`,`body`,`link`) VALUES
  (10,'company_approval','Company approved','ABA Bank is now verified and can post jobs.','/employer'),
  (10,'new_application','New applicant','Sokha Vann applied to Senior Software Engineer.','/employer/applicants'),
  (20,'job_approval','Application update','You moved to the interview stage at ABA Bank.','/candidate/applications'),
  (1 ,'job_approval','Job pending review','Content Writer by Cellcard needs approval.','/admin/jobs');

-- ---------------------------------------------------------------------
--  CMS pages
-- ---------------------------------------------------------------------
INSERT INTO `cms_pages` (`slug`,`title`,`body_html`) VALUES
  ('home','Home','<h1>Find your next opportunity</h1>'),
  ('about','About Us','<p>Krama connects Cambodian talent with great employers.</p>'),
  ('contact','Contact Us','<p>Email hello@krama.test</p>'),
  ('terms','Terms of Service','<p>Standard terms apply.</p>'),
  ('privacy','Privacy Policy','<p>We respect your privacy.</p>');

-- ---------------------------------------------------------------------
--  Settings (chat agent, payment config, homepage limits)
-- ---------------------------------------------------------------------
INSERT INTO `settings` (`group`,`key`,`value`) VALUES
  ('chat','enabled','1'),
  ('chat','botName','Krama Assistant'),
  ('chat','launcher','Chat with us'),
  ('chat','welcome','Hi! I''m Krama''s assistant. Ask me about jobs, applications, or your account.'),
  ('chat','endpoint',''),
  ('chat','apiKey',''),
  ('chat','model',''),
  ('payment','khqr_enabled','1'),
  ('payment','aba_enabled','1'),
  ('payment','acleda_enabled','1'),
  ('payment','wing_enabled','1'),
  ('payment','merchant_name','Krama Co., Ltd.'),
  ('homepage','featured_companies_limit','8'),
  ('homepage','featured_jobs_limit','8'),
  ('homepage','top_employers_limit','6');

SET FOREIGN_KEY_CHECKS = 1;
-- =====================================================================
--  Done. Log in to the admin console with admin@krama.test / password
-- =====================================================================
