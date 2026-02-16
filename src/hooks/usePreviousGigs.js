import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * usePreviousGigs - Fetches gigs with a date before today
 * 
 * Returns: { gigs, loading, error }
 * - gigs: array of past gig objects, ordered by date descending (most recent first)
 * - loading: true while the fetch is in progress
 * - error: error message string if the fetch fails, null otherwise
 */
export default function usePreviousGigs() {
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
          .lt('date', today)
          .order('date', { ascending: false })
          .order('display_order', { ascending: true });

        if (supabaseError) throw supabaseError;

        setGigs(data);
      } catch (err) {
        console.error('Failed to fetch previous gigs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGigs();
  }, []);

  return { gigs, loading, error };
}