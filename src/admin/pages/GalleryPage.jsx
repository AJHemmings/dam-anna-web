import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * GalleryPage -- Manage gallery images with upload, compression, and bulk operations.
 * 
 * Features:
 * - View all gallery images (mixed: ImageShack URLs and Supabase Storage)
 * - Upload new images to Supabase Storage with client-side compression (WebP)
 * - Edit metadata (alt text, date, location, display_order, visibility)
 * - Delete images with confirmation (removes from Storage if Supabase-hosted)
 * - Toggle visibility with eye icon
 * - Bulk select for bulk delete and bulk metadata editing
 * - Drag-and-drop upload zone
 * 
 * Image compression uses Canvas API to resize and convert to WebP before upload.
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

// CUSTOMIZATION: Image compression settings -- adjust these to experiment
const MAX_IMAGE_WIDTH = 1920;
const WEBP_QUALITY = 0.8;

// CUSTOMIZATION: Accepted upload file types
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 20;

// CUSTOMIZATION: Gallery grid
const GRID_COLS = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
const THUMBNAIL_ASPECT = 'aspect-square';

/**
 * Compress and convert an image file to WebP using Canvas API.
 * Resizes to MAX_IMAGE_WIDTH if wider, maintains aspect ratio.
 * Returns a { blob, width, height } object.
 */
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Resize if wider than max
      if (width > MAX_IMAGE_WIDTH) {
        const ratio = MAX_IMAGE_WIDTH / width;
        width = MAX_IMAGE_WIDTH;
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width, height });
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        'image/webp',
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Generate a unique filename for Supabase Storage.
 * Format: gallery/TIMESTAMP-RANDOM.webp
 */
