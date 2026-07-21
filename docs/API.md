# Devlumiq ATS — API Reference

All endpoints require authentication (JWT cookie `ats_session`) unless noted as **Public**.

Base URL: `{NEXT_PUBLIC_APP_URL}/api`

---

## Authentication

| Method | Path | Public | Description |
|--------|------|--------|-------------|
| POST | `/auth/login` | ✅ | Email + password login → sets session cookie |
| POST | `/auth/register` | ✅ | Create new user account |
| POST | `/auth/logout` | ✅ | Clear session cookie |
| POST | `/auth/demo` | ✅ | Quick demo login |
| POST | `/auth/forgot-password` | ✅ | Send password reset email |
| POST | `/auth/reset-password` | ✅ | Reset password with token |
| POST | `/auth/verify-email` | ✅ | Verify email address |
| GET | `/auth/session` | ❌ | Get current session info |

---

## Dashboard

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/dashboard/summary` | Any authenticated | Dashboard stats (candidates, jobs, pipeline counts) |

---

## Candidates

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/candidates` | VIEW_CANDIDATES | List candidates (paginated, filterable) |
| POST | `/candidates` | CREATE_CANDIDATE | Create a new candidate |
| GET | `/candidates/[id]` | VIEW_CANDIDATES | Get candidate details |
| PUT | `/candidates/[id]` | EDIT_CANDIDATE | Update candidate |
| DELETE | `/candidates/[id]` | DELETE_CANDIDATE | Delete candidate |
| GET | `/candidates/search` | USE_SMART_SEARCH | Advanced search with filters |
| POST | `/candidates/bulk` | DELETE_CANDIDATE / MOVE_APPLICATION | Bulk delete or stage-update candidates |
| POST | `/candidates/bulk-import` | CREATE_CANDIDATE | CSV import (preview or import; dedupe by email) |
| GET | `/candidates/bulk-import` | CREATE_CANDIDATE | Download CSV import template |
| GET | `/skills` | auth | List system + org skills taxonomy |
| POST | `/skills` | MANAGE_SETTINGS | Create org-custom skill |
| PUT | `/skills` | MANAGE_SETTINGS | Seed system skills (idempotent) |
| GET | `/skills/match` | VIEW_CANDIDATES | Skills match % for job↔candidate |
| GET/PUT | `/candidates/[id]/skills` | VIEW/EDIT_CANDIDATE | Candidate taxonomy skills |
| GET/PUT | `/jobs/[id]/skills` | VIEW/EDIT_JOB | Job required skills |
| POST | `/messages/sms/send` | USE_EMAIL_TEMPLATES | Send SMS (Twilio; requires smsOptIn) |
| POST | `/messages/sms/bulk` | USE_EMAIL_TEMPLATES | Bulk SMS reminders/nudges |
| POST | `/messages/whatsapp/send` | USE_EMAIL_TEMPLATES | WhatsApp + thread persist (opt-in) |
| GET/PATCH | `/candidates/[id]/messaging-consent` | VIEW/EDIT | SMS/WhatsApp TCPA consent |
| POST | `/webhooks/twilio` | public | Inbound SMS → MessageThread |
| GET/POST | `/webhooks/whatsapp` | public | WhatsApp verify + inbound |
| GET | `/candidates/[id]/comments` | VIEW_CANDIDATES | Get candidate comments |
| POST | `/candidates/[id]/comments` | ADD_COMMENT | Add comment to candidate |
| POST | `/candidates/[id]/resume/parse` | USE_RESUME_PARSER | Parse uploaded resume |

---

## Jobs

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/jobs` | VIEW_JOBS | List jobs (paginated) |
| POST | `/jobs` | CREATE_JOB | Create a new job |
| GET | `/jobs/[id]` | VIEW_JOBS | Get job details |
| PUT | `/jobs/[id]` | EDIT_JOB | Update job |
| DELETE | `/jobs/[id]` | DELETE_JOB | Delete job |
| GET | `/jobs/[id]/integrations` | MANAGE_INTEGRATIONS | Get job board postings |

---

## Applications

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/applications` | VIEW_CANDIDATES | List applications (filterable by stage) |
| POST | `/applications` | CREATE_CANDIDATE | Create application |
| PATCH | `/applications/[id]` | MOVE_PIPELINE_STAGE | Update application stage |

---

