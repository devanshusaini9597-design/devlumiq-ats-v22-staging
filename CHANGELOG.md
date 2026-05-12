# Changelog

All notable changes to Devlumiq ATS are documented here.

---

## [1.0.0] — 2026-04-13

### Initial Release

**Marketing Website**
- Homepage with hero, feature bento grid, testimonials, pricing preview, and CTA sections
- Features page with categorized feature cards and comparison table
- Pricing page with three plans, FAQ, and annual/monthly toggle
- About page with company story, values, and team timeline
- Careers portal with job listings, search, filters, benefits section, and application form
- Contact page with form, topics dropdown, and sidebar links
- FAQ page with categorized questions and search
- Enterprise, Integrations, AI Automation, Customers, Security pages
- Privacy Policy and Terms of Service pages
- Announcement bar, cookie consent, mega-menu navigation, responsive mobile menu
- 10 locale support (EN, ES, AR, FR, DE, PT, HI, ZH, JA, RU)

**Dashboard**
- Overview with live stats (candidates, jobs, pipeline), recent activity, upcoming interviews
- Candidates — full CRUD, table with filters, pagination, export to PDF/Excel
- Kanban pipeline — drag-and-drop board, stage changes persist to database
- Jobs — create, edit, manage postings
- Calendar — FullCalendar integration, interview events from database
- Analytics — charts (pipeline funnel, source breakdown, hire rate)
- Reports — PDF export
- Inbox & Messages — threads and messages with API backend
- Settings — profile, notifications, branding preferences
- Background Checks, Referrals, Assessments, E-Signature pages

**Premium Tools**
- Smart Search — AI-powered candidate search with 5+ filters
- Email Studio — templates with variable substitution and instant send
- Interview Scoring — 5-criteria star rating system
- Offer Letter Generator — one-click professional offer creation
- Team Collaboration — candidate comments with @mentions
- Resume Parser — AI PDF parsing for skills, experience, and contact info
- Job Board Integrations — post to LinkedIn, Indeed, Glassdoor
- WhatsApp Messaging — candidate communication via WhatsApp

**Technical**
- Next.js 15 App Router, React 19, TypeScript
- Prisma ORM with PostgreSQL support (SQLite for local development)
- Session-based authentication with bcrypt
- REST API with 40+ routes
- Framer Motion animations throughout
- Fully responsive — mobile, tablet, desktop
- SEO: metadata, Open Graph, Twitter cards, sitemap.xml, robots.txt
- Accessibility: skip-to-main, semantic landmarks, 44px touch targets, reduced-motion support
