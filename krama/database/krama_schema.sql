-- =====================================================================
--  Krama Job Portal — MySQL schema
--  Generated from the Krama product spec. MySQL 8.0+ / utf8mb4.
--  Import via phpMyAdmin (Import tab) or:  mysql -u root krama < krama_schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `krama`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `krama`;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
--  Roles & permissions (RBAC)
-- ---------------------------------------------------------------------
CREATE TABLE `roles` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`       VARCHAR(40)  NOT NULL,        -- super_admin | admin | employer | candidate
  `name`       VARCHAR(80)  NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_slug` (`slug`)
) ENGINE=InnoDB;

CREATE TABLE `permissions` (
  `id`    INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`  VARCHAR(60)  NOT NULL,             -- e.g. approve_jobs, manage_users
  `area`  VARCHAR(60)  NOT NULL,             -- Dashboard, Moderation, Content, ...
  `label` VARCHAR(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_perm_slug` (`slug`)
) ENGINE=InnoDB;

CREATE TABLE `role_permissions` (
  `role_id`       INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Users
-- ---------------------------------------------------------------------
CREATE TABLE `users` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id`         INT UNSIGNED    NOT NULL,
  `name`            VARCHAR(120)    NOT NULL,
  `email`           VARCHAR(190)    NOT NULL,
  `password_hash`   VARCHAR(255)    NULL,     -- null when social-only
  `phone`           VARCHAR(40)     NULL,
  `avatar_url`      VARCHAR(255)    NULL,
  `status`          ENUM('active','suspended','pending') NOT NULL DEFAULT 'active',
  `email_verified_at` DATETIME      NULL,
  `last_active_at`  DATETIME        NULL,
  `created_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB;

-- Social logins (Google, Facebook, LinkedIn)
CREATE TABLE `social_accounts` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT UNSIGNED NOT NULL,
  `provider`     ENUM('google','facebook','linkedin') NOT NULL,
  `provider_uid` VARCHAR(190) NOT NULL,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_provider` (`provider`, `provider_uid`),
  CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Refresh tokens / password resets
CREATE TABLE `auth_tokens` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `type`       ENUM('refresh','password_reset','email_verify') NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_token_user` (`user_id`),
  CONSTRAINT `fk_token_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Locations (Country > Province > City)
-- ---------------------------------------------------------------------
CREATE TABLE `locations` (
  `id`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` INT UNSIGNED NULL,
  `type`      ENUM('country','province','city') NOT NULL,
  `name`      VARCHAR(120) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_loc_parent` (`parent_id`),
  CONSTRAINT `fk_loc_parent` FOREIGN KEY (`parent_id`) REFERENCES `locations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Categories
-- ---------------------------------------------------------------------
CREATE TABLE `categories` (
  `id`     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`   VARCHAR(120) NOT NULL,
  `slug`   VARCHAR(120) NOT NULL,
  `icon`   VARCHAR(60)  NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cat_slug` (`slug`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Companies
-- ---------------------------------------------------------------------
CREATE TABLE `companies` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        BIGINT UNSIGNED NOT NULL,     -- owning employer
  `name`           VARCHAR(190) NOT NULL,
  `registration_no` VARCHAR(80) NULL,
  `industry`       VARCHAR(120) NULL,
  `website`        VARCHAR(190) NULL,
  `address`        VARCHAR(255) NULL,
  `location_id`    INT UNSIGNED NULL,
  `logo_url`       VARCHAR(255) NULL,
  `description`    TEXT NULL,
  `status`         ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  `is_verified`    TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comp_user` (`user_id`),
  KEY `idx_comp_status` (`status`),
  CONSTRAINT `fk_comp_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comp_loc`  FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Jobs
-- ---------------------------------------------------------------------
CREATE TABLE `jobs` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id`     BIGINT UNSIGNED NOT NULL,
  `category_id`    INT UNSIGNED NULL,
  `location_id`    INT UNSIGNED NULL,
  `title`          VARCHAR(190) NOT NULL,
  `slug`           VARCHAR(210) NULL,
  `job_type`       ENUM('full_time','part_time','contract','internship','temporary') NOT NULL DEFAULT 'full_time',
  `experience_level` ENUM('entry','junior','mid','senior','lead','executive') NULL,
  `salary_min`     DECIMAL(12,2) NULL,
  `salary_max`     DECIMAL(12,2) NULL,
  `salary_currency` VARCHAR(8) NOT NULL DEFAULT 'USD',
  `salary_period`  ENUM('hour','day','month','year') NOT NULL DEFAULT 'month',
  `is_remote`      TINYINT(1) NOT NULL DEFAULT 0,
  `description`    TEXT NULL,
  `requirements`   TEXT NULL,
  `benefits`       TEXT NULL,
  `is_featured`    TINYINT(1) NOT NULL DEFAULT 0,
  `status`         ENUM('draft','pending','published','rejected','closed') NOT NULL DEFAULT 'draft',
  `rejection_reason` VARCHAR(255) NULL,
  `views`          INT UNSIGNED NOT NULL DEFAULT 0,
  `expires_at`     DATE NULL,
  `published_at`   DATETIME NULL,
  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_jobs_company` (`company_id`),
  KEY `idx_jobs_category` (`category_id`),
  KEY `idx_jobs_status` (`status`),
  KEY `idx_jobs_featured` (`is_featured`),
  CONSTRAINT `fk_jobs_company`  FOREIGN KEY (`company_id`)  REFERENCES `companies`(`id`)  ON DELETE CASCADE,
  CONSTRAINT `fk_jobs_category` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_jobs_loc`      FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Résumés
-- ---------------------------------------------------------------------
CREATE TABLE `resumes` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `candidate_id` BIGINT UNSIGNED NOT NULL,
  `headline`     VARCHAR(190) NULL,
  `summary`      TEXT NULL,
  `file_url`     VARCHAR(255) NULL,            -- uploaded CV (S3)
  `is_primary`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_resume_candidate` (`candidate_id`),
  CONSTRAINT `fk_resume_user` FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `resume_sections` (
  `id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `resume_id` BIGINT UNSIGNED NOT NULL,
  `kind`      ENUM('education','experience','skill','certification') NOT NULL,
  `title`     VARCHAR(190) NULL,
  `subtitle`  VARCHAR(190) NULL,
  `detail`    TEXT NULL,
  `start_date` DATE NULL,
  `end_date`   DATE NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_section_resume` (`resume_id`),
  CONSTRAINT `fk_section_resume` FOREIGN KEY (`resume_id`) REFERENCES `resumes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Applications (pipeline)
-- ---------------------------------------------------------------------
CREATE TABLE `applications` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `job_id`       BIGINT UNSIGNED NOT NULL,
  `candidate_id` BIGINT UNSIGNED NOT NULL,
  `resume_id`    BIGINT UNSIGNED NULL,
  `cover_note`   TEXT NULL,
  `stage`        ENUM('applied','reviewed','shortlisted','interview','offered','rejected') NOT NULL DEFAULT 'applied',
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_application` (`job_id`, `candidate_id`),
  KEY `idx_app_candidate` (`candidate_id`),
  KEY `idx_app_stage` (`stage`),
  CONSTRAINT `fk_app_job`    FOREIGN KEY (`job_id`)       REFERENCES `jobs`(`id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_app_user`   FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`)   ON DELETE CASCADE,
  CONSTRAINT `fk_app_resume` FOREIGN KEY (`resume_id`)    REFERENCES `resumes`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Saved / bookmarked jobs
CREATE TABLE `saved_jobs` (
  `candidate_id` BIGINT UNSIGNED NOT NULL,
  `job_id`       BIGINT UNSIGNED NOT NULL,
  `created_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`candidate_id`, `job_id`),
  CONSTRAINT `fk_saved_user` FOREIGN KEY (`candidate_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saved_job`  FOREIGN KEY (`job_id`)       REFERENCES `jobs`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Subscriptions & payments
-- ---------------------------------------------------------------------
CREATE TABLE `plans` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(80) NOT NULL,        -- Free | Standard | Premium
  `price`         DECIMAL(10,2) NOT NULL DEFAULT 0,
  `currency`      VARCHAR(8) NOT NULL DEFAULT 'USD',
  `interval`      ENUM('month','year','once') NOT NULL DEFAULT 'month',
  `job_post_limit` INT NULL,                   -- null = unlimited
  `featured_credits` INT NOT NULL DEFAULT 0,
  `features_json` JSON NULL,
  `is_active`     TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE `subscriptions` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` BIGINT UNSIGNED NOT NULL,
  `plan_id`    INT UNSIGNED NOT NULL,
  `status`     ENUM('active','past_due','canceled','expired') NOT NULL DEFAULT 'active',
  `started_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `renews_at`  DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sub_company` (`company_id`),
  CONSTRAINT `fk_sub_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_plan`    FOREIGN KEY (`plan_id`)    REFERENCES `plans`(`id`)
) ENGINE=InnoDB;

CREATE TABLE `payments` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id`     BIGINT UNSIGNED NOT NULL,
  `subscription_id` BIGINT UNSIGNED NULL,
  `invoice_no`     VARCHAR(40) NOT NULL,
  `amount`         DECIMAL(10,2) NOT NULL,
  `currency`       VARCHAR(8) NOT NULL DEFAULT 'USD',
  `method`         ENUM('stripe','aba','wing','khqr','card','other') NOT NULL DEFAULT 'khqr',
  `status`         ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `paid_at`        DATETIME NULL,
  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_invoice` (`invoice_no`),
  KEY `idx_pay_company` (`company_id`),
  CONSTRAINT `fk_pay_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_sub`     FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Promotional banners (admin-managed)
-- ---------------------------------------------------------------------
CREATE TABLE `banners` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`      VARCHAR(190) NOT NULL,
  `message`    VARCHAR(255) NULL,
  `cta_label`  VARCHAR(80) NULL,
  `cta_url`    VARCHAR(255) NULL,
  `theme`      ENUM('saffron','teal','dark') NOT NULL DEFAULT 'saffron',
  `icon`       VARCHAR(40) NULL,
  `image_url`  VARCHAR(255) NULL,
  `image_fit`  ENUM('cover','contain') NOT NULL DEFAULT 'cover',
  `text_align` ENUM('left','center') NOT NULL DEFAULT 'left',
  `is_active`  TINYINT(1) NOT NULL DEFAULT 1,
  `starts_at`  DATE NULL,
  `ends_at`    DATE NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Notifications & audit log
-- ---------------------------------------------------------------------
CREATE TABLE `notifications` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NOT NULL,
  `type`       VARCHAR(60) NOT NULL,          -- registration_approval, job_approval, ...
  `title`      VARCHAR(190) NOT NULL,
  `body`       VARCHAR(500) NULL,
  `link`       VARCHAR(255) NULL,
  `read_at`    DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notif_user` (`user_id`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE `audit_logs` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT UNSIGNED NULL,          -- actor
  `action`     VARCHAR(120) NOT NULL,
  `entity`     VARCHAR(60) NULL,              -- job, company, user, ...
  `entity_id`  BIGINT UNSIGNED NULL,
  `meta_json`  JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user` (`user_id`),
  KEY `idx_audit_entity` (`entity`, `entity_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  CMS pages
-- ---------------------------------------------------------------------
CREATE TABLE `cms_pages` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug`       VARCHAR(120) NOT NULL,         -- home, about, contact, terms, privacy
  `title`      VARCHAR(190) NOT NULL,
  `body_html`  MEDIUMTEXT NULL,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cms_slug` (`slug`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
--  Settings (admin-managed key/value: chat agent, payments, homepage)
-- ---------------------------------------------------------------------
CREATE TABLE `settings` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `group`      VARCHAR(40)  NOT NULL,          -- chat | payment | homepage | site
  `key`        VARCHAR(80)  NOT NULL,
  `value`      TEXT NULL,                       -- string or JSON
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_setting` (`group`, `key`)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
--  Seed data (base lookups — see seed.sql for sample demo content)
-- =====================================================================
INSERT INTO `roles` (`slug`,`name`,`description`) VALUES
  ('super_admin','Super Admin','Full control of the entire system.'),
  ('admin','Admin','Moderates content; no billing or role changes.'),
  ('employer','Employer','Posts jobs and manages applicants.'),
  ('candidate','Candidate','Searches and applies to jobs.');

INSERT INTO `permissions` (`slug`,`area`,`label`) VALUES
  ('view_dashboard','Dashboard & reports','View dashboard'),
  ('view_reports','Dashboard & reports','View reports'),
  ('view_audit','Dashboard & reports','View audit logs'),
  ('approve_companies','Moderation','Approve companies'),
  ('approve_jobs','Moderation','Approve jobs'),
  ('suspend_users','Moderation','Suspend users'),
  ('manage_categories','Content','Manage categories'),
  ('manage_locations','Content','Manage locations'),
  ('manage_cms','Content','Manage CMS pages'),
  ('manage_plans','Commerce','Manage plans'),
  ('manage_payments','Commerce','Manage payments'),
  ('manage_users','Administration','Manage users'),
  ('manage_roles','Administration','Manage roles & permissions'),
  ('site_settings','Administration','Site settings'),
  ('post_jobs','Employer actions','Post jobs'),
  ('view_applicants','Employer actions','View applicants'),
  ('download_resume','Employer actions','Download résumés'),
  ('apply_jobs','Candidate actions','Apply to jobs'),
  ('build_resume','Candidate actions','Build résumé'),
  ('save_jobs','Candidate actions','Save jobs');

-- super_admin gets everything
INSERT INTO `role_permissions` (`role_id`,`permission_id`)
  SELECT (SELECT id FROM roles WHERE slug='super_admin'), id FROM permissions;

INSERT INTO `plans` (`name`,`price`,`interval`,`job_post_limit`,`featured_credits`,`features_json`) VALUES
  ('Free',0,'month',1,0,JSON_ARRAY('1 active job post','Standard listing','Basic applicant list','Email support')),
  ('Standard',49,'month',10,0,JSON_ARRAY('10 active job posts','Applicant tracking pipeline','Résumé downloads','Priority support')),
  ('Premium',99,'month',NULL,3,JSON_ARRAY('Unlimited job posts','3 featured listings / mo','Résumé database search','AI candidate matching','Dedicated manager'));

INSERT INTO `categories` (`name`,`slug`,`icon`) VALUES
  ('Information Technology','it','monitor'),
  ('Accounting','accounting','calculator'),
  ('Finance','finance','landmark'),
  ('Marketing','marketing','megaphone'),
  ('Human Resources','hr','users'),
  ('Engineering','engineering','hard-hat');

INSERT INTO `locations` (`id`,`parent_id`,`type`,`name`) VALUES
  (1,NULL,'country','Cambodia'),
  (2,1,'province','Phnom Penh'),
  (3,1,'province','Siem Reap'),
  (4,1,'province','Battambang');
