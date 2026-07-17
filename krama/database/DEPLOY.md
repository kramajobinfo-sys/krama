# Deploy Krama — XAMPP + MySQL (full-stack)

This project ships two things:

1. **A front-end design system** — static HTML + React (in-browser Babel), CSS tokens, fonts, assets, and four high-fidelity UI kits (public website, candidate, employer, admin).
2. **A MySQL database** — `krama_schema.sql` (tables) + `seed.sql` (sample data matching the mockups).

There is **no backend API code yet** — the UI kits run on in-memory demo data. This guide gets the UI served, the database loaded, and tells you how to wire a real backend. **Recommended DB: MySQL 8 / MariaDB 10.4+ (what XAMPP includes).**

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
Generated by the Krama Design System.
