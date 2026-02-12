import { useState } from 'react';

/**
 * Navigation - Fixed top navigation bar with blur backdrop
 * 
 * CUSTOMIZATION:
 * - NAV_ITEMS: Add/remove/reorder navigation items
 * - BLUR_AMOUNT: Adjust backdrop blur intensity
 * - BG_OPACITY: Adjust background darkness
 * - Height: Adjust py-4 for taller/shorter nav
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

export default function Navigation({ onNavClick }) {
  return (
    <nav id="main-nav"
      className={`fixed top-0 left-0 right-0 z-[9998] ${BLUR_AMOUNT} ${BG_OPACITY} shadow-lg border-b border-white/10`}
      style={{
        // Fallback for browsers that don't support backdrop-blur
        backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgba(0, 0, 0, 0.9)' : undefined
      }}
    >
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Brand - Left side */}
          <div className="flex-shrink-0">
            <button
              onClick={() => onNavClick('home')}
              className="font-hero text-white text-5xl font-bold hover:text-gray-300 transition-colors"
            >
              Dam Anna
            </button>
          </div>

          {/* Navigation Items - Right side */}
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
        </div>
      </div>
    </nav>
  );
}