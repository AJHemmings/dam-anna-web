import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useVideos - Fetches videos from Supabase
 * 
 * Extracts YouTube video IDs from URLs for embed and thumbnail use.
 * 
 * Returns: { videos, loading, error }
 * - videos: array of video objects with added videoId property
 * - loading: true while the fetch is in progress
 * - error: error message string if the fetch fails, null otherwise
 */
export default function useVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('videos')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true });

        if (supabaseError) throw supabaseError;

        const enriched = data.map((video) => ({
          ...video,
          videoId: extractYouTubeId(video.video_url),
        }));

        setVideos(enriched);
      } catch (err) {
        console.error('Failed to fetch videos:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  return { videos, loading, error };
}

/**
 * Extracts the YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}