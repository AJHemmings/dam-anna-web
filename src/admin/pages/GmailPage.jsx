// src/admin/pages/GmailPage.jsx
import { useState } from 'react';
import { useGmail } from '../../hooks/useGmail';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_REPLY_LENGTH = 10000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Decodes a base64url encoded string to plain text
function decodeBase64Url(encoded) {
  if (!encoded) return '';
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return '';
  }
}

// Extracts plain text or sanitised HTML from a Gmail message payload
function extractMessageBody(payload) {
  if (!payload) return '';

  const findPart = (parts, mimeType) =>
    parts?.find((p) => p.mimeType === mimeType);

  if (payload.mimeType === 'text/plain') {
    return decodeBase64Url(payload.body?.data);
  }

  if (payload.mimeType === 'text/html') {
    const raw = decodeBase64Url(payload.body?.data);
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    return doc.body.innerText ?? '';
  }

  if (payload.parts) {
    const plain = findPart(payload.parts, 'text/plain');
    if (plain) return decodeBase64Url(plain.body?.data);

    const html = findPart(payload.parts, 'text/html');
    if (html) {
      const raw = decodeBase64Url(html.body?.data);
      const doc = new DOMParser().parseFromString(raw, 'text/html');
      return doc.body.innerText ?? '';
    }
  }

  return decodeBase64Url(payload.body?.data);
}

// Extracts a header value from a Gmail message headers array
function getHeader(headers = [], name) {
  return (
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ??
    ''
  );
}

