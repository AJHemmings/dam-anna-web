import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * AdminHeader -- Top bar for the admin dashboard.
 *
 * Shows the logged-in user's email and a logout button.
 * On mobile (below md), shows a hamburger button on the left to open
 * the slide-out sidebar drawer.
 *
 * Props:
 *   onMenuClick  {function} -- Called when hamburger button is pressed
 *   sidebarOpen  {boolean}  -- Whether the drawer is currently open (for aria)
 *
 * Logout clears the session and redirects to the login page.
 */

// CUSTOMIZATION: Header styling
const HEADER_BG = 'bg-zinc-800';
const HEADER_BORDER = 'border-b border-zinc-700';
const HEADER_HEIGHT = 'h-16';

// CUSTOMIZATION: Logout button styling
const LOGOUT_BG = 'bg-zinc-700';
const LOGOUT_HOVER = 'hover:bg-zinc-600';

export default function AdminHeader({ onMenuClick, sidebarOpen }) {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();

  async function handleLogout() {
    const { error } = await signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    navigate('/admin/login', { replace: true });
  }

  return (
    <header className={`${HEADER_BG} ${HEADER_BORDER} ${HEADER_HEIGHT} flex items-center justify-between px-4 md:px-6`}>

      <div className="flex items-center gap-3">
        {/* Hamburger button -- mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2.5 text-zinc-400 hover:text-white rounded transition-colors"
          aria-label="Open navigation menu"
          aria-expanded={sidebarOpen}
          aria-controls="mobile-sidebar"
        >
          {/* Hamburger icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-white font-semibold text-lg">Dam Anna Admin</h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-zinc-400 text-sm hidden sm:block">
          {user?.email}
        </span>
        <button
          onClick={handleLogout}
          className={`px-3 py-2 ${LOGOUT_BG} ${LOGOUT_HOVER} text-white text-sm rounded transition-colors`}
        >
          Log out
        </button>
      </div>

    </header>
  );
}
