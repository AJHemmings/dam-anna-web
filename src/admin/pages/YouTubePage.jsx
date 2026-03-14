import { useState } from 'react';
import { useYoutube } from '../../hooks/useYoutube';

function formatCount(count) {
  if (!count) return '0';
  const n = parseInt(count);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Comment Item ─────────────────────────────────────────────────────────────

function CommentItem({ comment, onReply, replyStatus }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const snippet = comment.snippet?.topLevelComment?.snippet;
  const commentId = comment.id;
  const status = replyStatus[commentId];

  async function handleSend() {
    if (!replyText.trim()) return;
    const result = await onReply(commentId, replyText);
    if (result.success) {
      setReplyText('');
      setShowReply(false);
    }
  }

  return (
    <div className="border-b border-white/10 py-3">
      <div className="flex items-start gap-3">
        {snippet?.authorProfileImageUrl && (
          <img
            src={snippet.authorProfileImageUrl}
            alt={snippet.authorDisplayName}
            className="w-8 h-8 rounded-full shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-white/80">
              {snippet?.authorDisplayName}
            </p>
            <p className="text-xs text-white/40">
              {formatDate(snippet?.publishedAt)}
            </p>
          </div>
          <p className="text-sm text-white/70 whitespace-pre-wrap break-words">
            {snippet?.textDisplay}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-white/40">
              👍 {snippet?.likeCount ?? 0}
            </span>
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Reply
            </button>
          </div>

          {showReply && (
            <div className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                placeholder="Write a reply..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/30"
              />
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handleSend}
                  disabled={status === 'sending' || !replyText.trim()}
                  className="px-3 py-1.5 bg-white text-black text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-white/90 transition-colors"
                >
                  {status === 'sending' ? 'Sending...' : 'Send'}
                </button>
                <button
                  onClick={() => setShowReply(false)}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Cancel
                </button>
                {status === 'error' && (
                  <p className="text-xs text-red-400">Failed to send.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Video Modal ──────────────────────────────────────────────────────────────

function VideoModal({
  video,
  comments,
  commentsLoading,
  onClose,
  onReply,
  replyStatus,
}) {
  const [showComments, setShowComments] = useState(false);
  const stats = video.statistics;
  const snippet = video.snippet;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-white/10 rounded-xl w-full max-w-2xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-medium text-sm pr-4 leading-snug">
            {snippet?.title}
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white text-xl leading-none shrink-0"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Embedded player */}
          <div className="aspect-video w-full rounded-lg overflow-hidden mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${video.id}`}
              title={snippet?.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-white font-semibold text-sm">
                {formatCount(stats?.viewCount)}
              </p>
              <p className="text-white/40 text-xs">Views</p>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">
                {formatCount(stats?.likeCount)}
              </p>
              <p className="text-white/40 text-xs">Likes</p>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">
                {formatCount(stats?.commentCount)}
              </p>
              <p className="text-white/40 text-xs">Comments</p>
            </div>
          </div>

          {/* Comments toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="w-full py-2 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white hover:border-white/30 transition-colors mb-3"
          >
            {showComments
              ? 'Hide Comments'
              : `Show Comments (${formatCount(stats?.commentCount)})`}
          </button>

          {showComments && (
            <div className="h-64 overflow-y-auto border border-white/10 rounded-lg px-3">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8 gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="text-white/40 text-sm">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">
                  No comments yet.
                </p>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    onReply={onReply}
                    replyStatus={replyStatus}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({ video, onOpen }) {
  const snippet = video.snippet;
  const stats = video.statistics;
  const thumbnail = snippet?.thumbnails?.medium?.url;

  return (
    <button
      onClick={() => onOpen(video)}
      className="w-full text-left flex gap-4 p-4 border-b border-white/10 hover:bg-white/5 transition-colors"
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt={snippet?.title}
          className="w-40 h-24 object-cover rounded-lg shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white leading-snug mb-1 line-clamp-2">
          {snippet?.title}
        </p>
        <p className="text-xs text-white/40 mb-3">
          {formatDate(snippet?.publishedAt)}
        </p>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/50">
            👁 {formatCount(stats?.viewCount)}
          </span>
          <span className="text-xs text-white/50">
            👍 {formatCount(stats?.likeCount)}
          </span>
          <span className="text-xs text-white/50">
            💬 {formatCount(stats?.commentCount)}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function YouTubePage() {
  const {
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
    refresh,
  } = useYoutube();

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

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-zinc-900 z-10">
        <h1 className="text-white font-semibold">YouTube</h1>
        <button
          onClick={refresh}
          className="text-xs text-white/50 hover:text-white"
        >
          Refresh
        </button>
      </div>

      {/* Video list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading videos...</p>
        </div>
      ) : videos.length === 0 ? (
        <p className="text-white/40 text-sm text-center py-16">
          No videos found.
        </p>
      ) : (
        videos.map((video) => (
          <VideoCard key={video.id} video={video} onOpen={openVideo} />
        ))
      )}

      {/* Modal */}
      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          comments={comments}
          commentsLoading={commentsLoading}
          onClose={closeVideo}
          onReply={postReply}
          replyStatus={replyStatus}
        />
      )}
    </div>
  );
}
