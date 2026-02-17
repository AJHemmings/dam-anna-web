import { NavLink } from 'react-router-dom';

/**
 * AdminSidebar -- Side navigation for the admin dashboard.
 * 
 * Active links are highlighted. Placeholder items for features
 * not yet built are visually greyed out and non-clickable.
 * 
 * NavLink automatically adds an "active" state based on the current route,
 * which we use to style the active page link.
 */

// CUSTOMIZATION: Sidebar styling
const SIDEBAR_BG = 'bg-zinc-800';
const SIDEBAR_BORDER = 'border-r border-zinc-700';
const SIDEBAR_WIDTH = 'w-64';

// CUSTOMIZATION: Link styling
const LINK_BASE = 'block px-4 py-2.5 rounded text-sm transition-colors';
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
  { label: 'User Submissions', path: null, enabled: false },
];

export default function AdminSidebar() {
  return (
    <aside className={`${SIDEBAR_BG} ${SIDEBAR_BORDER} ${SIDEBAR_WIDTH} min-h-0 flex-shrink-0 py-6 px-3 space-y-1`}>
      <nav aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => {
          // Disabled/placeholder items
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

          // Active navigation links
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end || false}
              className={({ isActive }) =>
                `${LINK_BASE} ${isActive ? LINK_ACTIVE : LINK_INACTIVE}`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}