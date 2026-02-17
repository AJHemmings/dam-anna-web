import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * AdminHeader -- Top bar for the admin dashboard.
 * 
 * Shows the logged-in user's email and a logout button.
 * Logout clears the session and redirects to the login page.
 */

// CUSTOMIZATION: Header styling
const HEADER_BG = 'bg-zinc-800';
const HEADER_BORDER = 'border-b border-zinc-700';
const HEADER_HEIGHT = 'h-16';

// CUSTOMIZATION: Logout button styling
const LOGOUT_BG = 'bg-zinc-700';
const LOGOUT_HOVER = 'hover:bg-zinc-600';

export default function AdminHeader() {
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
    <header className={`${HEADER_BG} ${HEADER_BORDER} ${HEADER_HEIGHT} flex items-center justify-between px-6`}>
      <h1 className="text-white font-semibold text-lg">Dam Anna Admin</h1>

      <div className="flex items-center gap-4">
        <span className="text-zinc-400 text-sm hidden sm:block">
          {user?.email}
        </span>
        <button
          onClick={handleLogout}
          className={`px-3 py-1.5 ${LOGOUT_BG} ${LOGOUT_HOVER} text-white text-sm rounded transition-colors`}
        >
          Log out
        </button>
      </div>
    </header>
  );
}