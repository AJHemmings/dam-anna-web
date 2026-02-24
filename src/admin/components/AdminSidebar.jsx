import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * AdminSidebar -- Side navigation for the admin dashboard.
 *
 * Desktop/tablet (md and above): Pinned sidebar, always visible.
 * Mobile (below md): Off-canvas slide-out drawer, triggered by hamburger
 * in AdminHeader. Closes on nav link tap, backdrop tap, or Escape key.
 *
 * Props:
 *   isOpen      {boolean}  -- Whether the mobile drawer is open
 *   onClose     {function} -- Callback to close the drawer
 *
 * Active links are highlighted. Placeholder items for features
 * not yet built are visually greyed out and non-clickable.
 */

// CUSTOMIZATION: Sidebar styling
const SIDEBAR_BG = 'bg-zinc-800';
const SIDEBAR_BORDER = 'border-r border-zinc-700';
const SIDEBAR_WIDTH = 'w-64';

// CUSTOMIZATION: Drawer animation duration (must match CSS transition)
const DRAWER_TRANSITION = 'transition-transform duration-300 ease-in-out';

// CUSTOMIZATION: Backdrop
const BACKDROP_COLOR = 'bg-black/60';
const BACKDROP_TRANSITION = 'transition-opacity duration-300';

// CUSTOMIZATION: Link styling
const LINK_BASE = 'block px-4 py-3 rounded text-sm transition-colors';
const LINK_ACTIVE = 'bg-zinc-700 text-white';
const LINK_INACTIVE = 'text-zinc-400 hover:text-white hover:bg-zinc-700/50';
const LINK_DISABLED = 'text-zinc-600 cursor-not-allowed';

/** Navigation items. Set enabled: false for work-in-progress features. */
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', end: true, enabled: true },
  { label: 'Gigs', path: '/admin/gigs', enabled: true },
  { label: 'Gallery', path: '/admin/gallery', enabled: true },
  { label: 'Videos', path: '/admin/videos', enabled: true },
  { label: 'Site Content', path: '/admin/site-content', enabled: true },
  { label: 'Social Links', path: '/admin/social-links', enabled: true },
  { label: 'Social Media', path: null, enabled: false },
  { label: 'User Submissions', path: '/admin/submissions', enabled: true },
  { label: 'Analytics', path: '/admin/analytics', enabled: true },
  { label: 'Mail', path: '/admin/gmail', enabled: true },
];

export default function AdminSidebar({ isOpen, onClose }) {
  // Close drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navContent = (
    <nav aria-label="Admin navigation" className="py-6 px-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        if (!item.enabled) {
          return (
            <span
              key={item.label}
              className={`${LINK_BASE} ${LINK_DISABLED} flex items-center justify-between`}
            >
              {item.label}
              <span className="text-xs text-zinc-600">Coming soon</span>
            </span>
          );
        }

        return (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end || false}
            className={({ isActive }) =>
              `${LINK_BASE} ${isActive ? LINK_ACTIVE : LINK_INACTIVE}`
            }
            onClick={onClose}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/*
        Desktop/tablet sidebar -- always visible at md and above.
        Hidden on mobile (hidden md:flex).
      */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 ${SIDEBAR_WIDTH} ${SIDEBAR_BG} ${SIDEBAR_BORDER} min-h-0`}
      >
        {navContent}
      </aside>

      {/*
        Mobile drawer -- off-canvas, slides in from left.
        Rendered in the DOM always so the close animation plays correctly.
        Visibility is controlled by isOpen via transform.
      */}
      <div className="md:hidden">
        {/* Backdrop overlay */}
        <div
          className={`fixed inset-0 z-40 ${BACKDROP_COLOR} ${BACKDROP_TRANSITION} ${
            isOpen
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full ${SIDEBAR_WIDTH} ${SIDEBAR_BG} ${SIDEBAR_BORDER} ${DRAWER_TRANSITION} ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Mobile admin navigation"
        >
          {/* Close button inside drawer */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-zinc-700">
            <span className="text-white font-semibold text-sm">Menu</span>
            <button
              onClick={onClose}
              className="p-2.5 text-zinc-400 hover:text-white rounded transition-colors"
              aria-label="Close navigation menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {navContent}
        </aside>
      </div>
    </>
  );
}
