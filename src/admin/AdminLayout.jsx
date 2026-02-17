import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import AdminRoute from './AdminRoute';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import SiteContentPage from './pages/SiteContentPage';

/**
 * AdminLayout -- Root layout for the admin dashboard.
 * 
 * Handles two concerns:
 * 1. The login page (public, no sidebar/header)
 * 2. The authenticated dashboard (header + sidebar + content area)
 * 
 * All dashboard pages are wrapped in <AdminRoute> which redirects
 * to /admin/login if the user is not authenticated.
 */

export default function AdminLayout() {
  return (
    <Routes>
      {/* Login page -- no header, no sidebar */}
      <Route path="login" element={<LoginPageWrapper />} />

      {/* All authenticated admin routes */}
      <Route
        path="*"
        element={
          <AdminRoute>
            <AdminShell />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

/**
 * LoginPageWrapper -- Redirects to dashboard if already logged in.
 * Prevents authenticated users from seeing the login form.
 */
function LoginPageWrapper() {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div
          className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Checking authentication"
        />
      </div>
    );
  }

  // Already logged in -- skip login page
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return <LoginPage />;
}

/**
 * AdminShell -- Authenticated layout with header, sidebar, and content area.
 * Content area renders nested routes for each admin page.
 */
function AdminShell() {
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      <AdminHeader />

      <div className="flex flex-1 min-h-0">
        <AdminSidebar />

        {/* Content area */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="gigs" element={<PlaceholderPage title="Gigs" />} />
            <Route path="gallery" element={<PlaceholderPage title="Gallery" />} />
            <Route path="videos" element={<PlaceholderPage title="Videos" />} />
            <Route path="site-content" element={<SiteContentPage />} />
            <Route path="social-links" element={<PlaceholderPage title="Social Links" />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/**
 * PlaceholderPage -- Temporary page for routes that will get
 * full CRUD implementations in Session 5.
 */
function PlaceholderPage({ title }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{title}</h1>
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6">
        <p className="text-zinc-400">
          {title} management page coming in Session 5.
        </p>
      </div>
    </div>
  );
}