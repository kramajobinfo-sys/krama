# Deploy Krama — XAMPP + MySQL (full-stack)

This project ships two things:

1. **A front-end design system** — static HTML + React (in-browser Babel), CSS tokens, fonts, assets, and four high-fidelity UI kits (public website, candidate, employer, admin).
2. **A MySQL database** — `krama_schema.sql` (tables) + `seed.sql` (sample data matching the mockups).

The backend is a **Laravel API** under `krama-api/` (uploaded as a sibling of the public
document root). The UI kits talk to it over `/api`. **Recommended DB: MySQL 8 / MariaDB 10.4+.**

---

## 0. Go-live must-dos (do these on the server — the app fails silently without them)

These cannot be done for you in the repo; they must run on the production host.

**Secrets (H-4) — generate UNIQUE values; never reuse the dev keys:**
```bash
php artisan key:generate      # sets APP_KEY
php artisan jwt:secret        # sets JWT_SECRET
```
Copy `.env.hosting.template` to `.env` first and fill DB/mail/`APP_PUBLIC_PATH`. The
template ships APP_KEY/JWT_SECRET **blank** on purpose.

**Scheduler (H-1) — REQUIRED for payment reconciliation + subscription/boost expiry.**
Add ONE cron entry in cPanel → Cron Jobs (every minute):
```
* * * * * cd /home/YOUR_USER/krama-api && php artisan schedule:run >> /dev/null 2>&1
```
Verify: create a pending KHQR/ABA payment and confirm it flips to paid within ~3 min
with no webhook. Without this, a customer can pay and never be fulfilled.

**Queue (M-1) — verification/notification emails.** The template sets
`QUEUE_CONNECTION=sync` so queued work runs inline during the request — no worker
needed. If you switch to `database`, you MUST run a persistent worker
(`php artisan queue:work`) via Supervisor or a cron, or verification emails never send.

**After deploy:** `php artisan config:cache && php artisan route:cache`.

---

## 1. Serve the UI from XAMPP

1. Download the project zip (from the chat) and unzip it into `C:\xampp\htdocs\Krama\`
   → you should have `C:\xampp\htdocs\Krama\ui_kits\...`, `...\styles.css`, etc.
2. XAMPP Control Panel → **Start Apache**.
3. Open in a browser:
   - Public website → `http://localhost/Krama/ui_kits/public-website/index.html`
   - Candidate → `http://localhost/Krama/ui_kits/candidate-dashboard/index.html`
   - Employer → `http://localhost/Krama/ui_kits/employer-dashboard/index.html`
   - Admin → `http://localhost/Krama/ui_kits/admin-dashboard/index.html`

> Pages load React / Babel / Lucide from CDNs — keep internet on. Want a fully offline build? Ask me to bundle standalone copies.

---

## 2. Create & seed the database

1. XAMPP Control Panel → **Start MySQL**.
2. Open phpMyAdmin → `http://localhost/phpmyadmin`.
3. **Import** the two files **in this order**:
   1. `database/krama_schema.sql`  ← creates the `krama` DB + all tables + base lookups
   2. `database/seed.sql`          ← adds sample companies, jobs, applicants, payments, banners, settings

   Or from a terminal:
   ```bat
   C:\xampp\mysql\bin\mysql -u root < database\krama_schema.sql
   C:\xampp\mysql\bin\mysql -u root krama < database\seed.sql
   ```

4. **Demo logins** (password is `password` for all):
   - Super Admin → `admin@krama.test`
   - Moderator → `moderator@krama.test`
   - Employer → `hr@ababank.test`
   - Candidate → `sokha@gmail.test`

### What's in the database
`roles` · `permissions` · `role_permissions` (RBAC) · `users` · `social_accounts` (Google/Facebook/LinkedIn) · `auth_tokens` (refresh / reset / verify) · `locations` · `categories` · `companies` · `jobs` · `resumes` + `resume_sections` · `applications` · `saved_jobs` · `plans` · `subscriptions` · `payments` · `banners` · `notifications` · `audit_logs` · `cms_pages` · `settings` (chat agent, payment config, homepage limits).

---

## 3. Which database — and why MySQL here

| Option | Verdict for your setup |
|---|---|
| **MySQL 8 / MariaDB** ✅ | Bundled with XAMPP, schema already written for it, `utf8mb4` = full Khmer + emoji, supported by every host. **Use this.** |
| PostgreSQL | Slightly stronger for complex queries, but not in XAMPP and no real benefit here. Skip. |
| SQLite | Fine for quick local dev only; not for a multi-user portal. |

**Note:** XAMPP usually installs **MariaDB** (a MySQL fork). The schema uses standard InnoDB + `utf8mb4`, so it imports cleanly on either. Avoid MySQL-8-only JSON helper functions in backend code if you want to stay portable across both.

Connection settings (XAMPP defaults):
```
host: 127.0.0.1   port: 3306   database: krama
user: root        password: (empty)
```