// Formats an epoch millisecond timestamp to a readable string
function formatDate(internalDate) {
  if (!internalDate) return '';
  return new Date(Number(internalDate)).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ThreadListItem({ thread, isSelected, onSelect }) {
  const firstMessage = thread.messages?.[0];
  const headers = firstMessage?.payload?.headers ?? [];
  const from = getHeader(headers, 'from') || '(unknown)';
  const snippet = thread.snippet
    ? thread.snippet
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
    : '';
  const date = formatDate(firstMessage?.internalDate);

  return (
    <button
      onClick={() => onSelect(thread.id)}
      className={`w-full text-left px-4 py-3 border-b border-white/10 hover:bg-white/5 transition-colors ${
        isSelected ? 'bg-white/10' : ''
      }`}
    >
      <p className="text-sm font-medium text-white truncate">{from}</p>
      <p className="text-sm text-white/70 truncate">{snippet}</p>
      <p className="text-xs text-white/40 mt-1">{date}</p>
    </button>
  );
}

function ThreadView({ thread, selectedThreadId, onBack, isMobile }) {
  const { sendReply, loading } = useGmail();
  const [replyText, setReplyText] = useState('');
  const [sendStatus, setSendStatus] = useState(null); // 'success' | 'error' | null

  if (!thread) {
    return (
      <div className="flex items-center justify-center h-full text-white/40 text-sm">
        {selectedThreadId ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p>Loading...</p>
          </div>
        ) : (
          <p>Select a thread to read</p>
        )}
      </div>
    );
  }

  const firstMessage = thread.messages?.[0];
  const headers = firstMessage?.payload?.headers ?? [];
  const subject = getHeader(headers, 'subject') || '(no subject)';
  const replyTo = getHeader(headers, 'from');

  async function handleSend() {
    if (!replyText.trim()) return;
    setSendStatus(null);

    const result = await sendReply(
      thread.id,
      replyTo,
      `Re: ${subject}`,
      replyText
    );

    if (result.success) {
      setSendStatus('success');
      setReplyText('');
    } else {
      setSendStatus('error');
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        {isMobile && (
          <button
            onClick={onBack}
            className="text-white/60 hover:text-white text-sm mr-1"
          >
            Back
          </button>
        )}
        <h2 className="text-white font-medium truncate">{subject}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {thread.messages?.map((message) => {
          const msgHeaders = message.payload?.headers ?? [];
          const from = getHeader(msgHeaders, 'from');
          const date = formatDate(message.internalDate);
          const body = extractMessageBody(message.payload);

          return (
            <div
              key={message.id}
              className="border border-white/10 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-white">{from}</p>
                <p className="text-xs text-white/40 ml-4 shrink-0">{date}</p>
              </div>
              <p className="text-sm text-white/80 whitespace-pre-wrap break-words overflow-x-hidden">
                {body}
              </p>
            </div>
          );
        })}
      </div>

      {/* Reply composer */}
      <div className="border-t border-white/10 px-4 py-3">
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          maxLength={MAX_REPLY_LENGTH}
          rows={4}
          placeholder="Write a reply..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/30"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-white/40">
            {replyText.length} / {MAX_REPLY_LENGTH.toLocaleString()}
          </p>
          <button
            onClick={handleSend}
            disabled={loading || !replyText.trim()}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-white/90 transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {sendStatus === 'success' && (
          <p className="text-sm text-green-400 mt-2">Reply sent.</p>
        )}
        {sendStatus === 'error' && (
          <p className="text-sm text-red-400 mt-2">
            Failed to send. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GmailPage({ isMobile }) {
  const {
    inbox,
    selectedThread,
    selectedThreadId,
    loading,
    error,
    nextPageToken,
    selectThread,
    loadMore,
    refresh,
  } = useGmail();

  const [mobileView, setMobileView] = useState('list'); // 'list' | 'thread'

  function handleSelectThread(threadId) {
    selectThread(threadId);
    if (isMobile) setMobileView('thread');
  }

  function handleBack() {
    setMobileView('list');
  }

  if (error) {
    const isExpired = error.toLowerCase().includes('expired') || error.toLowerCase().includes('reconnect');
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
        <p className="text-red-400 text-sm">{error}</p>
        {isExpired ? (
          <a
            href={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth-init`}
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
          >
            Reconnect Google Account
          </a>
        ) : (
          <button
            onClick={refresh}
            className="text-sm text-white/60 hover:text-white underline"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  // ── Mobile layout ──
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col overflow-hidden relative">
        {/* Inbox list -- always rendered, slides left when thread is open */}
        <div
          className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
            mobileView === 'thread' ? '-translate-x-full' : 'translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h1 className="text-white font-semibold">Inbox</h1>
            <button
              onClick={refresh}
              className="text-xs text-white/50 hover:text-white"
            >
              Refresh
            </button>
          </div>
          {loading && inbox.length === 0 ? (
            <p className="text-white/40 text-sm text-center mt-8">Loading...</p>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {inbox.map((thread) => (
                <ThreadListItem
                  key={thread.id}
                  thread={thread}
                  isSelected={selectedThreadId === thread.id}
                  onSelect={handleSelectThread}
                />
              ))}
              {nextPageToken && (
                <button
                  onClick={loadMore}
                  className="w-full py-3 text-sm text-white/50 hover:text-white"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </div>

        {/* Thread view -- slides in from the right */}
        <div
          className={`absolute inset-0 flex flex-col transition-transform duration-300 ease-in-out ${
            mobileView === 'thread' ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <ThreadView
            thread={selectedThread}
            selectThreadId={selectedThreadId}
            onBack={handleBack}
            isMobile={isMobile}
          />
        </div>
      </div>
    );
  }
  // ── Desktop layout ──
  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Left panel: thread list */}
      <div className="w-80 shrink-0 border-r border-white/10 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h1 className="text-white font-semibold">Inbox</h1>
          <button
            onClick={refresh}
            className="text-xs text-white/50 hover:text-white"
          >
            Refresh
          </button>
        </div>
        {loading && inbox.length === 0 ? (
          <p className="text-white/40 text-sm text-center mt-8">Loading...</p>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {inbox.map((thread) => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                isSelected={selectedThread?.id === thread.id}
                onSelect={handleSelectThread}
              />
            ))}
            {nextPageToken && (
              <button
                onClick={loadMore}
                className="w-full py-3 text-sm text-white/50 hover:text-white"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right panel: thread view */}
      <div className="flex-1 overflow-hidden">
        <ThreadView thread={selectedThread} isMobile={false} />
      </div>
    </div>
  );
}
