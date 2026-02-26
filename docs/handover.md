# Session Handover

## Last Updated

Session 12 — 25 February 2026 — Three.js lazy loading implementation

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
| Last merged branch | feat/social-integration                     |
| Production URL     | Verify in Vercel dashboard                  |

---

## Current Phase

Performance optimisation sprint. Asset optimisation is complete and committed.
Lazy loading ThreeBackground.jsx is the final step in the current sprint.
Production deployment is pending — run a clean production Lighthouse after
deploying current changes before starting this work.

---

## Current State

- Asset optimisation complete and committed (guitar-optimised.glb,
  med-annie-spratt-optimised.jpg)
- Localhost Lighthouse performance score: 44
- FCP: 14.9s, LCP: 30.4s on Slow 4G emulation
- Primary bottleneck: ThreeBackground.jsx — 1,506ms CPU, 1,340ms script
  evaluation, two long tasks of 634ms and 311ms
- Production deployment pending

---

## What Was Just Worked On

Asset optimisation — guitar.glb compressed and background texture optimised.
Both assets committed. Lazy loading of ThreeBackground.jsx is next and has
not yet been implemented.

---

## The Problem to Solve

ThreeBackground.jsx imports Three.js (a 1.6MB chunk) and initialises a WebGL
scene synchronously on page load. This blocks the main thread and delays First
Contentful Paint. The user sees nothing until Three.js has fully loaded, parsed,
and executed.

The fix is to load ThreeBackground.jsx asynchronously so React renders the rest
of the page (navigation, hero text, splash screen) first, and Three.js loads in
parallel in the background.

---

## The Solution: React.lazy() and Suspense

React.lazy() tells the bundler to split ThreeBackground into a separate JS chunk
that is fetched asynchronously. Suspense provides a fallback UI to show while
it loads.

### Current code in PublicSite.jsx

```jsx
import ThreeBackground from './components/ThreeBackground';
```

### Target code

```jsx
import { lazy, Suspense } from 'react';

const ThreeBackground = lazy(() => import('./components/ThreeBackground'));

// In JSX:
<Suspense fallback={<div className="fixed inset-0 bg-black" />}>
  <ThreeBackground />
</Suspense>;
```

The fallback div uses bg-black to match the site's dark background so there
is no flash of white while Three.js loads.

---

## Key Files

| File                                           | Relevance                                                                              |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| src/components/ThreeBackground.jsx             | The Three.js scene component. Do not modify internals — only change how it is imported |
| src/PublicSite.jsx                             | The parent component that renders ThreeBackground. This is where the lazy import goes  |
| public/models/guitar-optimised.glb             | Current 3D model (5.52MB). Already referenced in ThreeBackground.jsx                   |
| public/textures/med-annie-spratt-optimised.jpg | Current background texture (483KB). Already referenced in ThreeBackground.jsx          |

---

## Things to Watch Out For

- ThreeBackground uses scroll position hooks — confirm those still fire correctly
  after lazy loading. Test scroll-triggered animations after implementing
- If the splash screen hides before Three.js has rendered, there may be a flash
  of the black fallback div. May need to coordinate the splash screen hide timing
  with Three.js ready state
- Run Lighthouse in incognito with NordVPN extension disabled for clean results.
  The extension added 278ms of spurious main-thread time in previous runs
- Test on mobile (Chrome DevTools device emulation, Slow 4G) not just desktop.
  The lazy loading benefit is most visible on constrained connections

---

## Known Issues

| Item                             | Detail                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| Gmail body formatting            | Raw URLs, no line breaks in plain-text emails. Low priority for band admin use        |
| Three.js intermittent freeze     | Rare freeze on page load. Likely a race condition in model loading. Not user-reported |
| guitar.glb file size             | 15MB — target is 3-5MB. Apply Draco compression. Impacts mobile load time             |
| Ultra-wide layout                | Minor centering issue on screens wider than 1920px. Not user-reported                 |
| Instagram integration            | Stub only. Requires Facebook Developer App + Meta App Review to build out             |
| callWithTokenRefresh duplication | Duplicated in useGmail.js and useYoutube.js. Extract to shared utility                |

---

## Success Criteria

- FCP drops below 5s on Slow 4G in production Lighthouse
- LCP drops below 15s on Slow 4G in production Lighthouse
- Performance score moves from current ~44 to 55+ on production
- Three.js scene still renders correctly and scroll animations still work
- No flash of unstyled content or white screen during load

---

## Immediate Next Steps

1. Deploy current asset optimisation changes to production
2. Run clean production Lighthouse in incognito (NordVPN disabled) to establish
   true baseline before implementing lazy loading
3. Implement React.lazy() and Suspense in PublicSite.jsx as documented above
4. Test scroll-triggered animations after lazy loading is in place
5. Test on mobile with Slow 4G emulation
6. Run final production Lighthouse to verify success criteria are met

---

## Commit and PR Template

**Commit message:**

```
perf: defer ThreeBackground with React.lazy() to improve FCP
```

**PR title:**

```
Performance: Lazy load Three.js scene to unblock initial paint
```

---

## Broader Context

This is Session 12 of the Dam Anna website project. The site is a React/Vite
application with Supabase backend, deployed on Vercel. The Three.js scene is
a core visual element featuring an interactive 3D guitar model. Previous sessions
completed the admin dashboard, social media integrations (Gmail, YouTube OAuth),
and photo submission system with GDPR compliance. The performance optimisation
work in Session 12 addressed asset sizes. Lazy loading ThreeBackground is the
final step in the current optimisation sprint.

## Remaining Feature Backlog

| Feature                         | Priority | Notes                                        |
| ------------------------------- | -------- | -------------------------------------------- |
| Notifications system            | High     | Alert admin of new submissions and comments  |
| Performance — Draco compression | High     | Reduce guitar.glb from 15MB to 3-5MB         |
| Instagram integration           | Medium   | Requires Meta App setup and review           |
| SEO metadata management         | Medium   | Page titles, descriptions, OG tags via admin |
| Band member profiles page       | Medium   | Bio, photo, social links                     |
| Press kit / EPK page            | Medium   | Downloadable assets for press                |
| Email newsletter integration    | Medium   | Mailchimp or similar                         |
| Accessibility audit             | Medium   | Keyboard nav, ARIA labels, colour contrast   |
| callWithTokenRefresh refactor   | Low      | Extract to src/utils/googleApi.js            |
| Production security hardening   | Low      | CSP headers, rate limiting on Edge Functions |
| Code splitting and lazy loading | Low      | Improve initial load performance             |
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