---

## 4. Build the backend API (the remaining work)

The UI and DB are ready; you now need an API layer. Two recommended paths:

### Path A — PHP / Laravel (most native to XAMPP)
```bash
composer create-project laravel/laravel krama-api
# .env →
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=krama
DB_USERNAME=root
DB_PASSWORD=
```
Then build controllers/resources for auth (JWT/Sanctum), jobs, companies, applications, payments. Laravel runs on XAMPP's PHP directly. The `roles`/`permissions` tables are ready for RBAC (e.g. spatie/laravel-permission).

### Path B — Node / NestJS + Prisma (matches the original spec, JS end-to-end)
The original spec used PostgreSQL, but **Prisma supports MySQL** — just change the connector:
```prisma
datasource db {
  provider = "mysql"
  url      = "mysql://root@127.0.0.1:3306/krama"
}
```
```bash
npx prisma db pull     # generate models from the existing schema
npx prisma generate
```
Run NestJS separately (`localhost:3001`); XAMPP only provides the MySQL part.

### Then connect the front-end
The React kits currently use in-memory sample data. Replace those with `fetch()` calls to your API (e.g. `GET /api/jobs`, `POST /api/applications`). The mockups are your visual contract — match the fields to the table columns above.

---

## 5. Security checklist (before any real deployment)
- Hash passwords with bcrypt/argon2 (seed uses bcrypt `password` — change it).
- JWT access + refresh tokens (table `auth_tokens` is ready).
- Role-based access control via `role_permissions`.
- Rate limiting, CSRF, XSS escaping, parameterized queries (no string-concat SQL).
- Move payment API keys + chat API keys to **server-side** env vars (the `settings` table stores config, not secrets meant for the browser).
- Write to `audit_logs` on every sensitive admin action.

---

## 6. Upgrading the backend (Laravel version bumps)

For an **existing** production deployment, upgrading the framework only refreshes
code + Composer dependencies — it does **not** touch your server `.env`, `APP_KEY`,
`JWT_SECRET`, the scheduler cron, or the database. The current target is
**Laravel 12 on PHP 8.2** (upgraded from Laravel 8; the app ships its own framework
in `vendor/`, independent of the host's advertised PHP/Laravel version).

Run everything **on the host** (SSH or cPanel → Terminal), from the `krama-api/` dir.

**0. Pre-flight — PHP version.** L12 requires PHP ≥ 8.2 and fatals on anything older.
In cPanel → **MultiPHP Manager** set the domain to PHP 8.2, then confirm the CLI and
Composer run under it:
```bash
php -v            # must be 8.2.x — otherwise call ea-php82 explicitly,
                  # e.g. /opt/cpanel/ea-php82/root/usr/bin/php
composer -V
```

**1. Snapshot for rollback.** Note the current commit so you can return to it:
```bash
cd ~/krama-api && git rev-parse --short HEAD
```

**2. Pull the new code** (`.env` is gitignored, so it is never overwritten):
```bash
git fetch origin && git checkout main && git pull --ff-only origin main
```

**3. Install production dependencies** (omits phpunit/larastan/pint/etc.):
```bash
composer install --no-dev --optimize-autoloader
```

**4. Rebuild framework caches:**
```bash
php artisan config:clear && php artisan route:clear
php artisan config:cache && php artisan route:cache
```

**5. Reload PHP** to clear opcache (cPanel → *Select PHP Version* → restart, or
`killall php-fpm` on CloudLinux; skip on plain suPHP/CGI where files reload per request).

**6. Verify:**
```bash
curl -s https://YOUR_DOMAIN/api/health
# → {"status":"ok","checks":{"database":"ok","cache":"ok"}}
```
Then load the public site and perform one real login in the browser to confirm JWT
auth works end-to-end.

**Rollback** if anything breaks (`PREV` = the hash from step 1):
```bash
git reset --hard PREV && composer install --no-dev --optimize-autoloader
php artisan config:cache && php artisan route:cache
```

### Notes for the 8 → 12 jump specifically
- **No new migrations** — the schema is unchanged, so no `migrate` is required
  (`php artisan migrate --force` is a harmless no-op if you run it out of habit).
- **Do not re-add** `fruitcake/laravel-cors` or `facade/ignition` — both were removed
  on purpose. Cross-origin handling is now Laravel's built-in
  `Illuminate\Http\Middleware\HandleCors` (registered in `app/Http/Kernel.php`) driven
  by the existing `config/cors.php`.
- `composer.json` pins `config.platform.php` to **8.2.32**, so `composer install`
  resolves the exact dependency set that was tested for this release.
- Key code deltas in the upgrade: the CORS middleware namespace swap above, and
  Carbon 3 (bundled with L12) requiring integer args to `add*()` — JWT `ttl`/`refresh_ttl`
  and a few `addDays/addMinutes` calls are now `(int)`-cast. Nothing else changed behaviorally.

---
Generated by the Krama Design System.
