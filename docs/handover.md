# Session Handover

## Last Updated

Session 14 — 27 February 2026 — Performance sprint shipped. Lighthouse 88 on production. Report generator created. GitHub CLI set up.

---

## Tech Stack

| Item       | Detail                                                    |
| ---------- | --------------------------------------------------------- |
| Frontend   | React + Vite — src/                                       |
| Styling    | Tailwind CSS v4                                           |
| 3D         | Three.js — interactive guitar model on homepage           |
| Backend    | Supabase Edge Functions (Deno) — supabase/functions/      |
| Database   | Supabase PostgreSQL                                       |
| Auth       | Supabase Auth + protected admin routes via AdminRoute.jsx |
| Deployment | Vercel — main branch auto-deploys                         |

---

## Project Overview

| Item               | Detail                                      |
| ------------------ | ------------------------------------------- |
| Repository         | GitHub — main branch is production-ready    |
| Hosting            | Vercel — auto-deploys from main             |
| Database           | Supabase (project ID: jkkejczvoungwoledjzm) |
| Auth               | Supabase Auth — admin-only protected routes |
| Last merged branch | feat/perf-lighthouse (merged Session 14)    |
| Production URL     | Verify in Vercel dashboard                  |

---

## Current Phase

Performance sprint complete and confirmed on production. Returning to feature
work — see backlog for priorities.

---

## Current State

- Lighthouse score 88 confirmed on production (incognito, extensions disabled)
- Three.js (541 kB) and ThreeBackground (47 kB) lazy-loaded as deferred chunks
- Main bundle: 415 kB
- HTML body background fix live — no white flash before React boot
- WebP images live — border1 and logo3-resize with transparency preserved
- Cache-Control headers live via vercel.json
- Responsive images (srcset/sizes) live on GigPhotoSection, GallerySection, VideoSection
- Colour contrast fixes live
- Vite chunkSizeWarningLimit set to 600 kB — build warning resolved
- Session report generator live — scripts/generate-report.cjs (docx package, data-driven)
- docs/*.docx added to .gitignore — generated files excluded from git
- GitHub CLI installed and authenticated — use gh for all PR workflows

---

## What Was Just Worked On

- Merged `feat/perf-lighthouse` to main via PR #34 (GitHub CLI)
- Confirmed Lighthouse 88 on production in incognito with extensions disabled
- `vite.config.js` — raised `chunkSizeWarningLimit` to 600 kB to silence
  false-positive warning on the intentionally large Three.js chunk
- Created `scripts/generate-report.cjs` — DOCX session report generator using
  the `docx` npm package. Data-driven: REPORT CONFIG at top, generic renderer
  below. Copy file, update config, run script for future reports.
- Fixed table width bug in report generator: `WidthType.DXA` → `WidthType.PERCENTAGE`
  so tables fill the page regardless of margin settings
- `docs/*.docx` added to `.gitignore`
- GitHub CLI (`gh`) installed and authenticated — use for all PR workflows

---

## Known Issues

| Item                             | Detail                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| Gmail body formatting            | Raw URLs, no line breaks in plain-text emails. Low priority for band admin use        |
| Three.js intermittent freeze     | Rare freeze on page load. Likely a race condition in model loading. Not user-reported |
| Ultra-wide layout                | Minor centering issue on screens wider than 1920px. Not user-reported                 |
| Instagram integration            | Stub only. Requires Facebook Developer App + Meta App Review to build out             |
| callWithTokenRefresh duplication | Duplicated in useGmail.js and useYoutube.js. Extract to shared utility                |
| Back/forward cache (bfcache)     | bfcache restoration still blocked — not yet investigated                              |

---

## Immediate Next Steps

1. Investigate bfcache blocker (medium priority Lighthouse item)
2. Pick up feature backlog — notifications system is highest priority

---

## Broader Context

This is Session 14 of the Dam Anna website project. The site is a React/Vite
application with Supabase backend, deployed on Vercel. The Three.js scene is
a core visual element featuring an interactive 3D guitar model. Previous sessions
completed the admin dashboard, social media integrations (Gmail, YouTube OAuth),
and photo submission system with GDPR compliance. Session 12 addressed asset
compression. Session 13 completed the performance optimisation sprint — lazy
loading Three.js and fixing the HTML body background raised the Lighthouse score
from 45 to 60. Session 14 shipped the remaining Lighthouse items (WebP, cache
headers, responsive images, contrast fixes), confirmed 88 on production, and
resolved the Vite chunk size build warning.

## Remaining Feature Backlog

| Feature                         | Priority | Notes                                           |
| ------------------------------- | -------- | ----------------------------------------------- |
| Notifications system            | High     | Alert admin of new submissions and comments     |
| Instagram integration           | Medium   | Requires Meta App setup and review              |
| SEO metadata management         | Medium   | Page titles, descriptions, OG tags via admin    |
| Band member profiles page       | Medium   | Bio, photo, social links                        |
| Press kit / EPK page            | Medium   | Downloadable assets for press                   |
| Email newsletter integration    | Medium   | Mailchimp or similar                            |
| Accessibility audit             | Medium   | Keyboard nav, ARIA labels, colour contrast      |
| bfcache investigation           | Medium   | What is blocking back/forward cache restoration |
| callWithTokenRefresh refactor   | Low      | Extract to src/utils/googleApi.js               |
| Production security hardening   | Low      | CSP headers, rate limiting on Edge Functions    |
| Ultra-wide layout fix           | Low      | Centering on screens > 1920px                   |

---

## Key Code Conventions

### Data Fetching Pattern

Custom hooks in src/hooks/ handle all Supabase and API calls. Components do not
call Supabase directly. Each hook returns { data, loading, error } plus action
functions.

### Google API Calls

All Google API calls must go through callWithTokenRefresh(functionName, params).
Never call supabase.functions.invoke directly for Google integrations — it will
not handle token refresh.

### Gigs Logic

There is no manual archive step for gigs. The date field is the sole logic:
date >= today = upcoming, date < today = previous. The public page filters
automatically. The admin page cap of 4 visible previous gigs is client-side
only — all gigs remain in the database.

### Admin Route Protection

All admin routes are wrapped in AdminRoute.jsx which checks for an authenticated
Supabase session. Do not add admin pages without wrapping them in AdminRoute.

### Styling

Tailwind CSS v4 utility classes only. No custom CSS files unless absolutely
necessary. Breakpoints: default = mobile, md = tablet (768px+), lg = desktop
(1024px+).

---
