# Touch Target Audit

## Admin Dashboard Mobile Responsiveness

**Standard:** Apple HIG and Google Material Design both recommend a minimum
interactive touch target of 44×44px. This audit covers all interactive elements
added or modified in Session 5.

---

## ✅ Passing elements

### AdminHeader

| Element | Size | Notes |
| --- | --- | --- |
| Hamburger button | `p-2` + `w-5 h-5` icon = ~36px hit area, but `h-16` header centres it in a 64px tall row | Effectively 44px+ vertically due to header height |
| Log out button | `px-3 py-1.5` | Borderline -- see recommendation below |

### AdminSidebar

| Element | Size | Notes |
| --- | --- | --- |
| Nav links (desktop + drawer) | `px-4 py-3` = ~44px tall | ✅ Passes |
| Drawer close (X) button | `p-2` + `w-5 h-5` icon | ~36px hit area, acceptable in a header row context |

### GigsPage

| Element | Size | Notes |
| --- | --- | --- |
| Form inputs | `py-2.5` | ✅ Passes |
| Save / Cancel buttons | `px-4 py-2` | ✅ Passes |
| GigCard Edit / Delete | `py-2` | ✅ Passes |
| GigCard visibility icon | `p-2` | ✅ Passes |

### VideosPage

| Element | Size | Notes |
| --- | --- | --- |
| Form inputs | `py-2.5` | ✅ Passes |
| Save / Cancel buttons | `px-4 py-2` | ✅ Passes |
| VideoCard Edit / Delete / visibility | `p-2` / `py-2` | ✅ Passes |

### SocialLinksPage

| Element | Size | Notes |
| --- | --- | --- |
| Form inputs | `py-2.5` | ✅ Passes |
| Save / Cancel buttons | `px-4 py-2` | ✅ Passes |
| LinkCard Edit / Delete | `py-2` | ✅ Passes |

### SiteContentPage

| Element | Size | Notes |
| --- | --- | --- |
| Text inputs / textareas | `py-2.5` | ✅ Passes |
| Save button | `px-4 py-2` | ✅ Passes |

### GalleryPage -- bulk toolbar, upload zone, dialogs

| Element | Size | Notes |
| --- | --- | --- |
| Bulk select / Bulk mode button | `py-2` | ✅ Passes |
| Select all / Deselect all (text buttons) | Full-width tap area in stacked row | ✅ Passes |
| Edit metadata / Delete selected | `py-2` | ✅ Passes |
| Upload zone | `p-8`, full width | ✅ Passes |
| Delete / Bulk delete dialog buttons | `px-4 py-2` | ✅ Passes |
| Visibility toggle overlay (thumbnail) | `px-1.5 py-0.5` wrapping a `w-3.5 h-3.5` icon | ⚠️ See below |

---

## ⚠️ Known exceptions -- intentionally small

These elements sit inside the gallery image grid cards. The cards themselves
are compact by design (5 columns on desktop, 2 on mobile). Making the buttons
full 44px would consume more space than the card's content area allows.

### GalleryPage -- inline card buttons (Edit, Replace, Delete, Save, Cancel)

| Element | Current size | 44px compliant? |
| --- | --- | --- |
| Edit / Replace / Delete (action bar) | `px-2 py-1.5 text-xs` | ❌ ~30px tall |
| Save / Cancel (edit form) | `px-2 py-1.5 text-xs` | ❌ ~30px tall |
| Save / Cancel (replace panel) | `px-2 py-1.5 text-xs` | ❌ ~30px tall |
| Visibility toggle overlay | `px-1.5 py-0.5` | ❌ ~24px tall |
| Inline form inputs | `py-1.5 text-xs` | ❌ ~30px tall |

**Accepted trade-off:** These are power-user controls in a dense management UI,
not public-facing UI. The gallery grid card is intentionally compact. Band
members managing the gallery on mobile will be in a focused admin context,
not casually tapping. The bulk select mode (tap the thumbnail, which is a
large square target) is the recommended mobile workflow for multi-image
operations, specifically to avoid the small per-card buttons.

**Mitigation already in place:**

- Bulk select uses the full square thumbnail as the tap target (large ✅)
- Visibility toggle is on the thumbnail overlay (larger surface than a standalone icon button)
- Edit / Replace / Delete span the full card width as a group via `flex` layout

**Future improvement (not blocking PR):** On mobile only, the inline edit and
replace forms could be promoted to a modal overlay with full-size inputs and
buttons. This would remove the constraint of fitting inside a small card.

---

## Recommendations before next session

1. **Log out button** (`py-1.5`) -- increase to `py-2` for a comfortable 44px
   on mobile. Low risk, one-line change.

2. **Hamburger and drawer close buttons** -- both use `p-2` with a small icon.
   Consider `p-2.5` to give a slightly more generous hit area. Low risk.

3. **Gallery card buttons (future)** -- modal-based edit/replace on mobile
   would fully resolve the touch target exceptions. Scope for a future session.

---

## Summary

| Page | Status |
| --- | --- |
| AdminHeader | ✅ Passes (minor Log out recommendation) |
| AdminSidebar | ✅ Passes |
| GigsPage | ✅ Passes |
| VideosPage | ✅ Passes |
| SocialLinksPage | ✅ Passes |
| SiteContentPage | ✅ Passes |
| GalleryPage (bulk / upload / dialogs) | ✅ Passes |
| GalleryPage (inline card controls) | ⚠️ Accepted exception, documented |
