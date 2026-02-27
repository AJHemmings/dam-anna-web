// Dam Anna — Session Report Generator
// ─────────────────────────────────────
// Usage:    node scripts/generate-report.cjs
// Output:   docs/<report.filename>
//
// To create a new report:
//   1. Copy this file and rename it (e.g. generate-report-s15.cjs)
//   2. Update the REPORT CONFIG section below with your session content
//   3. Run: node scripts/generate-report-s15.cjs
//
// The renderer at the bottom is generic — do not edit it for content changes.

'use strict';

// ═══════════════════════════════════════════════════════════════════════════
// REPORT CONFIG — edit this section for each new report
// ═══════════════════════════════════════════════════════════════════════════

const REPORT = {
  // Output filename (saved to docs/)
  filename: 'session-report-sessions-13-14.docx',

  // Cover
  title: 'Dam Anna',
  subtitle: 'Session Report — Sessions 13 & 14',
  dateRange: 'Performance Sprint — 26–27 February 2026',

  // Summary table shown at the top (label + value pairs)
  summary: [
    ['Sessions', '13 and 14'],
    ['Dates', '26–27 February 2026'],
    ['Branch', 'feat/perf-lighthouse → merged to main via PR #34'],
    ['Lighthouse score (start)', '45'],
    ['Lighthouse score (end)', '88 — confirmed on production'],
    ['Environment confirmed on', 'Production — incognito, all extensions disabled'],
  ],

  // Introduction paragraph
  intro:
    'This report covers the complete performance optimisation sprint for the Dam Anna website. ' +
    'The sprint ran across Sessions 13 and 14 and took the Google Lighthouse performance score from 45 to 88 on production. ' +
    'All work was delivered to the main branch and confirmed in incognito with extensions disabled.',

  // Main sections — each section has a title and a list of content blocks.
  // Block types:
  //   { type: 'body', text }              — paragraph
  //   { type: 'bullet', text, bold? }     — bullet point
  //   { type: 'subbullet', text }         — indented bullet
  //   { type: 'table', headers, rows }    — table (fills page width)
  //   { type: 'spacer' }                  — vertical gap
  sections: [
    // ── Session 13 ──────────────────────────────────────────────────────────
    {
      title: '1. Session 13 — Performance Optimisation Sprint',
      intro:
        'Session 13 focused on diagnosing and closing the largest performance gaps flagged by Lighthouse. ' +
        'The session was split into two phases: lazy loading the Three.js scene, and a systematic pass through the remaining Lighthouse recommendations.',
      subsections: [
        {
          title: '1.1 Lazy Loading Three.js',
          blocks: [
            {
              type: 'body',
              text:
                'Three.js (541 kB minified) and the ThreeBackground component (47 kB) were previously bundled into the main JavaScript chunk and loaded synchronously on every page visit. ' +
                'This blocked First Contentful Paint while the browser downloaded and parsed 588 kB of 3D library code before rendering any UI.',
            },
            { type: 'body', text: 'Decision: Convert ThreeBackground to React.lazy() + Suspense in PublicSite.jsx. Three.js and ThreeBackground split into separate deferred chunks that only download after the main bundle has booted React and rendered the initial UI.' },
            { type: 'bullet', text: 'The existing SplashScreen already covers the page during boot — it naturally covers the Suspense loading period with zero extra coordination.' },
            { type: 'bullet', text: "The onGuitarLoaded callback fires correctly after lazy loading because ThreeBackground's internals were not changed — only the import mechanism changed." },
            { type: 'bullet', text: 'Admin code was already lazy-loaded via the same pattern (ENTRY-002). Applying it to Three.js was consistent with the established architecture.' },
            {
              type: 'table',
              headers: ['Option', 'Pros', 'Cons'],
              rows: [
                ['Static import (previous)', 'Simple — no Suspense boundary required', 'All visitors download Three.js before any UI renders'],
                ['React.lazy() + Suspense (chosen)', 'Three.js deferred — main bundle boots React faster', 'Requires Suspense boundary; splash screen must cover load window'],
              ],
            },
            {
              type: 'table',
              headers: ['Chunk', 'Minified', 'Gzipped'],
              rows: [
                ['Main bundle (index.js)', '415 kB', '121 kB'],
                ['three.js (deferred)', '541 kB', '138 kB'],
                ['ThreeBackground (deferred)', '47 kB', '14 kB'],
              ],
            },
            { type: 'body', text: 'Main bundle reduced from ~1,003 kB to 415 kB — a 59% reduction in synchronous JavaScript.' },
          ],
        },
        {
          title: '1.2 HTML Body Background Colour Fix',
          blocks: [
            { type: 'body', text: 'Before React boots, the browser renders the bare HTML document with a default white background. On Slow 4G this produced a 3–4 second white flash before the splash screen appeared.' },
            { type: 'body', text: 'Decision: Set background-color: #000; color: #fff; margin: 0 inline on <body> in index.html. Applied at the HTML level before any CSS, JS, or React loads.' },
            { type: 'bullet', text: 'External CSS files do not block the HTML parser — there is a window between the browser rendering the HTML and the stylesheet loading where the default background would show.' },
            { type: 'bullet', text: 'Inline styles on <body> have zero additional network cost and are guaranteed to apply before any other resource loads.' },
          ],
        },
        {
          title: '1.3 WebP Image Conversion',
          blocks: [
            { type: 'body', text: 'Lighthouse flagged boarder1.png (304 kB) and logo3-resize.png (175 kB) as candidates for modern image formats. Both required alpha channel (transparency) to be preserved.' },
            { type: 'body', text: 'Decision: Converted to WebP using the sharp npm package via a one-off conversion script (deleted after use). All 8 component and modal references updated.' },
            {
              type: 'table',
              headers: ['File', 'Before', 'After', 'Reduction'],
              rows: [
                ['boarder1.png → boarder1.webp', '304 kB', '89 kB', '71%'],
                ['logo3-resize.png → logo3-resize.webp', '175 kB', '46 kB', '74%'],
              ],
            },
          ],
        },
        {
          title: '1.4 Cache-Control Headers',
          blocks: [
            { type: 'body', text: 'Static assets were re-fetched on every visit with no long-lived cache headers. Lighthouse penalises assets without an efficient cache policy.' },
            { type: 'bullet', text: 'Vite hash-named JS/CSS chunks: cache-control: public, max-age=31536000, immutable — safe to cache forever because the hash changes with the content.' },
            { type: 'bullet', text: 'Models, textures, and images: cache-control: public, max-age=2592000 — 30 days. Long enough to benefit returning visitors, short enough to recover from a bad deploy.' },
            { type: 'bullet', text: 'Supabase gallery images have a 1-hour CDN TTL set by Supabase — not configurable from the codebase.' },
          ],
        },
        {
          title: '1.5 Responsive Images and Lazy Loading',
          blocks: [
            { type: 'body', text: 'Video thumbnails were fetching maxresdefault.jpg (1280px wide) into a 400px display area. Slideshow images were loading eagerly regardless of scroll position.' },
            { type: 'bullet', text: 'VideoCarousel: switched primary src to hqdefault.jpg (480px). Added srcset with mqdefault (320w) and hqdefault (480w). maxresdefault excluded — it does not exist on all YouTube videos.' },
            { type: 'bullet', text: 'GallerySlideshow and GigPhotosSlideshow: added loading="lazy" and decoding="async". Both are below the fold — lazy loading defers network requests until near-viewport.' },
          ],
        },
        {
          title: '1.6 Colour Contrast Fixes',
          blocks: [
            { type: 'bullet', text: 'text-blue-400 (#60a5fa) → text-sky-300 (#7dd3fc). Sky-300 achieves ~13:1 contrast on dark backgrounds. Same visual language, reliably readable.' },
            { type: 'bullet', text: 'color: #fff added to <body> in index.html — the new black background meant any text inheriting the browser default colour would be black-on-black.' },
          ],
        },
        {
          title: '1.7 Sprint Results',
          blocks: [
            {
              type: 'table',
              headers: ['Metric', 'Before', 'After'],
              rows: [
                ['Lighthouse Performance', '45', '88'],
                ['Main bundle size', '~1,003 kB', '415 kB'],
                ['White flash before React boot', 'Yes (3–4s on Slow 4G)', 'No'],
                ['boarder1 asset size', '304 kB (PNG)', '89 kB (WebP)'],
                ['logo3-resize asset size', '175 kB (PNG)', '46 kB (WebP)'],
                ['Static asset caching', 'None', 'Immutable (JS/CSS) / 30 days (media)'],
                ['Video thumbnail fetch size', '1280px', '480px, responsive srcset'],
                ['Slideshow loading', 'Eager', 'Lazy'],
                ['Colour contrast (Lighthouse)', 'Failing', 'Passing'],
              ],
            },
            { type: 'body', text: 'Remaining diagnostics (do not affect score): Three.js execution time (~1.7s) and main thread work (~3.0s) are inherent to the WebGL scene. Unused JavaScript (~130 kB) from the full Three.js import is noted for a future tree-shaking session.' },
          ],
        },
      ],
    },

    // ── Session 14 ──────────────────────────────────────────────────────────
    {
      title: '2. Session 14 — Production Ship & Housekeeping',
      intro: 'Session 14 was a short wrap-up session focused on merging the sprint branch, confirming production results, and cleaning up the build output.',
      subsections: [
        {
          title: '2.1 GitHub CLI Setup and PR Merge',
          blocks: [
            { type: 'body', text: 'GitHub CLI (gh) was configured and authenticated during this session. Now available for all future PR creation and merge workflows from the terminal.' },
            { type: 'bullet', text: 'PR #34 created: feat/perf-lighthouse → main' },
            { type: 'bullet', text: 'Merged using: gh pr merge 34 --merge --delete-branch' },
            { type: 'bullet', text: 'Branch feat/perf-lighthouse deleted after merge' },
          ],
        },
        {
          title: '2.2 Production Lighthouse Confirmation',
          blocks: [
            { type: 'body', text: 'Lighthouse score confirmed at 88 on production in incognito with all extensions disabled. This is the primary success criterion for the performance sprint.' },
          ],
        },
        {
          title: '2.3 Vite Chunk Size Warning Fix',
          blocks: [
            { type: 'body', text: "Vercel build logs flagged the Three.js deferred chunk (541 kB) against Vite's default 500 kB warning threshold. The warning was a false positive — Three.js is intentionally large and already lazy-loaded." },
            { type: 'body', text: 'Decision: chunkSizeWarningLimit raised to 600 kB in vite.config.js. Set to 600 rather than exactly 541 to provide a small buffer against minor Three.js version bumps.' },
          ],
        },
        {
          title: '2.4 Session Report Generator',
          blocks: [
            { type: 'body', text: 'A reusable DOCX report generator was created to replace manual report writing. Built with the docx npm package (dev dependency). Reports are generated by running a Node script — no manual formatting required.' },
            { type: 'bullet', text: 'Script location: scripts/generate-report.cjs' },
            { type: 'bullet', text: 'Output location: docs/ — excluded from git via docs/*.docx in .gitignore' },
            { type: 'bullet', text: 'Structure: REPORT CONFIG block at the top holds all session content as plain data. RENDERER block at the bottom is generic and unchanged between reports.' },
            { type: 'bullet', text: 'To create a future report: copy the file, rename it, update the REPORT CONFIG, run node scripts/generate-report-sXX.cjs' },
            { type: 'body', text: 'Table width fix: initial version used WidthType.DXA (fixed twip units) which caused tables to compress when page margins differed from the hardcoded value. Switched to WidthType.PERCENTAGE — table is 100% wide and columns are equal percentage slices. Margin-agnostic and reliable.' },
          ],
        },
      ],
    },

    // ── Current State ────────────────────────────────────────────────────────
    {
      title: '3. Current Project State',
      intro: null,
      subsections: [
        {
          title: '3.1 Tech Stack',
          blocks: [
            {
              type: 'table',
              headers: ['Layer', 'Technology'],
              rows: [
                ['Frontend', 'React + Vite'],
                ['Styling', 'Tailwind CSS v4'],
                ['3D', 'Three.js — interactive guitar model on homepage'],
                ['Backend', 'Supabase Edge Functions (Deno)'],
                ['Database', 'Supabase PostgreSQL'],
                ['Auth', 'Supabase Auth — admin-only protected routes'],
                ['Deployment', 'Vercel — main branch auto-deploys'],
                ['Email', 'Resend — submission notifications'],
                ['OAuth', 'Google OAuth — Gmail and YouTube admin integrations'],
              ],
            },
          ],
        },
        {
          title: '3.2 Completed Feature Areas',
          blocks: [
            { type: 'bullet', text: 'Admin dashboard — full CRUD for gigs, videos, gallery, site content, social links' },
            { type: 'bullet', text: 'Auth — session-scoped (sessionStorage), admin-only routes via AdminRoute.jsx' },
            { type: 'bullet', text: 'User photo submissions — upload, review, approve/reject/block with email notifications via Resend' },
            { type: 'bullet', text: 'Analytics — custom visitor counter on Supabase, 24h/7d/30d views' },
            { type: 'bullet', text: 'Gmail integration — inbox read, thread view, reply via OAuth' },
            { type: 'bullet', text: 'YouTube integration — video management via OAuth' },
            { type: 'bullet', text: 'Performance — Lighthouse 88, lazy loading, WebP, cache headers, responsive images' },
            { type: 'bullet', text: 'GDPR — no PII in analytics, user submission consent model' },
          ],
        },
        {
          title: '3.3 Known Issues',
          blocks: [
            {
              type: 'table',
              headers: ['Issue', 'Severity', 'Notes'],
              rows: [
                ['Gmail body formatting', 'Low', 'Raw URLs, no line breaks in plain-text emails.'],
                ['Three.js intermittent freeze', 'Low', 'Rare, likely a race condition. Not user-reported.'],
                ['Ultra-wide layout centering', 'Low', 'Minor issue on screens wider than 1920px. Not user-reported.'],
                ['Instagram integration', 'Deferred', 'Stub only. Requires Meta Developer App and app review.'],
                ['callWithTokenRefresh duplication', 'Low', 'Duplicated in useGmail.js and useYoutube.js.'],
                ['bfcache restoration blocked', 'Medium', 'Back/forward cache not restoring — root cause not yet investigated.'],
                ['Google OAuth app not verified', 'Low', 'Required before full production use.'],
              ],
            },
          ],
        },
      ],
    },

    // ── Next Steps ───────────────────────────────────────────────────────────
    {
      title: '4. Next Steps',
      intro: null,
      subsections: [
        {
          title: '4.1 Immediate',
          blocks: [
            { type: 'bullet', text: 'Investigate bfcache blocker — identify what is preventing back/forward cache restoration.' },
          ],
        },
        {
          title: '4.2 Feature Backlog',
          blocks: [
            {
              type: 'table',
              headers: ['Feature', 'Priority', 'Notes'],
              rows: [
                ['Notifications system', 'High', 'Alert admin of new submissions and comments'],
                ['bfcache investigation', 'Medium', 'What is blocking back/forward cache restoration'],
                ['Instagram integration', 'Medium', 'Requires Meta App setup and review'],
                ['SEO metadata management', 'Medium', 'Page titles, descriptions, OG tags via admin'],
                ['Band member profiles page', 'Medium', 'Bio, photo, social links'],
                ['Press kit / EPK page', 'Medium', 'Downloadable assets for press'],
                ['Email newsletter integration', 'Medium', 'Mailchimp or similar'],
                ['Accessibility audit', 'Medium', 'Keyboard nav, ARIA labels, remaining colour contrast'],
                ['callWithTokenRefresh refactor', 'Low', 'Extract to src/utils/googleApi.js'],
                ['Production security hardening', 'Low', 'CSP headers, rate limiting on Edge Functions'],
                ['Ultra-wide layout fix', 'Low', 'Centering on screens wider than 1920px'],
              ],
            },
          ],
        },
      ],
    },
  ],

  // Footer line
  footer: 'Generated: 27 February 2026  ·  Dam Anna Website Project  ·  Sessions 13 & 14',
};

