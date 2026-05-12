# Devlumiq ATS — Documentation

This document will help you install, configure, and customize Devlumiq ATS. Follow the steps in order — no prior coding experience required.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Requirements](#2-requirements)
3. [Installation](#3-installation)
4. [First Run & Demo Login](#4-first-run--demo-login)
5. [Customization](#5-customization)
6. [Project Structure](#6-project-structure)
7. [Database & Production](#7-database--production)
8. [Translations](#8-translations)
9. [Browser Support](#9-browser-support)
10. [Asset Credits & Licenses](#10-asset-credits--licenses)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Introduction

Devlumiq ATS is a **full-stack** Applicant Tracking System built with:

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Prisma** (database ORM)
- **Tailwind CSS**, **Framer Motion**, **Lucide Icons**

It includes a real database (SQLite by default), REST API routes, a full recruitment dashboard, candidates, jobs, Kanban pipeline, calendar, analytics, reports, and a public marketing website. Every screen is wired to the database — no mock-only pages.

---

## 2. Requirements

- **Node.js** 18 or higher — Download: [https://nodejs.org](https://nodejs.org)
- **npm** (bundled with Node.js) or **yarn**
- A code editor such as **VS Code** (recommended)

---

## 3. Installation

### Step 1: Extract the project

Unzip the downloaded archive to a folder, e.g. `devlumiq-ats`.

### Step 2: Open a terminal in the project folder

- **Windows**: Right-click the folder and select "Open in Terminal", or open Command Prompt / PowerShell and navigate to the folder.
- **Mac / Linux**: Open Terminal and `cd` into the project folder.

### Step 3: Copy the environment file

**Windows (Command Prompt):**

```bash
copy .env.example .env
```

**Windows (PowerShell) / Mac / Linux:**

```bash
cp .env.example .env
```

This creates a `.env` file with default settings using a local SQLite database. You can edit `.env` later to switch to PostgreSQL for production.

### Step 4: Install dependencies

```bash
npm install
```

Wait until all packages are downloaded and installed.

### Step 5: Create the database and apply migrations

```bash
npx prisma migrate dev
```

This creates the SQLite database file at `prisma/dev.db` and applies all schema migrations. If prompted for a migration name, enter `init` and press Enter.

### Step 6: Seed sample data (recommended)

```bash
npm run prisma:seed
```

This creates a sample user account, jobs, candidates, applications, and messages so you can explore the app immediately.

### Step 7: Start the development server

```bash
npm run dev
```

Open your browser and go to: **http://localhost:3000**

---

## 4. Logging In

- **Default account**: `demo@devlumiq.com` / `demo`
- Any email and password combination will work — a new user account is created automatically on first login.
- After signing in you will see the **Dashboard**. Use the sidebar to navigate to Candidates, Jobs, Kanban, Calendar, Analytics, Reports, Settings, and more.

---

## 5. Customization

### Brand Colors

Edit **`tailwind.config.ts`**. Find `theme.extend.colors` and update the `brand` palette:

```ts
brand: {
  50:  '#f0fdfa',
  100: '#ccfbf1',
  600: '#0d9488',  // primary buttons
  700: '#0f766e',
  800: '#115e59',
  900: '#134e4a',
}
```

Save the file; the development server will reload automatically.

### Logo

Replace **`src/components/Logo.tsx`** with your own SVG or image component. Keep the same default export so the header and sidebar continue to render it correctly.

### Site Name and SEO Metadata

Edit **`src/app/layout.tsx`** and update the `metadata` object:

- `title.default` and `description`
- `openGraph` and `twitter` fields
- `metadataBase` — set this to your live domain

### Favicon and Social Image

- **Favicon**: Replace **`public/logo.png`** with your icon (32x32 or 192x192 PNG recommended).
- **Open Graph image**: Replace **`public/og-image.svg`** with your own 1200x630 image for social sharing previews.

---

## 6. Project Structure

| Folder / File | Purpose |
|---------------|---------|
| `prisma/` | Database schema, migrations, and seed script |
| `src/app/` | Next.js pages and API routes |
| `src/app/api/` | Backend REST API (auth, candidates, jobs, etc.) |
| `src/app/(marketing)/` | Public marketing website pages |
| `src/app/dashboard/` | Dashboard pages |
| `src/app/careers/` | Public careers portal |
| `src/components/` | Reusable UI components |
| `src/lib/` | Prisma client, translations, API helpers |
| `public/` | Static assets (logo, OG image, robots.txt, sitemap) |

---

## 7. Database & Production

### Local Development

By default the project uses **SQLite** stored at `prisma/dev.db`. No separate database server is required.

### Production Deployment

For a live site, switch to **PostgreSQL** or **MySQL**:

1. Create a database with a provider such as Vercel Postgres, Railway, or PlanetScale.
2. In **`prisma/schema.prisma`**, set `provider = "postgresql"` (or `"mysql"`).
3. In **`.env`** (or your host's environment variables panel), set `DATABASE_URL` to your connection string.
4. Run migrations:

   ```bash
   npx prisma migrate deploy
   ```

5. Build and start:

   ```bash
   npm run build
   npm start
   ```

> Do **not** run `prisma migrate dev` in production — always use `prisma migrate deploy`.

---

## 8. Translations

Devlumiq ATS supports 10 languages: English, Spanish, Arabic, French, German, Portuguese, Hindi, Chinese, Japanese, and Russian.

- All translation strings are in **`src/lib/translations.ts`**.
- Edit or add keys in that file. The active locale is picked up automatically.
- Users can switch language via the locale switcher in the header or dashboard sidebar.

---

## 9. Browser Support

Devlumiq ATS targets modern evergreen browsers:

- Chrome, Firefox, Safari, Edge (current versions)
- Mobile: iOS Safari, Chrome for Android

Internet Explorer is not supported.

---

## 10. Asset Credits & Licenses

- **Fonts**: Plus Jakarta Sans and JetBrains Mono via Google Fonts — [Google Fonts License](https://fonts.google.com/license)
- **Icons**: Lucide Icons — [MIT License](https://github.com/lucide-icons/lucide/blob/main/LICENSE)
- **Libraries**: See `package.json` for all dependencies. Each package carries its own license (MIT, Apache-2.0, etc.).

If you incorporate your own images, fonts, or third-party assets, ensure you hold the appropriate rights to use and distribute them.

---

## 11. Troubleshooting

**"Module not found" or install errors**

- Delete `node_modules` and run `npm install` again.
- Verify Node.js is version 18 or higher: `node -v`.

**Database / Prisma errors**

- Confirm `.env` exists and `DATABASE_URL` is set (e.g. `file:./dev.db` for local SQLite).
- Run `npx prisma generate` then `npx prisma migrate dev`.
- If the database is corrupted, delete `prisma/dev.db` and re-run `npx prisma migrate dev` followed by `npm run prisma:seed`.

**Port 3000 already in use**

- Stop the conflicting process or start on a different port: `npm run dev -- -p 3001`.

**Login not working**

- Confirm you ran `npm run prisma:seed`. The default login is `demo@devlumiq.com` / `demo`. If you skipped seeding, enter any email and password — a new account will be created automatically.

**Build fails**

- Run `npm run build` and review the error output. It is typically a TypeScript error or a missing import in a file you edited. Fix the reported file and build again.

---

For technical details on API routes, database schema, and scripts, refer to **README.md**.

**Thank you for choosing Devlumiq ATS.**
