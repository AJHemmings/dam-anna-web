import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

async function callWithTokenRefresh(functionName, params = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = session
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: params,
    headers,
  });

  const is401 =
    error?.status === 401 ||
    error?.message?.includes('401') ||
    error?.context?.status === 401;

  if (error && is401) {
    const { error: refreshError } = await supabase.functions.invoke(
      'google-token-refresh',
      { body: {}, headers }
    );

    if (refreshError) {
      return {
        data: null,
        error: 'Your Google account connection has expired. Please reconnect.',
      };
    }

    const retry = await supabase.functions.invoke(functionName, {
      body: params,
      headers,
    });

    return { data: retry.data, error: retry.error?.message ?? null };
  }

  return { data, error: error?.message ?? null };
}

export function useYoutube() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replyStatus, setReplyStatus] = useState({}); // { [commentId]: 'sending' | 'success' | 'error' }

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await callWithTokenRefresh(
      'fetch-youtube-videos',
      {}
    );

    if (error) {
      setError(error);
    } else {
      setVideos(data?.videos ?? []);
    }

    setLoading(false);
  }, []);

  const fetchComments = useCallback(async (videoId) => {
    setCommentsLoading(true);
    setComments([]);

    const { data, error } = await callWithTokenRefresh(
      'fetch-youtube-comments',
      {
        videoId,
      }
    );

    if (error) {
      setError(error);
    } else {
      setComments(data?.comments ?? []);
    }

    setCommentsLoading(false);
  }, []);

  const openVideo = useCallback(
    (video) => {
      setSelectedVideo(video);
      fetchComments(video.id);
    },
    [fetchComments]
  );

  const closeVideo = useCallback(() => {
    setSelectedVideo(null);
    setComments([]);
  }, []);

  const postReply = useCallback(async (parentId, text) => {
    setReplyStatus((prev) => ({ ...prev, [parentId]: 'sending' }));

    const { error } = await callWithTokenRefresh('post-youtube-reply', {
      parentId,
      text,
    });

    if (error) {
      setReplyStatus((prev) => ({ ...prev, [parentId]: 'error' }));
      return { success: false };
    }

    setReplyStatus((prev) => ({ ...prev, [parentId]: 'success' }));
    return { success: true };
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return {
    videos,
    selectedVideo,
    comments,
    loading,
    commentsLoading,
    error,
    replyStatus,
    openVideo,
    closeVideo,
    postReply,
    refresh: fetchVideos,
  };
}