// ═══════════════════════════════════════════════════════════════════════════
// RENDERER — generic, do not edit for content changes
// ═══════════════════════════════════════════════════════════════════════════

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} = require('docx');
const fs = require('fs');
const path = require('path');

function h1(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } });
}
function h2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 320, after: 160 } });
}
function body(text) {
  return new Paragraph({ children: [new TextRun({ text, size: 24 })], spacing: { before: 80, after: 80 } });
}
function bullet(text, bold = false) {
  return new Paragraph({ bullet: { level: 0 }, children: [new TextRun({ text, size: 24, bold })], spacing: { before: 60, after: 60 } });
}
function spacer() {
  return new Paragraph({ children: [], spacing: { before: 120, after: 0 } });
}
function rule() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
    spacing: { before: 200, after: 200 },
    children: [],
  });
}

function makeTable(headers, rows) {
  const colPct = Math.floor(100 / headers.length);

  const headerRow = new TableRow({
    children: headers.map(
      (h) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 22, color: 'FFFFFF' })] })],
          shading: { type: ShadingType.SOLID, color: '2E2E2E' },
          width: { size: colPct, type: WidthType.PERCENTAGE },
        })
    ),
  });

  const dataRows = rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(cell), size: 22 })] })],
              width: { size: Math.floor(100 / row.length), type: WidthType.PERCENTAGE },
            })
        ),
      })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function renderBlock(block) {
  switch (block.type) {
    case 'body':      return body(block.text);
    case 'bullet':    return bullet(block.text, block.bold || false);
    case 'subbullet': return new Paragraph({ bullet: { level: 1 }, children: [new TextRun({ text: block.text, size: 22, color: '444444' })], spacing: { before: 40, after: 40 } });
    case 'table':     return makeTable(block.headers, block.rows);
    case 'spacer':    return spacer();
    default:          return body(block.text || '');
  }
}

