import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicSite from './PublicSite';

/**
 * App.jsx -- Router shell
 * 
 * Routes:
 * - "/" renders the public site (all existing functionality)
 * - "/admin/*" renders the admin dashboard (lazy-loaded, auth-protected)
 * 
 * The admin bundle is code-split so public visitors never download admin code.
 * AuthProvider wraps admin routes to provide auth state to all admin components.
 */

// Lazy-load admin routes -- only downloaded when someone navigates to /admin
const AdminLayout = lazy(() => import('./admin/AdminLayout'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public site -- exactly as before */}
        <Route path="/*" element={<PublicSite />} />

        {/* Admin dashboard -- lazy-loaded, auth-protected */}
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AuthProvider>
                <AdminLayout />
              </AuthProvider>
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Simple loading state shown while admin chunk downloads.
 * Kept minimal -- admin users will only see this briefly on first load.
 */
function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <p className="text-white text-lg">Loading dashboard...</p>
    </div>
  );
}