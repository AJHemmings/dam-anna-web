# Dam Anna — Design Log

A permanent record of architectural decisions, feature designs, and implementation plans.

**Rules:**

- Entries are append-only. Newest entries at the bottom.
- If a decision changes, update the original entry in place, mark it `superseded by ENTRY-XXX`, and add a new entry explaining why.
- Each session gets a session header. Significant decisions within a session get their own entries.
- Keep entries concise. One line per file in Implementation. No prose where a table works.

---

## SESSION 1-3 — Foundation (Pre-report)

_Vanilla JS + Vite + Three.js. Migrated to React. Established Git workflow and feature branch pattern._

---

## SESSION 4 — Admin Dashboard, Auth, Full CRUD

**Date:** 17 Feb 2026

---

### [ENTRY-001] Auth token storage strategy

**Status:** Shipped

**Problem:** Supabase defaults to localStorage for auth tokens, keeping admins logged in indefinitely.

**Options:**

| Option                  | Pros                                                  | Cons                                      |
| ----------------------- | ----------------------------------------------------- | ----------------------------------------- |
| localStorage (default)  | Persistent login, convenient                          | Less secure on shared devices             |
| sessionStorage (chosen) | Clears on browser close, re-auth required per session | Must log in each visit                    |
| beforeunload sign-out   | Maximum security                                      | Signs out on every page refresh, unusable |

**Decision:** sessionStorage. Right balance of security and usability for a 1-2 person admin team.

**Implementation:**

- `src/lib/supabase.js` — added sessionStorage option to Supabase client init

**Outcome:** Works as expected. Admins re-authenticate per browser session, page refreshes within a session are uninterrupted.

---

### [ENTRY-002] Admin routing and code splitting

**Status:** Shipped

**Problem:** Admin code should not be downloaded by public visitors.

**Options:**

| Option                          | Pros                     | Cons                                     |
| ------------------------------- | ------------------------ | ---------------------------------------- |
| Single bundle                   | Simple                   | Every visitor downloads admin code       |
| Lazy-loaded `/admin/*` (chosen) | Public bundle stays lean | Brief loading state on first admin visit |

**Decision:** React.lazy() + Suspense on all `/admin/*` routes. Public site extracted to `PublicSite.jsx` to keep App.jsx as a thin router shell.

**Implementation:**

- `src/App.jsx` — rewritten as router shell
- `src/PublicSite.jsx` — created, existing public site moved here unchanged

**Outcome:** Admin chunk only downloads when navigating to `/admin`. No regressions on public site.

---

### [ENTRY-003] Client-side image compression

**Status:** Shipped

**Problem:** Raw phone camera uploads are 5-10MB. Unacceptable for storage costs and gallery load times.

**Options:**

| Option                          | Pros                                                    | Cons                                           |
| ------------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| No compression                  | Zero effort                                             | 5-10MB images, high storage cost, slow gallery |
| Server-side via Edge Function   | Reliable across browsers                                | Edge Function cost, added complexity           |
| Client-side Canvas API (chosen) | Free, reduces upload size, works in all modern browsers | Browser-dependent (acceptable)                 |

**Decision:** Canvas API. Resize to 1920px max width, WebP at 0.8 quality. Constants (`MAX_IMAGE_WIDTH`, `WEBP_QUALITY`) at top of file for easy tuning.

**Implementation:**

- `src/admin/pages/GalleryPage.jsx` — compression logic added to upload flow

**Outcome:** Typical 5MB phone photo compresses to 200-400KB. Significant storage and load time improvement.

---

### [ENTRY-004] Gallery — mixed Supabase/external image view

**Status:** Shipped

**Problem:** Existing gallery images are hosted on ImageShack. Migrating all at once is risky and time-consuming.

**Decision:** Mixed view. ImageShack images labelled "External", Supabase images labelled "Supabase". Migration deferred to a future session.

**Implementation:**

- `src/admin/pages/GalleryPage.jsx` — badge logic added

