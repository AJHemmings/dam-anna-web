import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

/**
 * AdminRoute -- Protected route wrapper for admin pages.
 * 
 * Behaviour:
 * - While auth is loading: shows a loading spinner (prevents login page flash)
 * - If authenticated: renders the child component
 * - If not authenticated: redirects to /admin/login
 * 
 * Usage:
 *   <Route path="gigs" element={<AdminRoute><GigsPage /></AdminRoute>} />
 */

// CUSTOMIZATION: Loading spinner colour
const SPINNER_COLOR = 'border-white';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuthContext();

  // Still checking auth state -- show loading instead of flashing login page
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div
          className={`w-8 h-8 border-4 ${SPINNER_COLOR} border-t-transparent rounded-full animate-spin`}
          role="status"
          aria-label="Checking authentication"
        />
      </div>
    );
  }

  // Not authenticated -- redirect to login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated -- render the protected page
  return children;
}