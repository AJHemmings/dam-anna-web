import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * VideosPage -- Manage YouTube videos displayed on the public site.
 * 
 * Features:
 * - View all videos with thumbnails and titles
 * - Add new videos by pasting a YouTube URL (auto-extracts video ID and thumbnail)
 * - Edit video metadata (title, description, display order, visibility)
 * - Delete videos with confirmation
 * - Maximum 10 curated videos shown on public site (enforced by display)
 * 
 * YouTube URL formats supported:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 */

// CUSTOMIZATION: Card styling
const CARD_BG = 'bg-zinc-800';
const CARD_BORDER = 'border border-zinc-700';
const CARD_RADIUS = 'rounded-lg';

// CUSTOMIZATION: Button styling
const BTN_PRIMARY = 'bg-white text-zinc-900 hover:bg-zinc-200';
const BTN_DANGER = 'bg-red-600 text-white hover:bg-red-700';
const BTN_SECONDARY = 'bg-zinc-700 text-white hover:bg-zinc-600';
const BTN_DISABLED = 'disabled:opacity-50 disabled:cursor-not-allowed';

// CUSTOMIZATION: Input styling
const INPUT_STYLE = 'w-full px-3 py-2.5 bg-zinc-900 border border-zinc-600 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors';

// CUSTOMIZATION: Maximum curated videos on public site
const MAX_PUBLIC_VIDEOS = 10;

// CUSTOMIZATION: Thumbnail size in list view
const THUMBNAIL_WIDTH = 'w-40';
const THUMBNAIL_HEIGHT = 'h-24';

/**
 * Extract YouTube video ID from various URL formats.
 * Returns the video ID string or null if the URL is not recognised.
 */
function extractYouTubeId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Generate YouTube thumbnail URL from video ID.
 * Uses maxresdefault with fallback to hqdefault.
 */
function getThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [editingVideo, setEditingVideo] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // URL parsing feedback
  const [urlPreview, setUrlPreview] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  function getEmptyForm() {
    return {
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      display_order: 0,
      is_visible: true,
    };
  }

  async function fetchVideos() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('videos')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setVideos(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(video) {
    setEditingVideo(video.id);
    setShowAddForm(false);
    setFormData({
      title: video.title || '',
      description: video.description || '',
      video_url: video.video_url || '',
      thumbnail_url: video.thumbnail_url || '',
      display_order: video.display_order || 0,
      is_visible: video.is_visible ?? true,
    });
    setSaveMessage(null);

    // Show thumbnail preview for existing video
    const videoId = extractYouTubeId(video.video_url);
    if (videoId) {
      setUrlPreview({
        videoId,
        thumbnail: video.thumbnail_url || getThumbnailUrl(videoId),
      });
    } else {
      setUrlPreview(null);
    }
  }

  function handleAdd() {
    setEditingVideo(null);
    setShowAddForm(true);
    setFormData({
      ...getEmptyForm(),
      display_order: videos.length + 1,
    });
    setSaveMessage(null);
    setUrlPreview(null);
  }

  function handleCancel() {
    setEditingVideo(null);
    setShowAddForm(false);
    setFormData(getEmptyForm());
    setSaveMessage(null);
    setUrlPreview(null);
  }

  function handleFormChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  /**
   * Handle YouTube URL input. Extracts video ID and auto-generates
   * the thumbnail URL when a valid YouTube link is pasted.
   */
  function handleUrlChange(url) {
    handleFormChange('video_url', url);

    const videoId = extractYouTubeId(url);

    if (videoId) {
      const thumbnail = getThumbnailUrl(videoId);
      setUrlPreview({ videoId, thumbnail });
      // Auto-fill thumbnail URL
      handleFormChange('thumbnail_url', thumbnail);
    } else {
      setUrlPreview(null);
      handleFormChange('thumbnail_url', '');
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        video_url: formData.video_url,
        thumbnail_url: formData.thumbnail_url,
        display_order: formData.display_order,
        is_visible: formData.is_visible,
        platform: 'youtube',
      };

      if (editingVideo) {
        const { error: updateError } = await supabase
          .from('videos')
          .update(payload)
          .eq('id', editingVideo);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('videos')
          .insert(payload);

        if (insertError) throw insertError;
      }

      setSaveMessage({ type: 'success', text: editingVideo ? 'Video updated.' : 'Video added.' });
      await fetchVideos();

      setTimeout(() => {
        handleCancel();
      }, 1500);
    } catch (err) {
      console.error('Error saving video:', err);
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(video) {
    setDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id);

      if (deleteError) throw deleteError;

      setDeleteConfirm(null);
      await fetchVideos();
    } catch (err) {
      console.error('Error deleting video:', err);
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleVisibility(video) {
    try {
      const { error: updateError } = await supabase
        .from('videos')
        .update({ is_visible: !video.is_visible })
        .eq('id', video.id);

      if (updateError) throw updateError;

      await fetchVideos();
    } catch (err) {
      console.error('Error toggling video visibility:', err);
    }
  }

  function isFormValid() {
    return (
      formData.title.trim() !== '' &&
      formData.video_url.trim() !== '' &&
      extractYouTubeId(formData.video_url) !== null
    );
  }

  const visibleCount = videos.filter((v) => v.is_visible).length;

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Videos</h1>
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          Loading videos...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Videos</h1>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          Failed to load videos: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Videos</h1>
          <p className="text-zinc-400 text-sm">
            Manage YouTube videos shown on your site.
            {' '}
            <span className={visibleCount >= MAX_PUBLIC_VIDEOS ? 'text-amber-400' : ''}>
             Max display: {visibleCount}/{MAX_PUBLIC_VIDEOS} visible on public site. 
             Consider hiding some existing videos if you want to add more.
            </span>
          </p>
        </div>
        {!showAddForm && !editingVideo && (
          <button
            onClick={handleAdd}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_PRIMARY}`}
          >
            Add new video
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {(showAddForm || editingVideo) && (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 mb-6`}>
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingVideo ? 'Edit Video' : 'Add New Video'}
          </h2>

          <div className="space-y-4">
            {/* YouTube URL with live preview */}
            <div>
              <label htmlFor="video_url" className="block text-sm font-medium text-zinc-300 mb-1.5">
                YouTube URL
              </label>
              <input
                id="video_url"
                type="url"
                value={formData.video_url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className={INPUT_STYLE}
              />
              {formData.video_url && !urlPreview && (
                <p className="mt-1 text-xs text-red-400">
                  Could not extract a YouTube video ID from this URL.
                </p>
              )}
            </div>

            {/* Thumbnail preview */}
            {urlPreview && (
              <div className="flex items-start gap-4">
                <div className={`${THUMBNAIL_WIDTH} ${THUMBNAIL_HEIGHT} flex-shrink-0 rounded overflow-hidden bg-zinc-700`}>
                  <img
                    src={urlPreview.thumbnail}
                    alt="Video thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-sm text-zinc-400">
                  <p>Video ID: <span className="text-zinc-300 font-mono">{urlPreview.videoId}</span></p>
                  <p className="mt-1">Thumbnail auto-generated from YouTube.</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Video title"
                className={INPUT_STYLE}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Short description (optional)"
                rows={3}
                className={`${INPUT_STYLE} resize-y`}
              />
            </div>

            {/* Display Order and Visibility -- stack on mobile, 2 cols on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="display_order" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Display Order
                </label>
                <input
                  id="display_order"
                  type="number"
                  min="0"
                  value={formData.display_order}
                  onChange={(e) => handleFormChange('display_order', parseInt(e.target.value, 10) || 0)}
                  className={INPUT_STYLE}
                />
                <p className="mt-1 text-xs text-zinc-500">Lower numbers appear first.</p>
              </div>

              {/* pt-7 only applies on md+ where label sits beside the input */}
              <div className="flex items-center md:pt-7">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => handleFormChange('is_visible', e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-900 border-zinc-600 text-white focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-300">Visible on public site</span>
                </label>
              </div>
            </div>

            {/* Visible count warning */}
            {!editingVideo && formData.is_visible && visibleCount >= MAX_PUBLIC_VIDEOS && (
              <div className="p-3 bg-amber-900/30 border border-amber-700 rounded text-amber-300 text-sm">
                You already have {visibleCount} visible videos. The public site displays a maximum of {MAX_PUBLIC_VIDEOS}.
                Consider hiding an existing video or unchecking "Visible on public site" above.
              </div>
            )}

            {/* Save/Cancel buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !isFormValid()}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_PRIMARY} ${BTN_DISABLED}`}
              >
                {saving ? 'Saving...' : editingVideo ? 'Update video' : 'Add video'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_SECONDARY} ${BTN_DISABLED}`}
              >
                Cancel
              </button>

              {saveMessage && (
                <span className={`text-sm ${saveMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {saveMessage.text}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Videos list */}
      {videos.length === 0 ? (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 text-center`}>
          <p className="text-zinc-400">No videos yet. Click "Add new video" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => {
            const videoId = extractYouTubeId(video.video_url);
            const thumbnail = video.thumbnail_url || (videoId ? getThumbnailUrl(videoId) : null);

            return (
              <div
                key={video.id}
                className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-4`}
              >
                {/* Top row: thumbnail + details */}
                <div className="flex items-start gap-4">
                  {/* Thumbnail -- smaller on mobile to give text room */}
                  <div className="w-24 h-14 md:w-40 md:h-24 flex-shrink-0 rounded overflow-hidden bg-zinc-700">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={`${video.title} thumbnail`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  {/* Video details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-medium truncate">{video.title}</h3>
                      {!video.is_visible && (
                        <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-0.5 rounded flex-shrink-0">
                          Hidden
                        </span>
                      )}
                    </div>
                    {video.description && (
                      <p className="text-zinc-400 text-sm truncate mt-0.5">{video.description}</p>
                    )}
                    <p className="text-zinc-500 text-xs mt-1 truncate">{video.video_url}</p>
                    {/* Order badge inline on mobile */}
                    <p className="md:hidden text-xs text-zinc-600 mt-1">Order: {video.display_order}</p>
                  </div>

                  {/* Order badge -- desktop only */}
                  <span className="hidden md:block text-xs text-zinc-500 flex-shrink-0">
                    Order: {video.display_order}
                  </span>
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-700">
                  <button
                    onClick={() => handleToggleVisibility(video)}
                    className={`p-2 rounded transition-colors ${BTN_SECONDARY}`}
                    title={video.is_visible ? 'Hide from public site' : 'Show on public site'}
                    aria-label={video.is_visible ? 'Hide video' : 'Show video'}
                  >
                    {video.is_visible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-500">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(video)}
                    className={`px-3 py-2 text-sm rounded transition-colors ${BTN_SECONDARY}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(video)}
                    className={`px-3 py-2 text-sm rounded transition-colors ${BTN_DANGER}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 max-w-sm w-full mx-4`}>
            <h3 className="text-lg font-semibold text-white mb-2">Delete video?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Are you sure you want to delete <strong className="text-white">{deleteConfirm.title}</strong>? This will remove it from the public site immediately.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_DANGER} ${BTN_DISABLED}`}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_SECONDARY} ${BTN_DISABLED}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}