# Dam Anna Website - Testing Documentation

## Overview

This document tracks manual testing for each development phase. Automated testing with Playwright will be added after mobile and database implementation.

---

## Navigation System Testing

**Date:** 2026-02-12  
**Branch:** `feature/navigation-system`  
**Tester:** Adam Hemmings
**Status:** Complete ✅

### Testing Environment

- **Browser:** Chrome/Firefox/Safari
- **Viewport:** Desktop (1920x1080 recommended)
- **Mobile:** Tested - Broken (resolved in Mobile Responsive phase)

---

### Test Results

#### 1. Navigation Bar

- [✅] Fixed at top, stays visible while scrolling
- [✅] Blur backdrop visible and functional
- [✅] Soft shadow and border visible
- [✅] "Dam Anna" logo clickable (scrolls to top)
- [✅] All nav items visible and readable
- [✅] "You" nav item enabled (not greyed out)

#### 2. Navigation Links - Scroll Behavior

- [✅] **Home** - Smooth scroll to top of page
- [✅] **Gigs** - Smooth scroll to Gigs section (both GigsSection and GigPhotosSection visible)

#### 3. Navigation Links - Modal Triggers

- [✅] **About Us** - Opens About Us modal
- [✅] **Gallery** - Opens Gallery modal
- [✅] **Socials** - Opens Socials modal
- [✅] **Contact** - Opens Contact modal
- [✅] **You** - Opens You modal

#### 4. About Us Modal

- [✅] Opens with smooth fade-in animation
- [✅] Framed border appears correctly
- [✅] Blur backdrop visible
- [✅] Content is readable
- [✅] X button (top right) closes modal
- [✅] Clicking backdrop closes modal
- [✅] Smooth fade-out animation on close
- [✅] Body scroll locked while open
- [✅] Scroll position restored on close

#### 5. Socials Modal

- [✅] Opens with fade-in animation
- [✅] Blur backdrop visible
- [✅] Social media cards visible (Instagram, YouTube)
- [✅] Hover effect works (scale + shadow)
- [✅] Instagram link opens in new tab
- [✅] YouTube link opens in new tab
- [✅] X button closes modal
- [✅] Backdrop click closes modal
- [✅] Fade-out animation works

#### 6. Contact Modal

- [✅] Opens with fade-in animation
- [✅] Framed border appears correctly
- [✅] Blur backdrop visible
- [✅] Band email displayed correctly
- [✅] Email is clickable (mailto: link)
- [✅] Email input field is disabled/greyed out
- [✅] Submit button is disabled with "Coming Soon" text
- [✅] Helper text visible ("Mailing list feature will be available soon!")
- [✅] X button closes modal
- [✅] Backdrop click closes modal
- [✅] Fade-out animation works

#### 7. Gallery Modal

- [✅] Opens with fade-in animation
- [✅] Blur backdrop visible
- [✅] "Gallery" heading displayed
- [✅] Thumbnail grid visible (3 columns)
- [✅] Hover on thumbnail shows scale effect
- [✅] Hover shows metadata (date + location)
- [✅] Click thumbnail shows enlarged view
- [✅] Enlarged image displays with metadata
- [✅] Click outside enlarged image returns to grid
- [✅] Scroll works in thumbnail view
- [✅] X button closes modal
- [✅] Backdrop click closes modal (when not viewing enlarged image)

#### 8. You Modal

- [✅] Opens with fade-in animation
- [✅] Framed border appears correctly
- [✅] Blur backdrop visible
- [✅] Camera svg displays at correct size
- [✅] "Send Us Your Pics" heading displayed
- [✅] Development status message clear
- [✅] X button closes modal
- [✅] Backdrop click closes modal
- [✅] Fade-out animation works

#### 9. Scroll Lock Behavior

- [✅] Body scroll locks when any modal opens
- [✅] Scroll position maintained when modal opens
- [✅] Scroll position restored correctly when modal closes
- [✅] No horizontal scrollbar appears
- [✅] Minimal/acceptable layout jolt (known issue)

#### 10. Visual Quality

