import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../context/AuthContext';

/**
 * IconPicker -- Dual-mode icon selector for social link icons.
 * 
 * Mode 1: Pick from existing SVGs in the platform-icons storage bucket
 * Mode 2: Upload a new SVG to the bucket
 * 
 * Returns the selected icon path (either storage URL or existing path)
 * via the onChange callback.
 * 
 * When Hannah's account is logged in, shows a note about getting Adam
 * to create the SVG before uploading to maintain brand consistency.
 */

// CUSTOMIZATION: Styling
const CARD_BG = 'bg-zinc-800';
const CARD_BORDER = 'border border-zinc-700';
const SELECTED_BORDER = 'border-2 border-white';
const TAB_ACTIVE = 'bg-zinc-700 text-white';
const TAB_INACTIVE = 'text-zinc-400 hover:text-white';

// CUSTOMIZATION: Hannah's email for brand guidance message
const BRAND_GUIDANCE_EMAIL = 'hannahdixon233@gmail.com';

// CUSTOMIZATION: Accepted file types
const ACCEPTED_FILE_TYPES = '.svg';
const MAX_FILE_SIZE_KB = 500;

export default function IconPicker({ value, onChange }) {
  const { user } = useAuthContext();
  const [mode, setMode] = useState('existing');
  const [existingIcons, setExistingIcons] = useState([]);
  const [loadingIcons, setLoadingIcons] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const showBrandGuidance = user?.email === BRAND_GUIDANCE_EMAIL;

  useEffect(() => {
    fetchExistingIcons();
  }, []);

  async function fetchExistingIcons() {
    try {
      setLoadingIcons(true);

      // Fetch from Supabase Storage bucket
      const { data: storageFiles, error: storageError } = await supabase
        .storage
        .from('platform-icons')
        .list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } });

      if (storageError) throw storageError;

      // Build full public URLs for each file
      const storageIcons = (storageFiles || [])
        .filter((file) => file.name.endsWith('.svg'))
        .map((file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('platform-icons')
            .getPublicUrl(file.name);

          return {
            name: file.name,
            url: publicUrl,
            source: 'storage',
          };
        });

      // Also include icons from the public/icons/ folder that are currently in use
      const { data: currentLinks, error: linksError } = await supabase
        .from('social_links')
        .select('icon_path')
        .not('icon_path', 'is', null);

      if (linksError) throw linksError;

      const localIcons = (currentLinks || [])
        .filter((link) => link.icon_path && link.icon_path.startsWith('/icons/'))
        .map((link) => ({
          name: link.icon_path.split('/').pop(),
          url: link.icon_path,
          source: 'local',
        }));

      // Deduplicate by name
      const allIcons = [...localIcons];
      storageIcons.forEach((icon) => {
        if (!allIcons.some((existing) => existing.name === icon.name)) {
          allIcons.push(icon);
        }
      });

      setExistingIcons(allIcons);
    } catch (err) {
      console.error('Error fetching icons:', err);
    } finally {
      setLoadingIcons(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate file type
    if (!file.name.endsWith('.svg')) {
      setUploadError('Only SVG files are accepted.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_KB * 1024) {
      setUploadError(`File must be under ${MAX_FILE_SIZE_KB}KB.`);
      return;
    }

    setUploading(true);

    try {
      // Sanitise filename: lowercase, replace spaces with hyphens
      const sanitisedName = file.name.toLowerCase().replace(/\s+/g, '-');

      const { error: uploadError } = await supabase
        .storage
        .from('platform-icons')
        .upload(sanitisedName, file, {
          contentType: 'image/svg+xml',
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message.includes('already exists')) {
          setUploadError('An icon with this name already exists. Rename the file and try again.');
        } else {
          throw uploadError;
        }
        return;
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('platform-icons')
        .getPublicUrl(sanitisedName);

      // Select the newly uploaded icon
      onChange(publicUrl);

      // Refresh the existing icons list
      await fetchExistingIcons();

      // Switch to existing tab to show the selection
      setMode('existing');
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload icon.');
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">
        Platform Icon
      </label>

      {/* Brand guidance message for Hannah */}
      {showBrandGuidance && (
        <div className="mb-3 p-3 bg-zinc-700/50 border border-zinc-600 rounded text-zinc-300 text-sm">
          If you need a new icon, use photoshop to create the svg with a transparent background.
          Otherwise just get Adam to create it and upload it here to maintain brand consistency.
        </div>
      )}

      {/* Mode tabs */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('existing')}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            mode === 'existing' ? TAB_ACTIVE : TAB_INACTIVE
          }`}
        >
          Choose existing
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1.5 text-sm rounded transition-colors ${
            mode === 'upload' ? TAB_ACTIVE : TAB_INACTIVE
          }`}
        >
          Upload new
        </button>
      </div>

      {/* Existing icons grid */}
      {mode === 'existing' && (
        <div>
          {loadingIcons ? (
            <div className="flex items-center gap-2 text-zinc-400 text-sm py-4">
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              Loading icons...
            </div>
          ) : existingIcons.length === 0 ? (
            <p className="text-zinc-500 text-sm py-4">
              No icons available yet. Upload one using the "Upload new" tab.
            </p>
          ) : (
            <div className="grid grid-cols-6 gap-2">
              {existingIcons.map((icon) => {
                const isSelected = value === icon.url;
                return (
                  <button
                    key={icon.name}
                    type="button"
                    onClick={() => onChange(icon.url)}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? `${SELECTED_BORDER} bg-zinc-700`
                        : `${CARD_BORDER} ${CARD_BG} hover:bg-zinc-700`
                    }`}
                    title={icon.name}
                  >
                    <img
                      src={icon.url}
                      alt={icon.name}
                      className="w-8 h-8"
                    />
                    <span className="text-xs text-zinc-400 truncate w-full text-center">
                      {icon.name.replace('.svg', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Show current selection */}
          {value && (
            <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
              <img src={value} alt="Selected icon" className="w-5 h-5" />
              <span>Selected: {value.split('/').pop()}</span>
            </div>
          )}
        </div>
      )}

      {/* Upload new icon */}
      {mode === 'upload' && (
        <div>
          <div className={`${CARD_BG} ${CARD_BORDER} rounded-lg p-4`}>
            <input
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-zinc-700 file:text-white hover:file:bg-zinc-600 file:cursor-pointer file:transition-colors disabled:opacity-50"
            />
            <p className="mt-2 text-xs text-zinc-500">
              SVG files only. Maximum {MAX_FILE_SIZE_KB}KB.
            </p>
          </div>

          {uploading && (
            <div className="mt-2 flex items-center gap-2 text-zinc-400 text-sm">
              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          )}

          {uploadError && (
            <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
              {uploadError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}