## Calendar

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/calendar/events` | Any authenticated | Get interview events (date range filter) |
| POST | `/calendar/events` | SCHEDULE_INTERVIEW | Create interview event |
| GET | `/calendar/integrations` | Any authenticated | List calendar integrations |
| POST | `/calendar/integrations` | Any authenticated | Connect calendar provider |

> **Note:** Calendar events are stored locally. External calendar sync (Google, Outlook) requires OAuth setup via `/api/auth/google`.

---

## Messages

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/messages/threads` | Any authenticated | List message threads |
| POST | `/messages/threads` | Any authenticated | Create thread |
| GET | `/messages/threads/[id]` | Any authenticated | Get thread messages |
| POST | `/messages/threads/[id]` | Any authenticated | Send message in thread |

---

## Email

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/email-templates` | USE_EMAIL_TEMPLATES | List email templates |
| POST | `/email-templates` | USE_EMAIL_TEMPLATES | Create template |
| POST | `/email/send` | USE_EMAIL_TEMPLATES | Send email (requires SMTP config) |

---

## AI Features (Optional)

All AI endpoints work **with or without** an OpenAI API key. Without a key, rule-based fallbacks are used.

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| POST | `/resume-parse` | Any authenticated | AI-enhanced or rule-based resume parsing |
| POST | `/ai/rank` | USE_SMART_SEARCH | Rank candidates against job requirements |
| POST | `/ai/screen` | VIEW_CANDIDATES | Screen candidate fit assessment |
| POST | `/ai/generate-jd` | CREATE_JOB | Generate job description from title + dept |
| POST | `/ai/draft-email` | USE_EMAIL_TEMPLATES | Draft professional email |
| GET | `/ai/status` | Any authenticated | Check AI configuration status |

---

## Integrations

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| POST | `/jobboards/post` | MANAGE_INTEGRATIONS | Post job to boards (live HTTP when credentials exist; otherwise draft DB record) |
| GET | `/jobboards/post?jobId=` | MANAGE_INTEGRATIONS | Get board postings for a job |
| GET | `/jobboards/credentials` | MANAGE_INTEGRATIONS | List org board credentials (secrets masked) |
| PUT | `/jobboards/credentials` | MANAGE_INTEGRATIONS | Save encrypted LinkedIn / Indeed / Glassdoor credentials |
| DELETE | `/jobboards/credentials` | MANAGE_INTEGRATIONS | Remove board credentials |
| POST | `/linkedin/import` | CREATE_CANDIDATE | Import LinkedIn profile (via Chrome extension) |
| POST | `/esignature/send` | USE_ESIGNATURE | Send e-signature request (DocuSign stub) |
| GET | `/esignature/send?candidateId=` | Any authenticated | Get signature requests |
| POST | `/checkr` | RUN_BACKGROUND_CHECKS | Initiate background check |
| PATCH | `/checkr` | RUN_BACKGROUND_CHECKS | Update check status |
| POST | `/zapier/webhook` | Public | Zapier incoming webhook |
| POST | `/webhooks` | Public | Generic webhook endpoint |

---

## Admin

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/admin/gdpr?userId=` | ADMIN only | Export user data (GDPR) |
| DELETE | `/admin/gdpr?userId=` | ADMIN only | Delete user data (right to erasure) |
| GET | `/audit-logs` | ADMIN only | View audit log entries |

---

## Analytics

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/analytics/dashboard` | VIEW_ANALYTICS | Pipeline funnel, source breakdown, hire rate |

---

## Public (No Auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/careers` | Public careers page data |
| GET | `/careers/jobs` | Public job listings |
| POST | `/careers/apply` | Submit job application |
| GET | `/health` | Health check |

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthorized (no/invalid session) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource not found |
| 413 | Payload too large |
| 415 | Unsupported media type |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Rate Limiting

- Login: 10 attempts per 15 minutes per IP
- Resume parse: 10 per 10 minutes per IP
- General API: In-memory rate limiter (per-instance)

Rate-limited responses include a `Retry-After` header (seconds).

---

## RBAC Roles

| Role | Typical Access |
|------|---------------|
| ADMIN | Full access, user management, audit logs |
| RECRUITER | Candidates, jobs, pipeline, email, integrations |
| HIRING_MANAGER | View candidates, schedule interviews, scoring |
| INTERVIEWER | View assigned candidates, submit scores |
| VIEWER | Read-only access to candidates and analytics |