- [✅] All frames render correctly
- [✅] No visual glitches or artifacts
- [✅] Text readable on all backgrounds
- [✅] Animations are smooth (no jank)
- [✅] No content overflow or clipping
- [✅] Consistent spacing across sections

#### 11. Console Check

- [✅] No JavaScript errors in console
- [✅] No React warnings in console
- [✅] No network errors (404s, failed resources)
- [✅] No accessibility warnings

#### 12. Cross-Browser Testing (Optional)

- [✅] Chrome - All features work
- [✅] Firefox - All features work
- [✅] Safari - All features work
- [✅] Edge - All features work

---

### Known Issues (Non-Blocking)

1. **Modal Body Jolt** - Minor layout shift when scrollbar disappears/reappears. Status: Documented, acceptable UX trade-off.
2. **Layout Centering** - Large margins on ultra-wide screens. Status: Pinned for fine-tuning phase.

### Sign-off

**All Critical Tests Pass:** [✅] Yes  
**Blocking Bugs:** [✅] None  
**Ready for Merge:** [✅] Yes

**Tested by:** Adam Hemmings  
**Date:** 2026-02-12  
**Approved for merge:** Adam Hemmings - 12-02-26

---

## Mobile Responsive Testing

**Date:** 2026-02-14  
**Branch:** `feature/mobile-responsive`  
**Tester:** Pending  
**Status:** Ready for Testing

### Testing Environment (mobile device)

- **Browser:** Chrome DevTools Device Emulation + Physical Devices
- **Viewports:** iPhone SE (375px), iPhone 14 (390px), iPad (768px), iPad Pro (1024px), Samsung Galaxy Tab S11 Ultra (1400px+)
- **Tools:** Chrome Lighthouse (Incognito), Chrome DevTools

---

### Phase 1: Hamburger Menu

#### 1.1 Hamburger Button

- [✅] Hamburger icon visible below 1280px
- [✅] Hamburger icon visible on touch-primary devices (any screen size)
- [✅] Desktop nav visible on non-touch devices above 1280px
- [✅] 44x44px touch target (inspect element to verify)
- [✅] Hamburger animates to X when menu opens
- [✅] X animates back to hamburger when menu closes

#### 1.2 Mobile Menu Drawer

- [✅] Drawer slides in from left on open
- [✅] Drawer slides out to left on close
- [✅] Dark + blur backdrop appears behind drawer
- [✅] Tapping backdrop closes drawer
- [✅] All 7 nav items visible in drawer
- [✅] Nav items have staggered entrance animation
- [✅] Tapping a nav item closes drawer and triggers action
- [✅] "Dam Anna" logo in drawer header scrolls to top
- [✅] Close button (X) in drawer header works
- [✅] Body scroll locked while drawer is open

#### 1.3 Drawer Navigation Actions

- [✅] **Home** - Closes drawer, scrolls to top
- [✅] **About Us** - Closes drawer, opens About Us modal
- [✅] **Gigs** - Closes drawer, scrolls to Gigs section
- [✅] **Gallery** - Closes drawer, opens Gallery modal
- [✅] **Socials** - Closes drawer, opens Socials modal
- [✅] **Contact** - Closes drawer, opens Contact modal
- [✅] **You** - Closes drawer, opens You modal

#### 1.4 Device Detection

- [✅] iPad Pro 11" (1024px landscape) shows hamburger menu
- [✅] iPad Pro 13" shows hamburger menu
- [✅] Samsung Galaxy Tab S11 Ultra (1400px+) shows hamburger menu (touch-primary)
- [✅] Surface laptop with touchscreen shows desktop nav (fine pointer primary)
- [✅] Drawer auto-closes when resizing to desktop width
- [✅] Orientation change re-evaluates correctly

---

### Phase 2: Responsive Layout

#### 2.1 No Horizontal Scrolling

- [✅] No horizontal scroll on iPhone SE (375px)
- [✅] No horizontal scroll on iPhone 14 (390px)
- [✅] No horizontal scroll on iPad (768px)
- [✅] No horizontal scroll on iPad Pro (1024px)
- [✅] No horizontal scroll on desktop (1920px)

#### 2.2 Section Stacking

