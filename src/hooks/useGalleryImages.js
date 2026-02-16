import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useGalleryImages - Fetches gallery images from Supabase
 * 
 * Returns: { images, loading, error }
 * - images: array of gallery image objects, ordered by display_order
 * - loading: true while the fetch is in progress
 * - error: error message string if the fetch fails, null otherwise
 */
export default function useGalleryImages() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true });

        if (supabaseError) throw supabaseError;

        setImages(data);
      } catch (err) {
        console.error('Failed to fetch gallery images:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  return { images, loading, error };
}