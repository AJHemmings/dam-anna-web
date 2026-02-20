/**
 * trackVisit.js
 *
 * Fires a single insert into page_views when a new browser session starts.
 * Uses sessionStorage so multiple page views within the same tab/session
 * only count as one visit.
 *
 * Called once on app mount in App.jsx.
 * No PII is stored -- only a timestamp via Supabase's DEFAULT now().
 *
 * To add more tracking later (e.g. page path, device type):
 * add columns to the page_views table and pass them in the insert below.
 */

import { supabase } from '../lib/supabase';

// CUSTOMIZATION: sessionStorage key used to flag an already-tracked session
const SESSION_FLAG_KEY = 'da_visited';

export async function trackVisit() {
  // Already tracked this session -- do nothing
  if (sessionStorage.getItem(SESSION_FLAG_KEY)) return;

  try {
    const { error } = await supabase.from('page_views').insert([{}]); // visited_at is set server-side by DEFAULT now()

    if (error) {
      // Fail silently -- tracking should never break the public site
      console.warn('[trackVisit] Insert failed:', error.message);
      return;
    }

    // Mark this session as tracked
    sessionStorage.setItem(SESSION_FLAG_KEY, '1');
  } catch (err) {
    // Network error -- fail silently
    console.warn('[trackVisit] Unexpected error:', err.message);
  }
}