**Outcome:** Gallery fully functional. Migration can happen incrementally.

---

### [ENTRY-005] AuthProvider scope

**Status:** Shipped

**Problem:** Where to place AuthProvider — wrapping the whole app, or admin routes only.

**Decision:** Admin routes only, inside the Suspense boundary. Wrapping the whole app triggers auth checks and Supabase calls for every public visitor.

**Implementation:**

- `src/App.jsx` — AuthProvider placed inside lazy-loaded admin Suspense boundary

**Outcome:** No auth overhead for public visitors.

---

## SESSION 5 — Mobile Dashboard Responsiveness

**Date:** 18 Feb 2026

---

### [ENTRY-006] Admin sidebar — mobile pattern

**Status:** Shipped

**Problem:** Pinned desktop sidebar unusable on mobile.

**Options:**

| Option                     | Pros                            | Cons                                                   |
| -------------------------- | ------------------------------- | ------------------------------------------------------ |
| Bottom navigation bar      | Familiar mobile pattern         | 7 items exceeds recommended max of 5, labels don't fit |
| Off-canvas drawer (chosen) | Fits all items with full labels | Requires hamburger button                              |

**Decision:** Off-canvas drawer. 300ms ease-in-out transition. Opens from hamburger in header, closes on nav tap, backdrop tap, or Escape. Desktop (md+/768px) unchanged.

**Implementation:**

- `src/admin/components/AdminSidebar.jsx` — drawer logic
- `src/admin/components/AdminHeader.jsx` — hamburger button
- `src/admin/AdminLayout.jsx` — shell state wiring

**Outcome:** All admin pages usable on mobile. Drawer always rendered in DOM (not conditionally) so close animation plays correctly.

---

### [ENTRY-007] Admin forms — CSS breakpoints vs JS isMobile

**Status:** Shipped

**Problem:** Admin forms need to collapse to single column on mobile.

**Decision:** Tailwind CSS breakpoints (`md:`) used for admin dashboard, not JS-driven `isMobile` prop. Admin layout has no dependency on nav state agreement, so CSS breakpoints are simpler and sufficient.

_Note: Public site uses JS-driven `isMobile` — see [ENTRY-011]. Do not conflate the two._

**Implementation:**

- `GigsPage.jsx`, `VideosPage.jsx`, `SocialLinksPage.jsx`, `SiteContentPage.jsx`, `GalleryPage.jsx` — two-column grids collapse at `md:` breakpoint

**Outcome:** All forms single-column on mobile, multi-column on tablet+.

---

### [ENTRY-008] Gallery upload order

**Status:** Shipped

**Problem:** New uploads appeared at the bottom of the gallery list. Expected: newest at the top.

**Options:**

| Option                                   | Pros                                        | Cons                                                 |
| ---------------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Assign display_order = 0                 | Simple                                      | Collisions on multiple upload batches                |
| Invert fetch order to descending         | Quick fix                                   | Breaks manually reordered images                     |
| Assign minimum minus batch size (chosen) | Collision-free across any number of batches | display_order drifts negative over time (acceptable) |

**Decision:** New uploads assigned `min(display_order) - batch_size`. Fetch remains ascending. Low number = first position.

**Open Questions:**

- [ ] Normalise display_order values (reassign clean sequential integers) — future utility, not urgent

**Implementation:**

- `src/admin/pages/GalleryPage.jsx` — upload order assignment logic

**Outcome:** New uploads appear at top. Batches maintain selection order.

---

### [ENTRY-009] Gallery replace image — new storage path vs overwrite

**Status:** Shipped

**Problem:** Replacing a gallery image risks CDN/browser cache serving the old image if the same path is reused.

**Decision:** Always generate a new storage path for replacement files. Old file deleted from Storage. CDN cache invalidation avoided entirely.

**Implementation:**

- `src/admin/pages/GalleryPage.jsx` — Replace Image panel

**Outcome:** Replacement images immediately visible. No cache issues.

---

