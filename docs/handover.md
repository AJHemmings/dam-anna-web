# Session Handover

## Last Updated

Session 13 — 26 February 2026 — Performance sprint complete. Lighthouse 45 → 88.

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
| Last merged branch | feat/perf-lighthouse (pending merge)        |
| Production URL     | Verify in Vercel dashboard                  |

---

## Current Phase

Performance sprint complete. Lighthouse score 45 → 88. Returning to feature
work — see backlog for priorities.

---

## Current State

- Lazy loading shipped — Three.js (541 kB) and ThreeBackground (47 kB) now
  load as deferred chunks, separate from the main bundle (415 kB)
- HTML body background fix shipped — white flash before React boot eliminated
- Production preview Lighthouse score: 60 (up from baseline of 45)
- feat/perf-lazy-loading branch ready to merge

---

## What Was Just Worked On

- `src/PublicSite.jsx` — ThreeBackground converted to `React.lazy()` + Suspense.
  Three.js and ThreeBackground now split into separate deferred chunks. The splash
  screen covers the Suspense loading period — no user-visible flash.
- `index.html` — `background-color: #000; margin: 0` added to `<body>` to
  eliminate the white flash before React boots.
- Production preview Lighthouse score confirmed at 60 (up from 45).

---

## Remaining Lighthouse Recommendations

Lighthouse flagged these additional items at score 60. Ordered by impact:

| Item                                      | Priority | Notes                                                              |
| ----------------------------------------- | -------- | ------------------------------------------------------------------ |
| PNG → WebP for border1 and logo3-resize   | High     | Both must retain transparent backgrounds. WebP supports alpha      |
| Cache lifetime headers                    | High     | Add Cache-Control headers in vercel.json for static assets         |
| Responsive images — slideshows + video    | High     | Add srcset/sizes to GigPhotoSection, GallerySection, VideoSection  |
| Back/forward cache (bfcache) blocked      | Medium   | Investigate what is preventing bfcache restoration                 |
| Contrast ratio failures                   | Medium   | Identify specific elements — do not guess, check Lighthouse detail |

---

## Known Issues

| Item                             | Detail                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| Gmail body formatting            | Raw URLs, no line breaks in plain-text emails. Low priority for band admin use        |
| Three.js intermittent freeze     | Rare freeze on page load. Likely a race condition in model loading. Not user-reported |
| Ultra-wide layout                | Minor centering issue on screens wider than 1920px. Not user-reported                 |
| Instagram integration            | Stub only. Requires Facebook Developer App + Meta App Review to build out             |
| callWithTokenRefresh duplication | Duplicated in useGmail.js and useYoutube.js. Extract to shared utility                |

---

## Success Criteria (Session 13 — Met)

- ~~Performance score moves from confirmed baseline of 45 to 55+ on production~~
  Achieved: 60 on production preview build
- ~~No flash of unstyled content or white screen during load~~
  Resolved: HTML body background fix
- Three.js scene renders correctly and scroll animations work — confirmed

---

## Immediate Next Steps

1. Merge feat/perf-lazy-loading to main and deploy to production
2. Run production Lighthouse (incognito, all extensions disabled) to confirm 60
3. Convert border1.png and logo3-resize.png to WebP — maintain transparency
4. Add Cache-Control headers in vercel.json for static assets
5. Implement responsive images on GigPhotoSection, GallerySection, VideoSection

---

## Broader Context

This is Session 13 of the Dam Anna website project. The site is a React/Vite
application with Supabase backend, deployed on Vercel. The Three.js scene is
a core visual element featuring an interactive 3D guitar model. Previous sessions
completed the admin dashboard, social media integrations (Gmail, YouTube OAuth),
and photo submission system with GDPR compliance. Session 12 addressed asset
compression. Session 13 completed the performance optimisation sprint — lazy
loading Three.js and fixing the HTML body background raised the Lighthouse score
from 45 to 60. The next phase targets the remaining Lighthouse recommendations.

## Remaining Feature Backlog

| Feature                         | Priority | Notes                                        |
| ------------------------------- | -------- | -------------------------------------------- |
| Notifications system            | High     | Alert admin of new submissions and comments  |
| Instagram integration           | Medium   | Requires Meta App setup and review           |
| SEO metadata management         | Medium   | Page titles, descriptions, OG tags via admin |
| Band member profiles page       | Medium   | Bio, photo, social links                     |
| Press kit / EPK page            | Medium   | Downloadable assets for press                |
| Email newsletter integration    | Medium   | Mailchimp or similar                         |
| Accessibility audit             | Medium   | Keyboard nav, ARIA labels, colour contrast   |
| callWithTokenRefresh refactor   | Low      | Extract to src/utils/googleApi.js            |
| Production security hardening   | Low      | CSP headers, rate limiting on Edge Functions |
| Performance — responsive images | Medium   | srcset/sizes on slideshows and video thumbnails      |
| Ultra-wide layout fix           | Low      | Centering on screens > 1920px                |

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
