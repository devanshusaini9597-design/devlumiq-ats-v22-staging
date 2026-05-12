# Devlumiq ATS — Full-Stack Applicant Tracking System

A modern, production-ready Applicant Tracking System (ATS) built with **Next.js 15**, **React 19**, **TypeScript**, and **Prisma ORM**. Designed for HR teams and recruitment agencies. Fully database-backed with PostgreSQL support, optimized for Vercel serverless deployment.

---

## Overview

Devlumiq ATS is a complete hiring platform that includes a public-facing marketing website, a full-featured recruitment dashboard, a careers portal, and a suite of premium tools — all in a single codebase.

---

## Core Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Live stats, pipeline counts, recent candidates — all from the database |
| **Candidates** | Full CRUD via API — list, filter, paginate, export to PDF/Excel |
| **Kanban Pipeline** | Drag-and-drop board; stage changes persist to the database in real time |
| **Jobs** | Create, edit, and manage job postings; data persisted |
| **Calendar** | FullCalendar integration; interview events stored in the database |
| **Analytics & Reports** | Visual charts with PDF export |
| **Inbox & Messages** | Full thread/message UI with API backend |
| **Authentication** | Session-based auth backed by a User table; any email/password creates or signs in a user |
| **Marketing Website** | Home, About, Features, Pricing, Contact, FAQ, Privacy, Terms, Careers |
| **i18n** | 10 locales: English, Spanish, Arabic, French, German, Portuguese, Hindi, Chinese, Japanese, Russian |

---

## Premium Features

All premium tools are integrated directly into the dashboard:

| Tool | Description |
|------|-------------|
| **Smart Search** | AI-powered candidate search with filters for skills, experience, tags, source, and pipeline stage |
| **Email Studio** | Professional email templates with variable substitution (`{{candidateName}}`, `{{position}}`) and instant sending |
| **Interview Scoring** | Rate candidates on 5 criteria (technical, communication, problem-solving, cultural fit, experience) with 1–5 star ratings |
| **Offer Letters** | One-click professional offer letter generation with salary, benefits, and start date |
| **Team Collaboration** | Candidate comments with @mentions for team discussion |
| **Resume Parser** | AI-powered PDF parsing to extract skills, experience, education, and contact info |
| **Job Board Integrations** | Post jobs to LinkedIn, Indeed, and Glassdoor with click tracking |
| **WhatsApp Messaging** | Send candidate communications via WhatsApp |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS |
| Animations | Framer Motion |
| Icons | Lucide React |
| Database ORM | Prisma |
| Database | PostgreSQL (production) / SQLite (local dev) |
| Auth | Session cookie, bcrypt |
| Deployment | Vercel (optimized) |

---

## Prerequisites

- **Node.js** 18 or higher
- **npm** (bundled with Node.js) or **yarn**
- A PostgreSQL database for production (local SQLite works for development)

---

## Quick Start — Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Create database and run migrations
npx prisma migrate dev

# 4. Seed sample data
npm run prisma:seed

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with `demo@devlumiq.com` / `demo`.

---

## Deploy to Vercel (Production)

### Step 1 — Set up Vercel Postgres
1. Go to [vercel.com](https://vercel.com) → Your Project → Storage
2. Click **Create Database** → **Postgres**
3. Copy the connection string — Vercel auto-populates `DATABASE_URL` in your environment variables

### Step 2 — Deploy
```bash
vercel --prod
```
Or connect your GitHub repository in the Vercel dashboard and push to deploy.

The build automatically:
- Generates the Prisma client
- Runs database migrations (`prisma migrate deploy`)
- Builds the Next.js application

### Step 3 — Seed Initial Data (one-time)
```bash
npx prisma db seed
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run setup` | One-command setup: env + database + seed |
| `npm run prisma:seed` | Seed or re-seed sample data |
| `npm run prisma:reset` | Wipe the database and re-seed fresh |

---

## Database & API

**Database models:** User, Job, Candidate, Application, InterviewEvent, MessageThread, Message, Notification, ActivityLog, Announcement, CandidateNote, EmailTemplate, InterviewScore, OfferLetter, Comment, Resume, JobBoardIntegration

**Core API routes:**
- `/api/auth/*` — Authentication
- `/api/dashboard/summary` — Dashboard statistics
- `/api/candidates` — Candidate management
- `/api/jobs` — Job management
- `/api/applications` — Application pipeline
- `/api/calendar/events` — Interview scheduling
- `/api/messages/threads` — Inbox and messaging

**Premium API routes:**
- `/api/candidates/search` — Advanced search
- `/api/email-templates` — Email templates
- `/api/email/send` — Send emails
- `/api/interviews/[id]/scores` — Interview scoring
- `/api/offer-letters` — Offer letter generation
- `/api/candidates/[id]/comments` — Team comments
- `/api/candidates/[id]/resume/parse` — Resume parsing
- `/api/jobs/[id]/integrations` — Job board posting

---

## Customization

### Brand Colors
Edit `tailwind.config.ts` → `theme.extend.colors.brand` to match your brand palette.

### Logo
Replace `src/components/Logo.tsx` with your own SVG or image component.

### Site Name & SEO
Edit `src/app/layout.tsx` — update `metadata.title`, `description`, `openGraph`, and `metadataBase`.

### Translations
Edit `src/lib/translations.ts` to add, remove, or modify locale strings.

---

## Project Structure

```
prisma/
├── schema.prisma       # Database models
├── migrations/         # SQL migration history
└── seed.js             # Sample data seed script

src/
├── app/
│   ├── api/            # API route handlers
│   ├── (marketing)/    # Public marketing pages
│   ├── dashboard/      # Dashboard pages
│   ├── careers/        # Public careers portal
│   ├── login/          # Authentication pages
│   └── signup/
├── components/         # Reusable UI components
├── lib/                # Prisma client, translations, helpers
└── data/               # Fallback mock data
```

---

## Quality & Standards

- **Accessibility** — Skip-to-main link, semantic HTML landmarks, 44px minimum touch targets, reduced-motion support
- **SEO** — Metadata, Open Graph, Twitter cards, sitemap, robots.txt
- **Performance** — `font-display: swap`, responsive images, code splitting via App Router
- **Type Safety** — Strict TypeScript throughout the entire codebase
- **Full-stack** — Every major feature (candidates, jobs, kanban, analytics, reports, settings) reads from and writes to the database

---

## Browser Support

Chrome, Firefox, Safari, and Edge (current versions). Mobile browsers fully supported.

---

## License

See the `LICENSE` file included in this project.