## SESSION PRE-DB — Mobile and Tablet Optimisation (Public Site)

**Date:** 15 Feb 2026

---

### [ENTRY-010] Touch device detection method

**Status:** Shipped

**Problem:** Need to detect touch-primary devices without misidentifying touch-screen laptops (e.g. Surface) as mobile.

**Decision:** `pointer: coarse` media query (not `any-pointer: coarse`). Distinguishes touch-primary from touch-capable laptops. Nav breakpoint at 1280px to accommodate large tablets in landscape.

**Implementation:**

- `src/components/Navigation.jsx` — `useIsMobileNav` hook
- `src/App.jsx` — `useIsMobileLayout` hook

**Outcome:** iPad Pro, Galaxy Tab Ultra, and foldables all correctly receive mobile experience. Surface laptops keep desktop nav.

---

### [ENTRY-011] Layout responsiveness — JS-driven vs CSS breakpoints (public site)

**Status:** Shipped

**Problem:** CSS `lg:` breakpoints and JS touch detection produced conflicting states on tablets in landscape (desktop layout + hamburger menu).

**Decision:** JS-driven `isMobile` prop via `useIsMobileLayout()` in `App.jsx`. Mirrors nav detection logic exactly. Passed as prop to layout-sensitive components.

_This applies to the public site only. Admin dashboard uses CSS breakpoints — see [ENTRY-007]._

**Implementation:**

- `src/App.jsx` — `isMobile` prop derived and passed down

**Outcome:** Layout and nav always agree on all devices.

---

### [ENTRY-012] Modal rendering — React Portal

**Status:** Shipped

**Problem:** Modals rendered as DOM siblings of Navigation caused layout reflow jolt on open.

**Decision:** React Portal (`createPortal` to `#modal-root`). Modals render outside main React tree, eliminating sibling reflow.

**Implementation:**

- `src/components/Portal.jsx` — created
- `src/App.jsx` — `#modal-root` added, all 5 modals moved to Portal

**Outcome:** Zero layout jolt on modal open.

---

### [ENTRY-013] Scroll lock strategy

**Status:** Shipped

**Problem:** `position: fixed` scroll lock caused visible layout jolt and scrollbar compensation issues.

**Decision:** No scroll lock on About Us, Socials, Contact, You modals (full-screen fixed overlays already prevent user reaching background). `overflow: hidden` on `<html>` for Gallery modal only (has scrollable thumbnail grid that would otherwise allow background scroll).

**Implementation:**

- All modal files — scroll lock removed
- `src/components/modals/GalleryModal.jsx` — `overflow: hidden` on `<html>` retained

**Outcome:** Zero jolt on all modals. Background technically scrollable behind 4 modals but unreachable through the overlay.

---

### [ENTRY-014] Three.js mobile canvas sizing

**Status:** Shipped

**Problem:** Mobile browser address bar show/hide changes `window.innerHeight`, causing Three.js canvas to resize and produce a visible jump or white gap.

**Decision:** Initial canvas height set to `screen.height` (full physical screen). On mobile, ignore height-only resize events. Width changes (orientation) still trigger resize.

**Implementation:**

- `src/components/ThreeBackground.jsx` — resize handler updated

**Outcome:** No canvas jump or white gap when address bar toggles. Slight overdraw behind address bar is acceptable.

---

## SESSION 6 — User Photo Submissions

**Date:** ~19 Feb 2026

---

### [ENTRY-015] RLS policy security fix

**Status:** Shipped

**Problem:** All six database tables had admin write policies targeting `public` role instead of `authenticated`. Any unauthenticated visitor could insert, update, or delete records.

**Decision:** Drop all public-role admin write policies. Replace with `authenticated`-only policies. Public `SELECT` policies unchanged (public site requires them).

**Tables fixed:** `gallery_images`, `gigs`, `site_content`, `social_links`, `videos`, `user_submissions`

**Outcome:** Write access locked to authenticated admins only.

---

