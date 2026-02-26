# Dam Anna —

## Active Focus Areas

- Admin dashboard — refactoring and stabilising existing functionality
- 3D guitar / Three.js — optimisation and animation refinement
- Frontend UI and animations — consistency and performance
- Sustainable web design

## Design Log

All major architectural decisions, patterns, and the reasoning behind
them are documented in the design log. Read it before suggesting any
structural changes.
Location: docs/design-log/DESIGN_LOG.md

## Session Handover

Read the handover file at the start of every session to get up to
speed on where the project was left.
Location: docs/handover.md

## Skills

When working on frontend tasks, read ~/.claude/skills/frontend.md
When working on backend tasks, read ~/.claude/skills/backend.md
When working on database tasks, read ~/.claude/skills/database.md
When working on deployment or CI/CD, read ~/.claude/skills/devops.md
When working on UI or UX, read ~/.claude/skills/ui-ux.md
When writing tests or test plans, read ~/.claude/skills/testing.md
When generating reports or handovers, read ~/.claude/skills/documentation.md

## Codebase Rules

- Always check with Mak before refactoring existing code
- Follow established patterns — check the design log if unsure
- Flag when something could be architected better, but do not
  implement changes without explicit approval
- Prefer small focused changes — no large rewrites

## What Not To Do

- Do not suggest new features — we are stabilising, not building
- Do not duplicate information already in the design log
- Do not assume the stack — read package.json if you need to
  confirm a dependency

## UI Visual Language

- Rock/soul/punk aesthetic — bold, atmospheric, high contrast
- Three.js guitar background is the hero — UI layers on top,
  never competes with it
- Borderless with rounded corners for media content (slideshows,
  video thumbnails)
- FramedSection for text content — visual distinction between
  media and text
- shadow-2xl/190 on slideshows and video thumbnails for depth

## Admin Dashboard Conventions

- Band members check the dashboard on their phones between gigs —
  every admin feature must be usable on mobile, not just viewable
- Destructive actions always require explicit confirmation
- Non-admin users must never be able to access or trigger admin
  features
- AI suggestions always require human review before execution
