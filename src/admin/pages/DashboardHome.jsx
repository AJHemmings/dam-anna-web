import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * DashboardHome -- Admin landing page with overview cards.
 * 
 * Cards:
 * 1. Upcoming Gigs -- count + interactive calendar widget with gig dates
 * 2. Gallery Images -- count, clickable to /admin/gallery
 * 3. Videos -- count, clickable to /admin/videos
 * 4. Vercel Analytics -- placeholder, clickable to /admin/analytics
 * 5. Social Media -- greyed out, coming soon
 * 
 * All counts are fetched from the database on mount.
 */

// CUSTOMIZATION: Card styling
const CARD_BG = 'bg-zinc-800';
const CARD_BORDER = 'border border-zinc-700';
const CARD_RADIUS = 'rounded-lg';
const CARD_HOVER = 'hover:border-zinc-500 transition-all cursor-pointer';

// CUSTOMIZATION: Disabled card styling
const CARD_DISABLED_BG = 'bg-zinc-800/50';
const CARD_DISABLED_BORDER = 'border border-zinc-700/50';
const CARD_DISABLED_TEXT = 'text-zinc-600';

// CUSTOMIZATION: Grid layout
const GRID_LAYOUT = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';

// CUSTOMIZATION: Count text size
const COUNT_SIZE = 'text-4xl';
const COUNT_COLOR = 'text-white';
const LABEL_COLOR = 'text-zinc-400';

// CUSTOMIZATION: Calendar widget
const CALENDAR_GIG_DOT = 'bg-white';
const CALENDAR_TODAY_RING = 'ring-2 ring-white';
const CALENDAR_HEADER_COLOR = 'text-zinc-300';
const CALENDAR_DAY_COLOR = 'text-zinc-400';
const CALENDAR_OUTSIDE_COLOR = 'text-zinc-600';
const CALENDAR_NAV_COLOR = 'text-zinc-400 hover:text-white';

// CUSTOMIZATION: Card icons (SVG paths)
const ICONS = {
  gallery: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  videos: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  analytics: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  social: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
};

/**
 * Day names for calendar header.
 */
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Month names for calendar navigation.
 */
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DashboardHome() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    upcomingGigs: 0,
    galleryImages: 0,
    videos: 0,
  });
  const [gigDates, setGigDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];

      // Fetch all counts in parallel
      const [gigsResult, galleryResult, videosResult, gigDatesResult] = await Promise.all([
        supabase
          .from('gigs')
          .select('id', { count: 'exact', head: true })
          .gte('date', today)
          .eq('is_visible', true),
        supabase
          .from('gallery_images')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('videos')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('gigs')
          .select('date, venue')
          .gte('date', today)
          .eq('is_visible', true)
          .order('date', { ascending: true }),
      ]);

      setStats({
        upcomingGigs: gigsResult.count || 0,
        galleryImages: galleryResult.count || 0,
        videos: videosResult.count || 0,
      });

      setGigDates(gigDatesResult.data || []);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <div className={GRID_LAYOUT}>
        {/* Upcoming Gigs card with calendar */}
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} ${CARD_HOVER} p-5 row-span-2`}
          onClick={() => navigate('/admin/gigs')}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className={`${COUNT_SIZE} font-bold ${COUNT_COLOR}`}>{stats.upcomingGigs}</p>
              <p className={`text-sm ${LABEL_COLOR}`}>Upcoming Gigs</p>
            </div>
          </div>

          {/* Stop click propagation on calendar so navigation doesn't fire while interacting */}
          <div onClick={(e) => e.stopPropagation()}>
            <GigCalendar gigDates={gigDates} />
          </div>
        </div>

        {/* Gallery Images card */}
        <div
          className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} ${CARD_HOVER} p-5 flex items-center gap-4`}
          onClick={() => navigate('/admin/gallery')}
        >
          <div className={`${LABEL_COLOR}`}>{ICONS.gallery}</div>
          <div>
            <p className={`${COUNT_SIZE} font-bold ${COUNT_COLOR}`}>{stats.galleryImages}</p>
            <p className={`text-sm ${LABEL_COLOR}`}>Gallery Images</p>
          </div>
        </div>

        {/* Videos card */}
        <div
          className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} ${CARD_HOVER} p-5 flex items-center gap-4`}
          onClick={() => navigate('/admin/videos')}
        >
          <div className={`${LABEL_COLOR}`}>{ICONS.videos}</div>
          <div>
            <p className={`${COUNT_SIZE} font-bold ${COUNT_COLOR}`}>{stats.videos}</p>
            <p className={`text-sm ${LABEL_COLOR}`}>Videos</p>
          </div>
        </div>

        {/* Vercel Analytics card */}
        <div
          className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} ${CARD_HOVER} p-5`}
          onClick={() => navigate('/admin/analytics')}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className={`${LABEL_COLOR}`}>{ICONS.analytics}</div>
            <div>
              <p className={`text-lg font-bold ${COUNT_COLOR}`}>Analytics</p>
              <p className={`text-sm ${LABEL_COLOR}`}>View site traffic and performance</p>
            </div>
          </div>
          <div className="bg-zinc-700/30 border border-zinc-700 rounded p-3 text-center">
            <p className="text-zinc-500 text-xs">Vercel Analytics integration coming soon</p>
          </div>
        </div>

        {/* Social Media card -- disabled */}
        <div className={`${CARD_DISABLED_BG} ${CARD_DISABLED_BORDER} ${CARD_RADIUS} p-5 cursor-not-allowed`}>
          <div className="flex items-center gap-4 mb-3">
            <div className={CARD_DISABLED_TEXT}>{ICONS.social}</div>
            <div>
              <p className={`text-lg font-bold ${CARD_DISABLED_TEXT}`}>Social Media</p>
              <p className={`text-sm ${CARD_DISABLED_TEXT}`}>Likes, comments, and DMs</p>
            </div>
          </div>
          <div className="bg-zinc-700/20 border border-zinc-700/30 rounded p-3 text-center">
            <p className={`text-xs ${CARD_DISABLED_TEXT}`}>Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * GigCalendar -- Interactive monthly calendar widget.
 * 
 * Shows the current month with navigation arrows to cycle between months.
 * Days that have gigs are marked with a dot. Clicking a gig day opens
 * a popup overlay showing the venue details.
 * Today is highlighted with a ring.
 * 
 * Uses Monday as the first day of the week (UK convention).
 * Always renders 6 rows (42 cells) to maintain consistent height.
 */