### [ENTRY-016] Submissions storage bucket — separate vs shared

**Status:** Shipped

**Problem:** `gallery` bucket requires anon read (public site). `user-submissions` bucket requires anon write but no anon read. Incompatible policies on a single bucket.

**Decision:** Separate `user-submissions` bucket. Clean permission boundary enforced at infrastructure level.

**Outcome:** Two buckets to manage, but policy separation is correct and enforced.

---

### [ENTRY-017] Honeypot bot protection implementation

**Status:** Shipped

**Problem:** Ref-based honeypot caused silent failures — `honeypotRef.current` was null at submit time. Browser autofill was also populating the hidden field with the user's email, silently rejecting every legitimate submission.

**Decision:** Controlled React state for honeypot field (not a ref). `autoComplete="new-password"` added to prevent autofill.

**Implementation:**

- `src/components/modals/YouModal.jsx` — honeypot converted to controlled state

**Open Questions:**

- [ ] Edge Function rate limiting — honeypot is minimum viable. Rate limiting is the correct long-term solution.

**Outcome:** Legitimate submissions no longer silently rejected.

---

### [ENTRY-018] Blocked emails — silent rejection

**Status:** Shipped

**Problem:** Showing an error to a blocked email tells the bad actor they are blocked.

**Decision:** Blocked emails receive identical success response to legitimate submissions. Admin confirms block via `blocked_emails` table in dashboard.

**Outcome:** Feedback loop for bad actors removed.

---

### [ENTRY-019] Cross-bucket file copy on submission approval

**Status:** Shipped

**Problem:** Supabase JS client does not support copying files between two different storage buckets.

**Decision:** Download from `user-submissions`, re-upload to `gallery`. Two network operations but no meaningful performance impact at expected scale.

**Outcome:** Approval flow works. Known Supabase limitation documented here.

---

## SESSION 7 — Submission Review Mobile + Email Notifications

**Date:** ~21 Feb 2026

---

### [ENTRY-020] Submission review interaction model

**Status:** Shipped

**Problem:** Card footer action buttons were cramped and misaligned at all breakpoints. Bulk select was a poor fit for individual photo review requiring human decisions.

**Options:**

| Option                                | Pros                                                 | Cons                                 |
| ------------------------------------- | ---------------------------------------------------- | ------------------------------------ |
| Fix footer button sizing              | Minimal change                                       | Root cause remains — cramped in card |
| Inline expand                         | No overlay                                           | Cramped on single-column mobile      |
| Bottom sheet / centred modal (chosen) | Full space for image + actions, clean mobile pattern | Covers page content while open       |

**Decision:** Bottom sheet on mobile, centred modal on desktop. Bulk select removed. Four named step constants (`STEP_ACTIONS`, `STEP_APPROVE`, `STEP_REJECT`, `STEP_BLOCK`) control sheet state.

**Implementation:**

- `src/admin/pages/SubmissionsPage.jsx` — rewritten with bottom sheet pattern

**Outcome:** Clean review experience. Approve flow includes metadata edit step before confirmation.

---

### [ENTRY-021] Email notifications — service selection

**Status:** Shipped

**Problem:** Band needs to be notified when a new photo submission arrives.

**Options:**

| Option                  | Free tier            | Notes                                 |
| ----------------------- | -------------------- | ------------------------------------- |
| Resend (chosen)         | 3,000/month, 100/day | Clean API, simple domain verification |
| SendGrid                | 100/day              | More complex, better for high-volume  |
| Nodemailer + Gmail SMTP | Unlimited            | Gmail flags automated email as spam   |

**Decision:** Resend. Triggered via Supabase Database Webhook on `user_submissions` INSERT. Webhook fires at DB layer — React code is completely unaware of notification.

**Implementation:**

- `supabase/functions/notify-new-submission/index.ts` — created

**Outcome:** Admin receives email on every new submission. Resend API key stored in Supabase secrets only.

---

## SESSION 8 — Visitor Analytics

