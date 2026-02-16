import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useSiteContent - Fetches editable site content from Supabase
 * 
 * Returns: { content, loading, error }
 * - content: object keyed by content key, e.g. content.band_email
 * - loading: true while the fetch is in progress
 * - error: error message string if the fetch fails, null otherwise
 */
export default function useSiteContent() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('site_content')
          .select('key, value');

        if (supabaseError) throw supabaseError;

        const contentMap = {};
        data.forEach((item) => {
          contentMap[item.key] = item.value;
        });

        setContent(contentMap);
      } catch (err) {
        console.error('Failed to fetch site content:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, []);

  return { content, loading, error };
}