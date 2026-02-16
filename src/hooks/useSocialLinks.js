import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useSocialLinks - Fetches social media links from Supabase
 * 
 * Returns: { links, loading, error }
 * - links: array of social link objects, ordered by display_order
 * - loading: true while the fetch is in progress
 * - error: error message string if the fetch fails, null otherwise
 */
export default function useSocialLinks() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLinks() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('social_links')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true });

        if (supabaseError) throw supabaseError;

        setLinks(data);
      } catch (err) {
        console.error('Failed to fetch social links:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLinks();
  }, []);

  return { links, loading, error };
}