**Date:** ~22 Feb 2026

---

### [ENTRY-022] Analytics provider — Vercel vs custom vs third-party

**Status:** Shipped

**Problem:** Vercel Analytics REST API returns 404. No public API exists for reading Web Analytics data programmatically. Session 7 handover assumed it did.

**Options:**

| Option                              | Pros                                  | Cons                                                    |
| ----------------------------------- | ------------------------------------- | ------------------------------------------------------- |
| Embed Vercel dashboard via iframe   | Zero build time                       | Requires Vercel login, CORS risk, visually inconsistent |
| Switch to Plausible/Umami           | Clean REST API                        | Loses historical data, ~$9/month, new dependency        |
| Custom counter on Supabase (chosen) | Free, in existing stack, full control | Starts from zero data, session dedup is approximate     |

**Decision:** Custom `page_views` table on Supabase. Two columns only: `id` and `visited_at`. No PII stored — nothing to anonymise, nothing to expire under GDPR.

**Implementation:**

- `src/utils/trackVisit.js` — created
- `src/hooks/useAnalytics.js` — created
- `src/admin/pages/AnalyticsPage.jsx` — created
- `src/PublicSite.jsx` — `trackVisit()` added on mount

**Outcome:** Session counts visible for 24h, 7d, 30d. Auto-refreshes every 60 seconds.

---

### [ENTRY-023] Analytics session deduplication

**Status:** Shipped

**Problem:** Page reloads and tab duplicates should not inflate session counts.

**Options:**

| Option                  | Behaviour                                              |
| ----------------------- | ------------------------------------------------------ |
| localStorage            | Persists across sessions — undercounts return visitors |
| sessionStorage (chosen) | Clears on tab close — each new tab is a new session    |

**Decision:** `sessionStorage` flag (`da_visited`). Reflects genuine engagement. Return visitor on a new day counts correctly.

**Outcome:** Page reloads within a tab do not insert duplicate rows. New tabs correctly produce new rows.

---

### [ENTRY-024] trackVisit placement — App.jsx vs PublicSite.jsx

**Status:** Shipped

**Problem:** App.jsx mounts for both public visitors and admins navigating to `/admin`. Tracking there would pollute visitor counts.

**Decision:** `trackVisit()` placed in `PublicSite.jsx` only. Correct semantic boundary — only real public visitors trigger it.

**Outcome:** Admin activity does not appear in analytics.

---

## SESSION 9 — Google OAuth Infrastructure

**Date:** ~23 Feb 2026

---

### [ENTRY-025] OAuth token storage — DB vs Edge Function secrets

**Status:** Shipped

**Problem:** OAuth access tokens expire after ~1 hour and must be refreshable programmatically. Edge Function secrets are static and cannot be updated by code.