function GigCalendar({ gigDates }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedGig, setSelectedGig] = useState(null);

  // Build a map of date strings to venue arrays for quick lookup
  const gigDateMap = {};
  gigDates.forEach((gig) => {
    if (!gigDateMap[gig.date]) {
      gigDateMap[gig.date] = [];
    }
    gigDateMap[gig.date].push(gig.venue);
  });

  function prevMonth() {
    setSelectedGig(null);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    setSelectedGig(null);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function goToToday() {
    setSelectedGig(null);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  function handleDayClick(dateStr, venues) {
    if (!venues) return;

    // Toggle off if clicking the same day
    if (selectedGig?.dateStr === dateStr) {
      setSelectedGig(null);
    } else {
      setSelectedGig({ dateStr, venues });
    }
  }

  /**
   * Generate calendar grid days for the viewed month.
   * Always returns exactly 42 cells (6 rows of 7) for consistent height.
   * Weeks start on Monday.
   */
  function getCalendarDays() {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);

    // Day of week: 0=Sun, 1=Mon... We want Monday=0
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const month = viewMonth === 0 ? 11 : viewMonth - 1;
      const year = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({ day, month, year, isCurrentMonth: false });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({ day, month: viewMonth, year: viewYear, isCurrentMonth: true });
    }

    // Always pad to exactly 42 cells (6 complete rows)
    const totalCells = 42;
    let nextDay = 1;
    while (days.length < totalCells) {
      const month = viewMonth === 11 ? 0 : viewMonth + 1;
      const year = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({ day: nextDay, month, year, isCurrentMonth: false });
      nextDay++;
    }

    return days;
  }

  function toDateString(year, month, day) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  function isToday(year, month, day) {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  }

  const calendarDays = getCalendarDays();

  return (
    <div className="relative">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className={`p-1 rounded ${CALENDAR_NAV_COLOR} transition-colors`}
          aria-label="Previous month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          onClick={goToToday}
          className={`text-sm font-medium ${CALENDAR_HEADER_COLOR} hover:text-white transition-colors`}
        >
          {MONTH_NAMES[viewMonth]} {viewYear}
        </button>

        <button
          onClick={nextMonth}
          className={`p-1 rounded ${CALENDAR_NAV_COLOR} transition-colors`}
          aria-label="Next month"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_NAMES.map((name) => (
          <div key={name} className="text-center text-xs text-zinc-500 py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid -- always 6 rows */}
      <div className="grid grid-cols-7 gap-0.5">
        {calendarDays.map((dayObj, idx) => {
          const dateStr = toDateString(dayObj.year, dayObj.month, dayObj.day);
          const hasGig = gigDateMap[dateStr];
          const isTodayDate = isToday(dayObj.year, dayObj.month, dayObj.day);
          const isSelected = selectedGig?.dateStr === dateStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayClick(dateStr, hasGig)}
              className={`relative text-center py-1.5 rounded text-xs transition-colors ${
                dayObj.isCurrentMonth ? CALENDAR_DAY_COLOR : CALENDAR_OUTSIDE_COLOR
              } ${isTodayDate ? CALENDAR_TODAY_RING : ''} ${
                hasGig ? 'bg-zinc-700/50 cursor-pointer hover:bg-zinc-600/50' : 'cursor-default'
              } ${isSelected ? 'bg-zinc-600' : ''}`}
              disabled={!hasGig}
              aria-label={hasGig ? `${dayObj.day} -- gig day, click for details` : `${dayObj.day}`}
            >
              {dayObj.day}

              {/* Gig indicator dot */}
              {hasGig && (
                <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${CALENDAR_GIG_DOT}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Gig details popup -- overlays on top, no layout shift */}
      {selectedGig && (
        <>
          {/* Backdrop to close popup */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setSelectedGig(null)}
          />

          <div className="absolute left-0 right-0 bottom-0 translate-y-full z-20 pt-2">
            <div className="bg-zinc-700 border border-zinc-600 rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-medium text-white text-sm">
                  {new Date(selectedGig.dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <button
                  onClick={() => setSelectedGig(null)}
                  className="text-zinc-400 hover:text-white transition-colors p-0.5"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              {selectedGig.venues.map((venue, i) => (
                <p key={i} className="text-zinc-300 text-sm">{venue}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}