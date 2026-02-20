/**
 * AnalyticsPage.jsx
 *
 * Admin analytics dashboard. Displays site visit counts for three time
 * windows: last 24 hours, last 7 days, last 30 days.
 *
 * Default view: last 24 hours.
 * Toggle between windows via tab buttons.
 *
 * Responsive: uses isMobile prop consistent with all other admin pages.
 * Auto-refreshes every 60 seconds via useAnalytics hook.
 *
 * Extensibility: add new metric cards below the visitor count card
 * as the page_views table gains additional columns.
 */

import { useState } from 'react';
import useAnalytics from '../../hooks/useAnalytics';

// CUSTOMIZATION: Tab labels and their data keys
const TIME_WINDOWS = [
  { key: 'day', label: 'Last 24 hours' },
  { key: 'week', label: 'Last 7 days' },
  { key: 'month', label: 'Last 30 days' },
];

// CUSTOMIZATION: Colours for the active tab indicator
const TAB_ACTIVE_CLASS = 'bg-white text-black font-semibold';
const TAB_INACTIVE_CLASS = 'text-white/60 hover:text-white transition-colors';

export default function AnalyticsPage({ isMobile }) {
  const [activeWindow, setActiveWindow] = useState('day');
  const { data, loading, error } = useAnalytics();

  const activeLabel = TIME_WINDOWS.find((w) => w.key === activeWindow)?.label;
  const activeCount = data[activeWindow];

  return (
    <div className={`p-4 ${isMobile ? 'pt-4' : 'pt-6'}`}>
      {/* Page header */}
      <div className="mb-6">
        <h1
          className={`font-bold text-white ${isMobile ? 'text-2xl' : 'text-3xl'}`}
        >
          Analytics
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Site visitor counts -- refreshes every 60 seconds
        </p>
      </div>

      {/* Time window toggle */}
      <div className="flex gap-1 bg-white/10 rounded-xl p-1 mb-6 w-fit">
        {TIME_WINDOWS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveWindow(key)}
            className={`
              px-4 py-2 rounded-lg text-sm transition-all
              ${activeWindow === key ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS}
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Visitor count card */}
      <div
        className={`
        bg-white/10 rounded-2xl border border-white/10
        ${isMobile ? 'p-5' : 'p-8'}
        max-w-sm
      `}
      >
        <p className="text-white/60 text-sm mb-2 uppercase tracking-wider">
          Visitors
        </p>
        <p className="text-white/50 text-xs mb-4">{activeLabel}</p>

        {/* Count display */}
        {loading ? (
          <div className="h-16 flex items-center">
            <div className="w-24 h-10 bg-white/10 rounded-lg animate-pulse" />
          </div>
        ) : error ? (
          <div className="h-16 flex items-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        ) : (
          <p
            className={`font-bold text-white leading-none ${isMobile ? 'text-5xl' : 'text-6xl'}`}
          >
            {activeCount?.toLocaleString() ?? '—'}
          </p>
        )}
      </div>

      {/* Extensibility placeholder -- future metric cards go here */}
    </div>
  );
}