**Decision:** `oauth_tokens` table in Supabase. Tokens never leave Supabase infrastructure — React app never receives or stores them. All API calls proxied through Edge Functions using `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS, stored as secret, never sent to client).

**Implementation:**

- Supabase: `oauth_tokens` table created with `UNIQUE` constraint on `platform` column
- `supabase/functions/google-oauth-init/index.ts` — JWT verification OFF (flow starts before login)
- `supabase/functions/google-oauth-callback/index.ts` — JWT verification OFF (Google redirects here, no admin session)
- `supabase/functions/google-token-refresh/index.ts` — JWT verification ON
- `supabase/functions/fetch-gmail-inbox/index.ts` — JWT verification ON
- `supabase/functions/fetch-gmail-thread/index.ts` — JWT verification ON
- `supabase/functions/send-gmail-reply/index.ts` — JWT verification ON

**Outcome:** End-to-end OAuth flow confirmed working. Token row present in `oauth_tokens` with `platform = 'google'`.

---

### [ENTRY-026] OAuth — upsert on platform column

**Status:** Shipped

**Problem:** Re-running the OAuth flow (e.g. after revoking access) must not create duplicate token rows.

**Decision:** Upsert on `platform` column (UNIQUE constraint). `oauth_tokens` always has exactly one row per platform.

**Outcome:** Re-authorisation updates existing row cleanly.

---

## SESSION 10 — Gmail and YouTube UI

**Note:** No separate report uploaded — decisions inferred from Session 11 report.

---

## SESSION 11 — Social Integration Ship + Bug Fixes

**Date:** 25 Feb 2026

---

### [ENTRY-027] OAuth token refresh — reactive vs proactive

**Status:** Shipped

**Problem:** Google OAuth access tokens expire after 1 hour. Silent failures after expiry required manual token refresh via Supabase dashboard.

**Root cause:** `callWithTokenRefresh` 401 detection was incomplete — error status can appear in `error.status`, `error.context.status`, or embedded in `error.message` as a string.

**Options:**

| Option                  | Pros                              | Cons                                                          |
| ----------------------- | --------------------------------- | ------------------------------------------------------------- |
| Reactive retry only     | No scheduled infrastructure       | User sees delay after expiry; relies on correct 401 detection |
| Proactive cron job only | Token always fresh, no user delay | Does not handle cron failure edge cases                       |
| Both layers (chosen)    | Belt-and-braces                   | Slightly more infrastructure                                  |

**Decision:** Both. Expanded 401 detection to check for strings `'expired'` and `'token'` in error message. Added `pg_cron` job firing every 50 minutes to call `google-token-refresh` before expiry.

**Implementation:**

- `src/hooks/useGmail.js` — expanded 401 detection, shared headers variable
- `src/hooks/useYoutube.js` — same fix
- Supabase: `pg_cron` job added (`*/50 * * * *`)

**Open Questions:**

- [ ] `callWithTokenRefresh` is duplicated in `useGmail.js` and `useYoutube.js` — extract to shared utility

**Outcome:** Tested by manually backdating `expires_at` to 2020. Gmail inbox loaded and token refreshed automatically.

---

### [ENTRY-028] Instagram integration — build now vs defer

**Status:** Deferred

**Problem:** Meta Graph API requires Facebook Developer App, app review, and a Creator (not personal) account. Significant setup time with uncertain timeline.

**Decision:** Stub page only (`/admin/instagram`). Full integration deferred until Instagram account converted to Creator and Meta app review completed.

**Implementation:**

- `src/admin/pages/InstagramPage.jsx` — stub created
- `src/admin/AdminLayout.jsx` — route added
- `src/admin/components/AdminSidebar.jsx` — nav item enabled

**Outcome:** Nav item present. Feature clearly deferred, not forgotten.

---

### [ENTRY-029] Previous gigs cap — client-side vs database-level

**Status:** Shipped

**Problem:** Previous gigs list in admin was unbounded and would grow indefinitely.

**Options:**

| Option                     | Pros                                 | Cons                                                  |
| -------------------------- | ------------------------------------ | ----------------------------------------------------- |
| Client-side slice (chosen) | Simple, all gigs in state for toggle | Fetches all rows even if only 4 shown                 |
| Database LIMIT 4           | Fewer rows from DB                   | Cannot show older gigs without second query           |
| Archived status field      | Clean data model                     | Requires migration and new admin UI — over-engineered |

**Decision:** Client-side `.slice(0, 4)` with "Show X older gigs" toggle. Public page capped at 4 via same slice.

**Implementation:**

- `src/admin/pages/GigsPage.jsx` — sort + `showAllPrevious` toggle state
- `src/components/PreviousGigsSection.jsx` — `gigs.slice(0, 4)`

**Outcome:** Admin and public both show 4 most recent previous gigs by default. Toggle expands full list in admin.

## [ENTRY-030] — Texture Compression

- Background texture med-annie-spratt-unsplash.jpg compressed from 1.7MB to 483KB (72% reduction)
- Resized from 1920x2560 to 1280x1707, quality 70, progressive JPEG
- Tool used: sharp npm package via one-off compress-texture.js script (deleted after use)
- New file: public/textures/med-annie-spratt-optimised.jpg
- Original file retained in public/textures/ for reference
- ThreeBackground.jsx updated to reference optimised texture
- guitar.glb also reduced in size with gltf-transform. Down from 15MB to 5.52MB -- that's a 63% reduction.

---

## SESSION 13 — Performance Optimisation — Lazy Loading

**Date:** 26 February 2026

---

### [ENTRY-031] ThreeBackground lazy loading

**Status:** Shipped

**Problem:** Three.js (541 kB minified) and ThreeBackground (47 kB) were bundled into the main JavaScript chunk, loading synchronously on every page visit and blocking First Contentful Paint.

**Options:**

| Option                          | Pros                                              | Cons                                          |
| ------------------------------- | ------------------------------------------------- | --------------------------------------------- |
| Static import (previous)        | Simple                                            | Every visitor downloads Three.js upfront      |
| React.lazy() + Suspense (chosen)| Three.js defers to a separate chunk               | Requires Suspense boundary in PublicSite.jsx  |

**Decision:** React.lazy() + Suspense. Three.js and ThreeBackground split into separate deferred chunks. The existing SplashScreen architecture already covers the Suspense loading period — the splash screen sits on top of the Suspense fallback throughout, so no timing coordination was needed. The `onGuitarLoaded` callback fires correctly after lazy loading because ThreeBackground's internals are unchanged.

**Implementation:**

- `src/PublicSite.jsx` — static import replaced with `lazy()`, wrapped in `<Suspense fallback={<div className="fixed inset-0 bg-black" />}>`

**Build output:**

| Chunk                    | Size (minified) | Size (gzip) |
| ------------------------ | --------------- | ----------- |
| Main bundle (index.js)   | 415 kB          | 121 kB      |
| three.js (deferred)      | 541 kB          | 138 kB      |
| ThreeBackground (deferred)| 47 kB          | 14 kB       |

**Outcome:** Production preview Lighthouse performance score: 60 (up from baseline 45). FCP significantly improved — React boots on the smaller main bundle before Three.js is fetched.

---

### [ENTRY-032] HTML body background colour

**Status:** Shipped

**Problem:** Before React boots, the browser renders the bare HTML document with no background colour. The default white background was visible for 3–4 seconds on Slow 4G before the splash screen appeared — a flash of unstyled content at the HTML level, invisible to React or CSS.

**Decision:** Set `background-color: #000; margin: 0` inline on the `<body>` in `index.html`. Applied at the HTML level so it takes effect from the first byte the browser renders, before any CSS, JS, or React loads.