function buildDoc(report) {
  const children = [];

  // Cover
  children.push(
    new Paragraph({ children: [new TextRun({ text: report.title, bold: true, size: 56, color: '111111' })], alignment: AlignmentType.CENTER, spacing: { before: 800, after: 200 } }),
    new Paragraph({ children: [new TextRun({ text: report.subtitle, size: 32, color: '444444' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 160 } }),
    new Paragraph({ children: [new TextRun({ text: report.dateRange, size: 24, color: '888888' })], alignment: AlignmentType.CENTER, spacing: { before: 0, after: 600 } }),
    rule()
  );

  // Overview
  children.push(h1('Overview'));
  if (report.intro) children.push(body(report.intro));
  children.push(spacer(), makeTable(['Item', 'Detail'], report.summary), spacer(), rule());

  // Sections
  for (const section of report.sections) {
    children.push(h1(section.title));
    if (section.intro) children.push(body(section.intro));

    for (const sub of section.subsections) {
      children.push(h2(sub.title));
      for (const block of sub.blocks) {
        children.push(renderBlock(block));
      }
      children.push(spacer());
    }

    children.push(rule());
  }

  // Footer
  children.push(
    new Paragraph({ children: [new TextRun({ text: report.footer, size: 18, color: '888888' })], alignment: AlignmentType.CENTER, spacing: { before: 400 } })
  );

  return new Document({
    creator: 'Dam Anna Dev',
    title: report.subtitle,
    sections: [{ children }],
  });
}

const outPath = path.join(__dirname, '..', 'docs', REPORT.filename);

Packer.toBuffer(buildDoc(REPORT)).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log(`Report written to: ${outPath}`);
});