- [✅] Gigs + Gig Photos stack vertically on mobile
- [✅] Previous Gigs + Gallery stack vertically on mobile
- [✅] Gigs + Gig Photos sit side-by-side on desktop
- [✅] Previous Gigs + Gallery sit side-by-side on desktop
- [✅] Sections centered when stacked on mobile

#### 2.3 Text Readability

- [✅] GigsSection: gig info readable on 375px (not wrapping onto multiple lines)
- [✅] GigsSection: ticket links visible and tappable
- [✅] PreviousGigsSection: venue names readable on 375px
- [✅] BlockQuote: text fits within frame on all sizes
- [✅] HeroSection: logo appropriately sized on mobile

#### 2.4 Spacing

- [✅] Reduced vertical spacing on mobile (mb-20 vs mb-87.5)
- [✅] Reduced top padding on mobile (pt-100px vs pt-180px)
- [✅] No content overlapping or touching edges
- [✅] Framed sections have appropriate padding on mobile

#### 2.5 Desktop Unchanged

- [✅] Desktop layout identical to pre-mobile implementation
- [✅] No visual regressions on desktop (1920px)
- [✅]Section offsets (ml-50, mt-[-30px]) working on desktop
- [✅] 12-column grid working on desktop

---

### Phase 3: Mobile Modals

#### 3.1 Close Button Position

- [✅] Close button visible below nav bar on mobile (not hidden under hamburger)
- [✅] Close button visible below nav bar on tablet
- [✅] Close button at top-right on desktop (unchanged)
- [✅] Close button is 44x44px touch target on all modals
- [✅] Close button has active state feedback on touch

#### 3.2 About Us Modal (Mobile)

- [✅] Content fits without horizontal scroll
- [✅] Text readable at mobile font size
- [✅] Framed border renders correctly
- [✅] Backdrop click closes modal
- [✅] Scroll works if content exceeds viewport

#### 3.3 Socials Modal (Mobile)

- [✅] Heading "Connect With Us" fully visible (not clipped off top)
- [✅] Cards in single column layout
- [✅] Cards appropriately sized (not too large)
- [✅] Card tap feedback (active:scale-95) works
- [✅] Social links open in new tab

#### 3.4 Contact Modal (Mobile)

- [✅] All text readable and properly sized
- [✅] Email link tappable
- [✅] Form input properly sized
- [✅] "Coming Soon" button visible
- [✅] Content doesn't overflow frame

#### 3.5 Gallery Modal (Mobile)

- [✅] Thumbnail grid shows 2 columns on mobile
- [✅] Thumbnail grid shows 3 columns on desktop
- [✅] No hover metadata on touch devices (prevents sticky overlay)
- [✅] Hover metadata works on desktop
- [✅] Close button below nav bar
- [✅] Grid scrollable with proper top padding

#### 3.6 Gallery Enlarged View (Mobile)

- [✅] Metadata displayed BELOW image (not overlaying)
- [✅] Metadata text appropriately sized
- [✅] Image counter visible ("3 / 9")
- [✅] Previous/Next arrows visible and tappable
- [✅] Swipe left navigates to next image
- [✅] Swipe right navigates to previous image
- [✅] Swipe doesn't trigger on vertical scroll
- [✅] Keyboard arrows work on desktop
- [✅] Escape key returns to grid on desktop
- [✅] Tapping outside image returns to grid

#### 3.7 Gallery - Opened from Slideshow

- [✅] Gallery modal renders above nav bar (z-index correct)
- [✅] Same behaviour as opening from nav bar
- [✅] Close button visible and functional

#### 3.8 You Modal (Mobile)

- [✅]Camera icon appropriately sized
- [✅] Heading readable
- [✅] Description text readable
- [✅] Frame renders correctly

---

### Phase 4: Three.js Optimization

#### 4.1 Performance - Mobile

- [✅] Console log confirms "Mobile/Tablet mode" with reduced settings
- [✅] Star count reduced (60 stars on mobile vs 200 on desktop)
- [✅] Animation runs smoothly (no visible stuttering)
- [✅] Guitar model loads and animates on scroll
- [✅] No white flash or missing background on load

#### 4.2 Performance - Desktop

