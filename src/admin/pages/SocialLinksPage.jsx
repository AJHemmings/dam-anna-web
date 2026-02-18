import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import IconPicker from '../components/IconPicker';

/**
 * SocialLinksPage -- Manage social media links displayed on the public site.
 * 
 * Features:
 * - View all social links with their icons, names, and URLs
 * - Edit existing links (name, URL, icon, display order, visibility)
 * - Add new social links with icon picker (existing or upload)
 * - Delete links with confirmation
 * 
 * Changes save directly to the database and reflect on the public site immediately.
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

export default function SocialLinksPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [editingLink, setEditingLink] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  function getEmptyForm() {
    return {
      platform: '',
      name: '',
      url: '',
      icon_path: '',
      display_order: 0,
      is_visible: true,
    };
  }

  async function fetchLinks() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('social_links')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setLinks(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching social links:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(link) {
    setEditingLink(link.id);
    setShowAddForm(false);
    setFormData({
      platform: link.platform || '',
      name: link.name || '',
      url: link.url || '',
      icon_path: link.icon_path || '',
      display_order: link.display_order || 0,
      is_visible: link.is_visible ?? true,
    });
    setSaveMessage(null);
  }

  function handleAdd() {
    setEditingLink(null);
    setShowAddForm(true);
    setFormData({
      ...getEmptyForm(),
      display_order: links.length + 1,
    });
    setSaveMessage(null);
  }

  function handleCancel() {
    setEditingLink(null);
    setShowAddForm(false);
    setFormData(getEmptyForm());
    setSaveMessage(null);
  }

  function handleFormChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveMessage(null);

    try {
      if (editingLink) {
        // Update existing link
        const { error: updateError } = await supabase
          .from('social_links')
          .update({
            platform: formData.platform,
            name: formData.name,
            url: formData.url,
            icon_path: formData.icon_path,
            display_order: formData.display_order,
            is_visible: formData.is_visible,
          })
          .eq('id', editingLink);

        if (updateError) throw updateError;
      } else {
        // Insert new link
        const { error: insertError } = await supabase
          .from('social_links')
          .insert({
            platform: formData.platform,
            name: formData.name,
            url: formData.url,
            icon_path: formData.icon_path,
            display_order: formData.display_order,
            is_visible: formData.is_visible,
          });

        if (insertError) throw insertError;
      }

      setSaveMessage({ type: 'success', text: editingLink ? 'Link updated.' : 'Link added.' });
      await fetchLinks();

      // Close form after short delay so user sees the success message
      setTimeout(() => {
        handleCancel();
      }, 1500);
    } catch (err) {
      console.error('Error saving social link:', err);
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(link) {
    setDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('social_links')
        .delete()
        .eq('id', link.id);

      if (deleteError) throw deleteError;

      setDeleteConfirm(null);
      await fetchLinks();
    } catch (err) {
      console.error('Error deleting social link:', err);
    } finally {
      setDeleting(false);
    }
  }

  /** Validate that required fields are filled */
  function isFormValid() {
    return (
      formData.platform.trim() !== '' &&
      formData.name.trim() !== '' &&
      formData.url.trim() !== '' &&
      formData.icon_path.trim() !== ''
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Social Links</h1>
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          Loading social links...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Social Links</h1>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          Failed to load social links: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Social Links</h1>
          <p className="text-zinc-400 text-sm">
            Manage the social media links shown on your site.
          </p>
        </div>
        {!showAddForm && !editingLink && (
          <button
            onClick={handleAdd}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_PRIMARY}`}
          >
            Add new link
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {(showAddForm || editingLink) && (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 mb-6`}>
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingLink ? 'Edit Social Link' : 'Add New Social Link'}
          </h2>

          <div className="space-y-4">
            {/* Platform ID and Display Name -- stack on mobile, 2 cols on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Platform ID
                </label>
                <input
                  id="platform"
                  type="text"
                  value={formData.platform}
                  onChange={(e) => handleFormChange('platform', e.target.value.toLowerCase())}
                  placeholder="e.g. instagram, facebook"
                  className={INPUT_STYLE}
                />
                <p className="mt-1 text-xs text-zinc-500">Lowercase identifier, no spaces.</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Display Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  placeholder="e.g. Instagram, Facebook"
                  className={INPUT_STYLE}
                />
              </div>
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Profile URL
              </label>
              <input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => handleFormChange('url', e.target.value)}
                placeholder="https://instagram.com/damanna"
                className={INPUT_STYLE}
              />
            </div>

            {/* Icon picker */}
            <IconPicker
              value={formData.icon_path}
              onChange={(iconPath) => handleFormChange('icon_path', iconPath)}
            />

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

            {/* Save/Cancel buttons and feedback */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !isFormValid()}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_PRIMARY} ${BTN_DISABLED}`}
              >
                {saving ? 'Saving...' : editingLink ? 'Update link' : 'Add link'}
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

      {/* Links list */}
      {links.length === 0 ? (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 text-center`}>
          <p className="text-zinc-400">No social links yet. Click "Add new link" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-4`}
            >
              {/* Top row: icon + details + order badge */}
              <div className="flex items-center gap-4">
                {/* Icon preview */}
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  {link.icon_path ? (
                    <img src={link.icon_path} alt={`${link.name} icon`} className="w-8 h-8" />
                  ) : (
                    <div className="w-8 h-8 bg-zinc-700 rounded" />
                  )}
                </div>

                {/* Link details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-white font-medium">{link.name}</h3>
                    {!link.is_visible && (
                      <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 text-sm truncate">{link.url}</p>
                </div>

                {/* Order badge -- desktop only */}
                <span className="hidden md:block text-xs text-zinc-500 flex-shrink-0">
                  Order: {link.display_order}
                </span>
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-700">
                <button
                  onClick={() => handleEdit(link)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${BTN_SECONDARY}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(link)}
                  className={`px-3 py-2 text-sm rounded transition-colors ${BTN_DANGER}`}
                >
                  Delete
                </button>
                {/* Order badge -- mobile only */}
                <span className="md:hidden ml-auto text-xs text-zinc-500">
                  Order: {link.display_order}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 max-w-sm w-full mx-4`}>
            <h3 className="text-lg font-semibold text-white mb-2">Delete social link?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Are you sure you want to delete <strong className="text-white">{deleteConfirm.name}</strong>? This will remove it from the public site immediately.
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