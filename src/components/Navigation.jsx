import { useState, useEffect } from 'react';

/**
 * Navigation - Fixed top navigation bar with blur backdrop
 * 
 * DESKTOP: Horizontal nav bar with all items visible
 * MOBILE/TABLET: Hamburger menu with slide-in drawer from left
 * 
 * RESPONSIVE STRATEGY:
 * Uses a combination of CSS breakpoint (1280px / xl) and touch detection
 * to determine when to show the hamburger menu. This handles:
 * - Standard phones (320-430px)
 * - Standard tablets (768-1024px) 
 * - Large tablets like iPad Pro 13" in landscape (~1024-1194px)
 * - Ultra-large tablets like Samsung Galaxy Tab S11 Ultra (~1400px+)
 * - Foldable devices in unfolded state
 * 
 * Logic: Show hamburger if screen < 1280px OR if device is touch-primary
 * This ensures all tablets get the hamburger menu while touch-screen
 * laptops (Surface, etc.) with fine pointer keep the desktop nav.
 * 
 * CUSTOMIZATION:
 * - NAV_ITEMS: Add/remove/reorder navigation items
 * - BLUR_AMOUNT: Adjust backdrop blur intensity
 * - BG_OPACITY: Adjust background darkness
 * - DRAWER_WIDTH: Mobile menu width (w-72 = 288px)
 * - ANIMATION_DURATION: Drawer slide + backdrop fade speed
 * 
 * Future: Will include admin dashboard link after authentication is added
 */

// CUSTOMIZATION: Navigation items configuration
const NAV_ITEMS = [
  { id: 'home', label: 'Home', disabled: false },
  { id: 'about', label: 'About Us', disabled: false },
  { id: 'gigs', label: 'Gigs', disabled: false },
  { id: 'gallery', label: 'Gallery', disabled: false },
  { id: 'socials', label: 'Socials', disabled: false },
  { id: 'contact', label: 'Contact', disabled: false },
  { id: 'you', label: 'You', disabled: false }, 
];

// CUSTOMIZATION: Appearance settings
const BLUR_AMOUNT = 'backdrop-blur-[2px]'; // Options: backdrop-blur-sm, backdrop-blur-md, backdrop-blur-lg, backdrop-blur-xl
const BG_OPACITY = 'bg-black/30'; // Options: bg-black/10, bg-black/20, bg-black/30, etc.

/**
 * Custom hook to detect if the device should show mobile navigation.
 * 
 * Returns true (show hamburger) when:
 * 1. Screen width < 1280px (catches most tablets in landscape), OR
 * 2. Device primary pointer is "coarse" (touch-primary device like tablets)
 * 
 * Why "pointer: coarse" instead of "any-pointer: coarse"?
 * - "pointer: coarse" = the PRIMARY input is a fat finger (phones, tablets)
 * - "any-pointer: coarse" = device HAS touch (includes Surface laptops)
 * - This distinction keeps desktop nav on touch-screen laptops
 * 
 * Re-evaluates on window resize and orientation change to handle
 * foldable devices and tablets rotating between portrait/landscape.
 */