- [✅] Console log confirms "Desktop mode" with full settings
- [✅] Star count at 200
- [✅] Full pixel ratio used
- [✅] No visual regression from optimization changes

#### 4.3 Lighthouse Scores (Production Build)

- [✅] Run: `npm run build && npm run preview`
- [✅] Run Lighthouse in Chrome Incognito
- [✅] Performance: _____ (target: 60+ with current GLB size)
- [✅] Accessibility: _____ (target: 95+)
- [✅] Best Practices: _____ (target: 100)
- [✅] SEO: _____ (target: 90+)

---

### Phase 5: Touch Interactions

#### 5.1 Gallery Swipe

- [✅] Swipe left on enlarged image goes to next photo
- [✅] Swipe right on enlarged image goes to previous photo
- [✅] Swipe wraps around (last → first, first → last)
- [✅] Short swipes (< 50px) don't trigger navigation
- [✅] Diagonal swipes don't trigger navigation
- [✅] Swipe works on physical device

#### 5.2 Touch Feedback

- [✅] All buttons have active state (colour change on press)
- [✅] Social cards have active:scale-95 on press
- [✅] Nav drawer items highlight on tap
- [✅] Gallery thumbnails respond to tap

#### 5.3 General Touch

- [✅] No double-tap zoom issues on interactive elements
- [✅] No accidental text selection on buttons
- [✅] Slideshows auto-advance (no swipe conflict)

---

### Phase 6: SEO & Performance Quick Wins

#### 6.1 Meta Description

- [✅] `<meta name="description">` present in page source
- [✅] Description appears in Lighthouse SEO audit
- [✅] Description is appropriate length (50-160 characters)

#### 6.2 robots.txt

- [✅] Accessible at /robots.txt in browser
- [✅] Lighthouse no longer flags robots.txt error
- [✅] Content allows all crawlers

#### 6.3 Vite Chunk Splitting

- [✅] `npm run build` produces separate Three.js chunk
- [✅] No "chunk larger than 500KB" warning
- [✅] Site loads correctly from production build

---

### Known Issues (Non-Blocking)

1. **Modal Body Jolt** - Minor layout shift when scrollbar disappears/reappears. Status: Documented, acceptable UX trade-off.
2. **Layout Centering** - Large margins on ultra-wide screens. Status: Pinned for fine-tuning phase.
3. **GLB Model Size** - guitar.glb is 15MB, causing slow LCP on throttled connections. Status: Pinned for gltf-transform compression.
4. **Gallery Images** - Hosted on ImageShack, not optimised for responsive delivery. Status: Will be resolved during Supabase database phase.

### Bugs Found

*List any bugs discovered during testing:*

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| - | - | - | - |

---

### Sign-off

**All Critical Tests Pass:** [✅] Yes / [ ] No  
**Blocking Bugs:** [✅] None / [ ] Listed above  
**Ready for Merge:** [✅] Yes / [ ] No

**Tested by:**  Adam Hemmings
**Date:**  14-02-2026
**Approved for merge:** Adam Hemmings

---

## Future Testing Phases

### Phase: Database Integration (Pending)

- API calls and data loading
- Image uploads
- CRUD operations
- Error handling
- Supabase connection
- Row Level Security

### Phase: Admin Dashboard (Pending)

- Authentication
- Protected routes
- Content management
- User submission moderation

---

## Automated Testing (Playwright) - Scheduled After Mobile/Database

### Critical User Flows to Test

1. **Gallery Flow:** User clicks Gallery nav → Modal opens → Click thumbnail → Swipe through images → Close modal
2. **Contact Flow:** User clicks Contact → Modal opens → Email link works → Form shows "Coming soon"
3. **Gig Info Flow:** User scrolls to Gigs → Information visible → Photos slideshow works
4. **Navigation Flow:** Test all nav links work correctly
5. **Mobile Nav Flow:** Hamburger opens → Drawer slides in → Tap nav item → Drawer closes → Action triggers

### Setup Checklist (Future)

- [ ] Install Playwright
- [ ] Configure test environment
- [ ] Write test specs for critical flows
- [ ] Integrate with CI/CD
- [ ] Set up test reporting
