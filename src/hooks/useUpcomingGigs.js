import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useUpcomingGigs - Fetches gigs with a date of today or later
 * 
 * Returns: { gigs, loading, error }
 * - gigs: array of upcoming gig objects, ordered by date ascending
 * - loading: true while the fetch is in progress
 * - error: error message string if the fetch fails, null otherwise
 */
export default function useUpcomingGigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGigs() {
      try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error: supabaseError } = await supabase
          .from('gigs')
          .select('*')
          .gte('date', today)
          .eq('is_visible', true)
          .order('date', { ascending: true })
          .order('display_order', { ascending: true });

        if (supabaseError) throw supabaseError;

        setGigs(data);
      } catch (err) {
        console.error('Failed to fetch upcoming gigs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGigs();
  }, []);

  return { gigs, loading, error };
}