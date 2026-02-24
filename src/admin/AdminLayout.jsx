import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import AdminRoute from './AdminRoute';
import AdminHeader from './components/AdminHeader';
import AdminSidebar from './components/AdminSidebar';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import SiteContentPage from './pages/SiteContentPage';
import SocialLinksPage from './pages/SocialLinksPage';
import VideosPage from './pages/VideosPage';
import GigsPage from './pages/GigsPage';
import GalleryPage from './pages/GalleryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SubmissionsPage from './pages/SubmissionsPage';
import GmailPage from './pages/GmailPage';

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
 *
 * Owns the mobile sidebar open/close state and passes it down to
 * AdminHeader (hamburger button) and AdminSidebar (drawer visibility).
 *
 * Desktop/tablet (md+): sidebar is always visible, sidebarOpen is unused.
 * Mobile (below md): sidebar is a slide-out drawer controlled by sidebarOpen.
 */
function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = window.matchMedia('pointer: coarse').matches; // Simple mobile detection for isMobile prop
  // const isMobile = true; // Force mobile layout for testing

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      <AdminHeader
        onMenuClick={() => setSidebarOpen(true)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 min-h-0">
        <AdminSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Content area -- reduced padding on mobile */}
        <main className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route
              path="analytics"
              element={<AnalyticsPage isMobile={isMobile} />}
            />
            <Route path="gigs" element={<GigsPage />} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="site-content" element={<SiteContentPage />} />
            <Route path="social-links" element={<SocialLinksPage />} />
            <Route path="gmail" element={<GmailPage isMobile={isMobile} />} />
            <Route
              path="submissions"
              element={<SubmissionsPage isMobile={isMobile} />}
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