**Implementation:**

- `index.html` — `style="background-color: #000; margin: 0;"` added to `<body>`

**Outcome:** White flash before React boot eliminated.

---

## Known Issues (Carried Forward)

| Issue                                                      | Severity | Notes                                              |
| ---------------------------------------------------------- | -------- | -------------------------------------------------- |
| `callWithTokenRefresh` duplicated in useGmail + useYoutube | Low      | Extract to shared utility — see ENTRY-027        |
| Gmail body formatting                                      | Low      | Raw URLs, no line breaks in plain-text emails    |
| Three.js intermittent freeze on page load                  | Low      | Likely loading race condition, not user-reported |
| Instagram integration                                      | Deferred | Meta API setup required — see ENTRY-028          |
| Ultra-wide layout centering                                | Low      | Not user-reported                                |
| Google OAuth app not verified                              | Low      | Required before full production use              |

---

## Pinned for Future Sessions

| Item                                             | Priority |
| ------------------------------------------------ | -------- |
| Shared `BaseModal` component refactor            | Medium   |
| `callWithTokenRefresh` shared utility            | Low      |
| Edge Function rate limiting on YouModal          | Medium   |
| React Query for data caching                     | Low      |
| Extended analytics (page path, device, referrer) | Low      |
| Instagram full integration                       | Deferred |
| Google OAuth app verification                    | Low      |
