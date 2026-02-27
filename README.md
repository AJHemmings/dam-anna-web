# Dam Anna — Band Website

Official website for Dam Anna. A full-stack React application with an interactive 3D guitar scene, admin dashboard, and social media integrations.

---

## Overview

The public site features a Three.js 3D guitar model as the hero element, with gig listings, photo gallery, video carousel, and contact options layered on top. An admin dashboard (separate lazy-loaded bundle) allows band members to manage all site content from any device, including mobile.

---

## Tech Stack

| Layer      | Technology                | Notes                                             |
| ---------- | ------------------------- | ------------------------------------------------- |
| Frontend   | React 18 + Vite           | SPA, feature-branch Git workflow                  |
| Styling    | Tailwind CSS v4           | Utility-only, mobile-first                        |
| 3D         | Three.js                  | Lazy-loaded — separate deferred chunk             |
| Backend    | Supabase Edge Functions   | Deno runtime                                      |
| Database   | Supabase PostgreSQL        | RLS enforced on all tables                        |
| Auth       | Supabase Auth             | Session-scoped (sessionStorage), admin-only       |
| Deployment | Vercel                    | Auto-deploys from main branch                     |
| Email      | Resend                    | New submission notifications via DB webhook       |
| OAuth      | Google OAuth 2.0          | Gmail and YouTube integrations in admin dashboard |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for the database, auth, and edge functions)

### Installation

```bash
git clone https://github.com/AJHemmings/dam-anna-web.git
cd dam-anna-web
npm install
```

### Environment variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Local development

```bash
npm run dev
```

The public site runs at `http://localhost:5173`. The admin dashboard is at `/admin` — you will need a Supabase user account to log in.

### Build

```bash
npm run build    # production build
npm run preview  # preview the production build locally
```

---

## Deployment

Vercel auto-deploys from the `main` branch. No manual deploy steps required — merge to main and Vercel handles the rest.

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) must be set in the Vercel project settings.

---

## Project Structure

```
dam-anna-web/
├── src/
│   ├── admin/              # Admin dashboard (lazy-loaded, separate bundle)
│   │   ├── pages/          # One page component per admin feature
│   │   └── components/     # Admin-specific UI (sidebar, header, layout)
│   ├── components/         # Public site UI components
│   │   ├── sections/       # Page sections (gigs, gallery, hero, etc.)
│   │   └── modals/         # Overlay modals (about, contact, gallery, etc.)
│   ├── context/            # React context (auth)
│   ├── hooks/              # Custom hooks — all Supabase and API calls live here
│   ├── lib/                # Supabase client initialisation
│   ├── utils/              # Shared utilities (analytics tracking, etc.)
│   ├── App.jsx             # Router shell — thin, delegates to PublicSite or admin
│   └── PublicSite.jsx      # Public site root — Three.js lazy-loaded here
├── supabase/
│   └── functions/          # Supabase Edge Functions (Deno)
│       ├── fetch-gmail-inbox/
│       ├── fetch-gmail-thread/
│       ├── send-gmail-reply/
│       ├── fetch-youtube-videos/
│       ├── fetch-youtube-comments/
│       ├── post-youtube-reply/
│       ├── google-oauth-init/
│       ├── google-oauth-callback/
│       ├── google-token-refresh/
│       └── notify-new-submission/
├── public/                 # Static assets (models, textures, images)
│   ├── models/             # 3D guitar model (.glb)
│   └── textures/           # Background texture
├── scripts/                # Dev tooling (one-off scripts, report generator)
├── docs/                   # Design log, session handover, session reports
├── index.html
├── vite.config.js
└── vercel.json             # Cache-Control headers and SPA rewrite rules
```

---

## Admin Dashboard

Accessible at `/admin`. Requires a Supabase authenticated session.

| Feature              | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| Gigs                 | Add, edit, and delete upcoming and previous gigs                 |
| Gallery              | Upload, reorder, replace, and delete photos with compression     |
| Videos               | Manage YouTube video links shown on the public site              |
| Submissions          | Review fan photo submissions — approve, reject, or block         |
| Analytics            | Visitor session counts (24h, 7d, 30d)                           |
| Gmail                | Read inbox, view threads, send replies via Google OAuth          |
| YouTube              | View videos and comments, post replies via Google OAuth          |
| Site Content         | Edit homepage text content                                       |
| Social Links         | Manage social media links shown on the public site               |

The admin bundle is lazy-loaded — it is never downloaded by public visitors.

---

## Key Conventions

**Data fetching** — all Supabase and API calls go through custom hooks in `src/hooks/`. Components never call Supabase directly.

**Google API calls** — all calls must go through `callWithTokenRefresh()` inside the relevant hook. Never call `supabase.functions.invoke` directly for Google integrations — it will not handle token expiry.

**Admin routes** — all admin pages must be wrapped in `AdminRoute.jsx`. Do not add admin pages without it.

**Styling** — Tailwind CSS v4 utility classes only. Breakpoints: default = mobile, `md:` = tablet (768px+), `lg:` = desktop (1024px+). Public site uses JS-driven `isMobile` prop for layout decisions — do not use CSS breakpoints for layout-sensitive public components.

**Gigs logic** — there is no manual archive step. `date >= today` = upcoming, `date < today` = previous. The date field is the sole logic.

---

## Known Issues

| Issue                              | Severity | Notes                                                     |
| ---------------------------------- | -------- | --------------------------------------------------------- |
| Three.js intermittent freeze       | Low      | Rare freeze on load — likely a race condition in model loading. Not user-reported. |
| Gmail plain-text formatting        | Low      | Raw URLs, no line breaks in plain-text email bodies.      |
| Ultra-wide layout centering        | Low      | Minor centering issue on screens wider than 1920px. Not user-reported. |
| Instagram integration              | Deferred | Stub page only. Requires Meta Developer App and app review. |
| bfcache restoration blocked        | Medium   | Back/forward cache not restoring — root cause not yet investigated. |
| Google OAuth app not verified      | Low      | Verification required before full production use.         |

---

## Performance

Lighthouse score: **88** (production, February 2026).

| Metric                  | Detail                                          |
| ----------------------- | ----------------------------------------------- |
| Main bundle             | 415 kB minified / 121 kB gzipped               |
| Three.js chunk          | 541 kB — deferred, only loads after main bundle |
| Images                  | WebP with alpha where transparency required     |
| Static asset caching    | JS/CSS immutable (1 year), media 30 days        |
| Slideshow/video loading | Lazy — deferred until near viewport             |

---

## Documentation

Full architectural decisions and session history are in `docs/`:

- `docs/design-log/DESIGN_LOG.md` — permanent record of every architectural decision and the reasoning behind it. Read this before making structural changes.
- `docs/handover.md` — rolling session handover. Read this at the start of each development session.
