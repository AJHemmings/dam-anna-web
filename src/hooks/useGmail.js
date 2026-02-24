// src/hooks/useGmail.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// ─── Token Refresh Utility ────────────────────────────────────────────────────
// Calls an Edge Function. If a 401 is returned (token expired), refreshes the
// Google access token and retries the call once. If the retry also fails,
// returns an error prompting the admin to reconnect their Google account.

async function callWithTokenRefresh(functionName, params = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: params,
    headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
  });

  const is401 =
    error?.status === 401 ||
    error?.message?.includes('401') ||
    error?.context?.status === 401;

  if (error && is401) {
    const { error: refreshError } = await supabase.functions.invoke(
      'google-token-refresh',
      {
        body: {},
        headers: session
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      }
    );

    if (refreshError) {
      return {
        data: null,
        error: 'Your Google account connection has expired. Please reconnect.',
      };
    }

    const retry = await supabase.functions.invoke(functionName, {
      body: params,
      headers: session
        ? { Authorization: `Bearer ${session.access_token}` }
        : {},
    });

    return { data: retry.data, error: retry.error?.message ?? null };
  }

  return { data, error: error?.message ?? null };
}

// ─── useGmail Hook ────────────────────────────────────────────────────────────

export function useGmail() {
  const [inbox, setInbox] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState(null);

  // Fetch the first page of inbox threads on mount
  useEffect(() => {
    fetchInbox();
  }, []);

  // Fetch inbox from the first page (or a specific page via pageToken)
  const fetchInbox = useCallback(async (pageToken = null, append = false) => {
    setLoading(true);
    setError(null);

    const { data, error } = await callWithTokenRefresh('fetch-gmail-inbox', {
      pageToken,
    });

    if (error) {
      setError(error);
    } else {
      setInbox((prev) =>
        append ? [...prev, ...(data.threads ?? [])] : (data.threads ?? [])
      );
      setNextPageToken(data.nextPageToken ?? null);
    }

    setLoading(false);
  }, []);

  // Fetch a single thread by ID and set it as the selected thread
  const selectThread = useCallback(async (threadId) => {
    setSelectedThreadId(threadId);
    setLoading(true);
    setError(null);

    const { data, error } = await callWithTokenRefresh('fetch-gmail-thread', {
      threadId,
    });

    if (error) {
      setError(error);
    } else {
      setSelectedThread(data ?? null);
    }

    setLoading(false);
  }, []);

  // Send a reply to an existing thread
  const sendReply = useCallback(async (threadId, to, subject, message) => {
    setLoading(true);
    setError(null);

    const { data, error } = await callWithTokenRefresh('send-gmail-reply', {
      threadId,
      to,
      subject,
      message,
    });

    setLoading(false);

    if (error) {
      setError(error);
      return { success: false, error };
    }

    return { success: true, data };
  }, []);

  // Load the next page of inbox threads and append to the existing list
  const loadMore = useCallback(() => {
    if (nextPageToken) {
      fetchInbox(nextPageToken, true);
    }
  }, [nextPageToken, fetchInbox]);

  // Re-fetch the inbox from the first page
  const refresh = useCallback(() => {
    setSelectedThread(null);
    fetchInbox();
  }, [fetchInbox]);

  return {
    inbox,
    selectedThread,
    selectedThreadId,
    loading,
    error,
    nextPageToken,
    selectThread,
    sendReply,
    loadMore,
    refresh,
  };
}
