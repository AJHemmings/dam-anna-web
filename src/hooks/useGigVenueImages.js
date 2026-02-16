import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useGigVenueImages - Fetches venue images from upcoming gigs
 * 
 * Only returns gigs that have an image_url set.
 * 
 * Returns: { images, loading, error }
 * - images: array of { url, alt } objects for the slideshow
 * - loading: true while the fetch is in progress
 * - error: error message string if the fetch fails, null otherwise
 */
export default function useGigVenueImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error: supabaseError } = await supabase
          .from('gigs')
          .select('image_url, venue, location')
          .gte('date', today)
          .eq('is_visible', true)
          .not('image_url', 'is', null)
          .order('date', { ascending: true });

        if (supabaseError) throw supabaseError;

        const formatted = data.map((gig) => ({
          url: gig.image_url,
          alt: `${gig.venue}, ${gig.location}`,
        }));

        setImages(formatted);
      } catch (err) {
        console.error('Failed to fetch gig venue images:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  return { images, loading, error };
}