function useIsMobileNav() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return checkIsMobile();
  });

  useEffect(() => {
    function handleChange() {
      setIsMobile(checkIsMobile());
    }

    window.addEventListener('resize', handleChange);
    window.addEventListener('orientationchange', handleChange);

    // Also listen for pointer capability changes (e.g., docking/undocking a keyboard)
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}

function checkIsMobile() {
  const isNarrow = window.innerWidth < 1280;
  const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches;
  // Show hamburger if narrow screen OR touch-primary device
  return isNarrow || isTouchPrimary;
}

export default function Navigation({ onNavClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobileNav = useIsMobileNav();

  // Close mobile menu when switching to desktop nav
  useEffect(() => {
    if (!isMobileNav) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileNav]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMobileMenuOpen]);

  // Handle nav item click - close menu then trigger action
  function handleItemClick(itemId) {
    setIsMobileMenuOpen(false);
    onNavClick(itemId);
  }

  return (
    <>
      {/* ========== FIXED NAV BAR ========== */}
      <nav id="main-nav"
        className={`fixed top-0 left-0 right-0 z-[9998] ${BLUR_AMOUNT} ${BG_OPACITY} shadow-lg border-b border-white/10`}
        style={{
          backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgba(0, 0, 0, 0.9)' : undefined
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-4">
            
            {/* Logo/Brand - Left side */}
            <div className="flex-shrink-0">
              <button
                onClick={() => handleItemClick('home')}
                className={`font-hero text-white font-bold hover:text-gray-300 transition-colors ${
                  isMobileNav ? 'text-3xl' : 'text-5xl'
                }`}
              >
                Dam Anna
              </button>
            </div>

            {/* Desktop Navigation Items - Only when NOT mobile nav */}
            {!isMobileNav && (
              <ul className="flex items-center space-x-8">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => !item.disabled && onNavClick(item.id)}
                      disabled={item.disabled}
                      className={`font-hero text-3xl transition-colors ${
                        item.disabled
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-white hover:text-gray-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Hamburger Button - Only when mobile nav */}
            {isMobileNav && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative w-11 h-11 flex items-center justify-center"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {/* Three bars that animate into an X */}
                <div className="w-7 h-5 relative flex flex-col justify-between">
                  {/* Top bar */}
                  <span
                    className="block h-0.5 w-full bg-white rounded-full transition-all duration-300 ease-in-out origin-center"
                    style={{
                      transform: isMobileMenuOpen 
                        ? 'translateY(9px) rotate(45deg)' 
                        : 'translateY(0) rotate(0)',
                    }}
                  />
                  {/* Middle bar */}
                  <span
                    className="block h-0.5 w-full bg-white rounded-full transition-all duration-300 ease-in-out"
                    style={{
                      opacity: isMobileMenuOpen ? 0 : 1,
                      transform: isMobileMenuOpen ? 'scaleX(0)' : 'scaleX(1)',
                    }}
                  />
                  {/* Bottom bar */}
                  <span
                    className="block h-0.5 w-full bg-white rounded-full transition-all duration-300 ease-in-out origin-center"
                    style={{
                      transform: isMobileMenuOpen 
                        ? 'translateY(-9px) rotate(-45deg)' 
                        : 'translateY(0) rotate(0)',
                    }}
                  />
                </div>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ========== MOBILE MENU OVERLAY + DRAWER ========== */}
      {isMobileNav && (
        <>
          {/* Backdrop - dark + blur */}
          <div
            className={`fixed inset-0 z-[9997] transition-all duration-300 ease-in-out ${
              isMobileMenuOpen 
                ? 'opacity-100 pointer-events-auto' 
                : 'opacity-0 pointer-events-none'
            }`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-in Drawer */}
          <div
            className={`fixed top-0 left-0 z-[9999] h-full w-72 transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <button
                onClick={() => handleItemClick('home')}
                className="font-hero text-white text-2xl font-bold hover:text-gray-300 transition-colors"
              >
                Dam Anna
              </button>
              {/* Close button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-11 h-11 flex items-center justify-center text-white hover:text-gray-300 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <ul className="flex flex-col px-6 py-6 space-y-2">
              {NAV_ITEMS.map((item, index) => (
                <li key={item.id}>
                  <button
                    onClick={() => !item.disabled && handleItemClick(item.id)}
                    disabled={item.disabled}
                    className={`w-full text-left font-hero text-2xl py-3 px-4 rounded-lg transition-all duration-200 ${
                      item.disabled
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-white hover:text-gray-300 hover:bg-white/5 active:bg-white/10'
                    }`}
                    style={{
                      opacity: isMobileMenuOpen ? 1 : 0,
                      transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                      transition: `opacity 300ms ease ${isMobileMenuOpen ? index * 50 : 0}ms, transform 300ms ease ${isMobileMenuOpen ? index * 50 : 0}ms, background-color 200ms ease`,
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Drawer bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </>
      )}
    </>
  );
}