function generateStoragePath() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `gallery/${timestamp}-${random}.webp`;
}

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Edit state
  const [editingImage, setEditingImage] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkMetadata, setShowBulkMetadata] = useState(false);
  const [bulkMetadata, setBulkMetadata] = useState({ date: '', location: '' });
  const [bulkMetadataSaving, setBulkMetadataSaving] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setImages(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching gallery images:', err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Upload handling ───

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Reset input so the same file can be selected again
    e.target.value = '';
  }

  async function handleFiles(files) {
    // Filter valid image files
    const validFiles = files.filter((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        console.warn(`Skipped ${file.name}: unsupported type ${file.type}`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        console.warn(`Skipped ${file.name}: exceeds ${MAX_FILE_SIZE_MB}MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);

    // Initialise progress tracking
    const progressEntries = validFiles.map((file) => ({
      name: file.name,
      status: 'compressing',
      originalSize: file.size,
      compressedSize: null,
    }));
    setUploadProgress(progressEntries);

    const currentDisplayOrder = images.length;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];

      try {
        // Compress
        setUploadProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: 'compressing' } : p))
        );

        const { blob, width, height } = await compressImage(file);

        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'uploading', compressedSize: blob.size } : p
          )
        );

        // Upload to Supabase Storage
        const storagePath = generateStoragePath();

        const { error: uploadError } = await supabase
          .storage
          .from('gallery')
          .upload(storagePath, blob, {
            contentType: 'image/webp',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase
          .storage
          .from('gallery')
          .getPublicUrl(storagePath);

        // Insert database record
        const { error: insertError } = await supabase
          .from('gallery_images')
          .insert({
            url: publicUrl,
            alt: file.name.replace(/\.[^/.]+$/, ''),
            date: '',
            location: '',
            display_order: currentDisplayOrder + i + 1,
            is_visible: true,
            storage_path: storagePath,
          });

        if (insertError) throw insertError;

        setUploadProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, status: 'done' } : p))
        );
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        setUploadProgress((prev) =>
          prev.map((p, idx) =>
            idx === i ? { ...p, status: 'error', error: err.message } : p
          )
        );
      }
    }

    await fetchImages();

    // Clear progress after a delay
    setTimeout(() => {
      setUploadProgress([]);
      setUploading(false);
    }, 3000);
  }

  // ─── Edit handling ───

  function handleEdit(image) {
    setEditingImage(image.id);
    setEditFormData({
      alt: image.alt || '',
      date: image.date || '',
      location: image.location || '',
      display_order: image.display_order || 0,
      is_visible: image.is_visible ?? true,
    });
    setEditMessage(null);
  }

  function handleEditCancel() {
    setEditingImage(null);
    setEditFormData({});
    setEditMessage(null);
  }

  function handleEditChange(field, value) {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleEditSave() {
    setEditSaving(true);
    setEditMessage(null);

    try {
      const { error: updateError } = await supabase
        .from('gallery_images')
        .update({
          alt: editFormData.alt,
          date: editFormData.date,
          location: editFormData.location,
          display_order: editFormData.display_order,
          is_visible: editFormData.is_visible,
        })
        .eq('id', editingImage);

      if (updateError) throw updateError;

      setEditMessage({ type: 'success', text: 'Image updated.' });
      await fetchImages();

      setTimeout(() => {
        handleEditCancel();
      }, 1500);
    } catch (err) {
      console.error('Error updating image:', err);
      setEditMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setEditSaving(false);
    }
  }

  // ─── Delete handling ───

  async function handleDelete(image) {
    setDeleting(true);

    try {
      // If image is stored in Supabase Storage, delete the file too
      if (image.storage_path) {
        const { error: storageError } = await supabase
          .storage
          .from('gallery')
          .remove([image.storage_path]);

        if (storageError) {
          console.error('Storage delete error (continuing with DB delete):', storageError);
        }
      }

      const { error: deleteError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', image.id);

      if (deleteError) throw deleteError;

      setDeleteConfirm(null);
      await fetchImages();
    } catch (err) {
      console.error('Error deleting image:', err);
    } finally {
      setDeleting(false);
    }
  }

  // ─── Visibility toggle ───

  async function handleToggleVisibility(image) {
    try {
      const { error: updateError } = await supabase
        .from('gallery_images')
        .update({ is_visible: !image.is_visible })
        .eq('id', image.id);

      if (updateError) throw updateError;

      await fetchImages();
    } catch (err) {
      console.error('Error toggling image visibility:', err);
    }
  }

  // ─── Bulk operations ───

  function toggleBulkMode() {
    if (bulkMode) {
      // Exiting bulk mode -- clear selections
      setSelectedIds(new Set());
      setShowBulkDelete(false);
      setShowBulkMetadata(false);
    }
    setBulkMode(!bulkMode);
  }

  function toggleSelection(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(images.map((img) => img.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);

    try {
      const selectedImages = images.filter((img) => selectedIds.has(img.id));

      // Delete storage files for Supabase-hosted images
      const storagePaths = selectedImages
        .filter((img) => img.storage_path)
        .map((img) => img.storage_path);

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase
          .storage
          .from('gallery')
          .remove(storagePaths);

        if (storageError) {
          console.error('Bulk storage delete error (continuing with DB delete):', storageError);
        }
      }

      // Delete database records
      const ids = Array.from(selectedIds);
      const { error: deleteError } = await supabase
        .from('gallery_images')
        .delete()
        .in('id', ids);

      if (deleteError) throw deleteError;

      setShowBulkDelete(false);
      setSelectedIds(new Set());
      setBulkMode(false);
      await fetchImages();
    } catch (err) {
      console.error('Bulk delete error:', err);
    } finally {
      setBulkDeleting(false);
    }
  }

  async function handleBulkMetadataSave() {
    setBulkMetadataSaving(true);

    try {
      const updatePayload = {};
      if (bulkMetadata.date.trim() !== '') {
        updatePayload.date = bulkMetadata.date;
      }
      if (bulkMetadata.location.trim() !== '') {
        updatePayload.location = bulkMetadata.location;
      }

      if (Object.keys(updatePayload).length === 0) return;

      const ids = Array.from(selectedIds);
      const { error: updateError } = await supabase
        .from('gallery_images')
        .update(updatePayload)
        .in('id', ids);

      if (updateError) throw updateError;

      setShowBulkMetadata(false);
      setBulkMetadata({ date: '', location: '' });
      setSelectedIds(new Set());
      setBulkMode(false);
      await fetchImages();
    } catch (err) {
      console.error('Bulk metadata update error:', err);
    } finally {
      setBulkMetadataSaving(false);
    }
  }

  // ─── Helpers ───

  function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Gallery</h1>
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          Loading gallery...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Gallery</h1>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          Failed to load gallery: {error}
        </div>
      </div>
    );
  }

  const selectedCount = selectedIds.size;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Gallery</h1>
          <p className="text-zinc-400 text-sm">
            {images.length} images. Compression: {MAX_IMAGE_WIDTH}px max width, WebP quality {WEBP_QUALITY}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBulkMode}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
              bulkMode ? BTN_PRIMARY : BTN_SECONDARY
            }`}
          >
            {bulkMode ? 'Exit bulk mode' : 'Bulk select'}
          </button>
        </div>
      </div>

      {/* Bulk mode toolbar */}
      {bulkMode && (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-4 mb-6 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <span className="text-white text-sm font-medium">
              {selectedCount} selected
            </span>
            <button
              onClick={selectAll}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Select all
            </button>
            <button
              onClick={deselectAll}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Deselect all
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowBulkMetadata(true); setShowBulkDelete(false); }}
              disabled={selectedCount === 0}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${BTN_SECONDARY} ${BTN_DISABLED}`}
            >
              Edit metadata
            </button>
            <button
              onClick={() => { setShowBulkDelete(true); setShowBulkMetadata(false); }}
              disabled={selectedCount === 0}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${BTN_DANGER} ${BTN_DISABLED}`}
            >
              Delete selected
            </button>
          </div>
        </div>
      )}

      {/* Bulk metadata form */}
      {showBulkMetadata && (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 mb-6`}>
          <h2 className="text-lg font-semibold text-white mb-2">
            Edit Metadata for {selectedCount} Images
          </h2>
          <p className="text-zinc-400 text-sm mb-4">
            Only fill in the fields you want to update. Blank fields will be left unchanged.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="bulk-date" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Date
              </label>
              <input
                id="bulk-date"
                type="date"
                value={bulkMetadata.date}
                onChange={(e) => setBulkMetadata((prev) => ({ ...prev, date: e.target.value }))}
                placeholder="e.g. 27-02-26"
                className={INPUT_STYLE}
              />
            </div>

            <div>
              <label htmlFor="bulk-location" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Location
              </label>
              <input
                id="bulk-location"
                type="text"
                value={bulkMetadata.location}
                onChange={(e) => setBulkMetadata((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. London"
                className={INPUT_STYLE}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkMetadataSave}
              disabled={bulkMetadataSaving || (bulkMetadata.date.trim() === '' && bulkMetadata.location.trim() === '')}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_PRIMARY} ${BTN_DISABLED}`}
            >
              {bulkMetadataSaving ? 'Updating...' : `Update ${selectedCount} images`}
            </button>
            <button
              onClick={() => setShowBulkMetadata(false)}
              disabled={bulkMetadataSaving}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_SECONDARY} ${BTN_DISABLED}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`${CARD_BORDER} ${CARD_RADIUS} p-8 mb-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-white bg-zinc-700/50 border-dashed'
            : `${CARD_BG} border-dashed hover:border-zinc-500`
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="text-zinc-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto mb-3 text-zinc-500">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-sm">
            {isDragging
              ? 'Drop images here...'
              : 'Drag and drop images here, or click to browse'
            }
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            JPEG, PNG, WebP, GIF. Max {MAX_FILE_SIZE_MB}MB per file. Auto-compressed to WebP.
          </p>
        </div>
      </div>

      {/* Upload progress */}
      {uploadProgress.length > 0 && (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-4 mb-6 space-y-2`}>
          {uploadProgress.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm">
              {item.status === 'compressing' && (
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              {item.status === 'uploading' && (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              {item.status === 'done' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-green-400 flex-shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {item.status === 'error' && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-400 flex-shrink-0">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}

              <span className="text-zinc-300 truncate flex-1">{item.name}</span>

              <span className="text-zinc-500 flex-shrink-0">
                {item.status === 'compressing' && 'Compressing...'}
                {item.status === 'uploading' && `Uploading (${formatFileSize(item.compressedSize)})`}
                {item.status === 'done' && (
                  <>
                    {formatFileSize(item.originalSize)} → {formatFileSize(item.compressedSize)}
                  </>
                )}
                {item.status === 'error' && (
                  <span className="text-red-400">{item.error || 'Failed'}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Image grid */}
      {images.length === 0 ? (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 text-center`}>
          <p className="text-zinc-400">No images in the gallery. Upload some above.</p>
        </div>
      ) : (
        <div className={`grid ${GRID_COLS} gap-3`}>
          {images.map((image) => {
            const isSelected = selectedIds.has(image.id);
            const isEditing = editingImage === image.id;

            return (
              <div
                key={image.id}
                className={`${CARD_BG} ${CARD_RADIUS} overflow-hidden transition-all ${
                  isSelected ? 'ring-2 ring-white' : CARD_BORDER
                } ${!image.is_visible ? 'opacity-50' : ''}`}
              >
                {/* Image thumbnail */}
                <div
                  className={`${THUMBNAIL_ASPECT} relative overflow-hidden bg-zinc-700 ${
                    bulkMode ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => bulkMode && toggleSelection(image.id)}
                >
                  <img
                    src={image.url}
                    alt={image.alt || 'Gallery image'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Bulk select checkbox overlay */}
                  {bulkMode && (
                    <div className="absolute top-2 left-2">
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-white border-white'
                            : 'border-white/70 bg-black/30'
                        }`}
                      >
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Hidden badge */}
                  {!image.is_visible && (
                    <div className="absolute top-2 right-2 bg-black/60 text-zinc-300 text-xs px-2 py-0.5 rounded">
                      Hidden
                    </div>
                  )}

                  {/* Storage badge */}
                  {image.storage_path && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-green-400 text-xs px-2 py-0.5 rounded">
                      Supabase
                    </div>
                  )}
                  {!image.storage_path && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-amber-400 text-xs px-2 py-0.5 rounded">
                      External
                    </div>
                  )}
                </div>

                {/* Image info and actions */}
                <div className="p-2.5">
                  {isEditing ? (
                    // Edit form inline
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editFormData.alt}
                        onChange={(e) => handleEditChange('alt', e.target.value)}
                        placeholder="Description"
                        className="w-full px-2 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-white text-xs focus:outline-none focus:border-white"
                      />
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => handleEditChange('date', e.target.value)}
                          placeholder="Date"
                          className="px-2 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-white text-xs focus:outline-none focus:border-white"
                        />
                        <input
                          type="text"
                          value={editFormData.location}
                          onChange={(e) => handleEditChange('location', e.target.value)}
                          placeholder="Location"
                          className="px-2 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-white text-xs focus:outline-none focus:border-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={editFormData.display_order}
                          onChange={(e) => handleEditChange('display_order', parseInt(e.target.value, 10) || 0)}
                          placeholder="Order"
                          className="px-2 py-1.5 bg-zinc-900 border border-zinc-600 rounded text-white text-xs focus:outline-none focus:border-white"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editFormData.is_visible}
                            onChange={(e) => handleEditChange('is_visible', e.target.checked)}
                            className="w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-600"
                          />
                          Visible
                        </label>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleEditSave}
                          disabled={editSaving}
                          className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${BTN_PRIMARY} ${BTN_DISABLED}`}
                        >
                          {editSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleEditCancel}
                          disabled={editSaving}
                          className={`flex-1 px-2 py-1 text-xs font-medium rounded transition-colors ${BTN_SECONDARY} ${BTN_DISABLED}`}
                        >
                          Cancel
                        </button>
                      </div>

                      {editMessage && (
                        <p className={`text-xs ${editMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          {editMessage.text}
                        </p>
                      )}
                    </div>
                  ) : (
                    // Display mode
                    <>
                      <p className="text-white text-xs truncate mb-0.5">
                        {image.alt || 'No description'}
                      </p>
                      <p className="text-zinc-500 text-xs truncate">
                        {[image.date, image.location].filter(Boolean).join(' -- ') || 'No metadata'}
                      </p>

                      {/* Action buttons */}
                      {!bulkMode && (
                        <div className="flex items-center gap-1 mt-2">
                          <button
                            onClick={() => handleToggleVisibility(image)}
                            className="p-1 rounded transition-colors bg-zinc-700 hover:bg-zinc-600"
                            title={image.is_visible ? 'Hide' : 'Show'}
                            aria-label={image.is_visible ? 'Hide image' : 'Show image'}
                          >
                            {image.is_visible ? (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-zinc-500">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(image)}
                            className="px-2 py-1 text-xs rounded transition-colors bg-zinc-700 hover:bg-zinc-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(image)}
                            className="ml-25 px-2 py-1 text-xs font-bold rounded transition-colors bg-red-800 hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Single delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 max-w-sm w-full mx-4`}>
            <h3 className="text-lg font-semibold text-white mb-2">Delete image?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Are you sure you want to delete this image?
              {deleteConfirm.storage_path
                ? ' The file will also be removed from storage.'
                : ' This will only remove the database entry (external image).'}
            </p>
            {deleteConfirm.url && (
              <div className="w-24 h-24 rounded overflow-hidden bg-zinc-700 mb-4">
                <img src={deleteConfirm.url} alt="To be deleted" className="w-full h-full object-cover" />
              </div>
            )}
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

      {/* Bulk delete confirmation */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 max-w-sm w-full mx-4`}>
            <h3 className="text-lg font-semibold text-white mb-2">Delete {selectedCount} images?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              This will permanently delete {selectedCount} images. Supabase-hosted images will also be removed from storage. This cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_DANGER} ${BTN_DISABLED}`}
              >
                {bulkDeleting ? 'Deleting...' : `Delete ${selectedCount} images`}
              </button>
              <button
                onClick={() => setShowBulkDelete(false)}
                disabled={bulkDeleting}
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