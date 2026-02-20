/**
 * useAnalytics.js
 *
 * Fetches visit counts from the page_views table for three time windows:
 * last 24 hours, last 7 days, last 30 days.
 *
 * Returns: { data: { day, week, month }, loading, error }
 *
 * Requires authenticated session -- only used inside admin routes.
 *
 * Extensibility note: to add new metrics (top pages, referrers, device type),
 * add columns to page_views, update trackVisit.js to insert them,
 * and add new queries here.
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// CUSTOMIZATION: How often the counts auto-refresh (milliseconds)
const REFRESH_INTERVAL_MS = 60_000; // 60 seconds

export default function useAnalytics() {
  const [data, setData] = useState({ day: null, week: null, month: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchCounts() {
    try {
      const now = new Date();

      const cutoffs = {
        day: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        week: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
        month: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Run all three counts in parallel
      const [dayRes, weekRes, monthRes] = await Promise.all([
        supabase
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .gte('visited_at', cutoffs.day),
        supabase
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .gte('visited_at', cutoffs.week),
        supabase
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .gte('visited_at', cutoffs.month),
      ]);

      // Surface the first error if any query failed
      const firstError = dayRes.error || weekRes.error || monthRes.error;
      if (firstError) throw firstError;

      setData({
        day: dayRes.count ?? 0,
        week: weekRes.count ?? 0,
        month: monthRes.count ?? 0,
      });
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCounts();

    // Auto-refresh every REFRESH_INTERVAL_MS
    const interval = setInterval(fetchCounts, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error };
}
