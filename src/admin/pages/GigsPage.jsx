import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * GigsPage -- Manage all gigs (upcoming and previous) from one page.
 * 
 * Features:
 * - View all gigs sorted by date, with visual separation of upcoming vs previous
 * - Add new gigs with date, venue, location, ticket info, and venue image URL
 * - Edit existing gigs
 * - Delete gigs with confirmation
 * - Toggle visibility with eye icon
 * - Date IS the logic: date >= today = upcoming, date < today = previous
 * 
 * No manual archiving needed. The public site filters automatically by date.
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

// CUSTOMIZATION: Section header styling
const SECTION_HEADER = 'text-lg font-semibold text-zinc-300 mb-3 mt-8 first:mt-0';

// CUSTOMIZATION: Date display format
const DATE_OPTIONS = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

/**
 * Format a date string (YYYY-MM-DD) into a readable format.
 */
function formatDate(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-GB', DATE_OPTIONS);
}

/**
 * Check if a date string is today or in the future.
 */
function isUpcoming(dateString) {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const gigDate = new Date(dateString + 'T00:00:00');
  return gigDate >= today;
}

export default function GigsPage() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [editingGig, setEditingGig] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState(getEmptyForm());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGigs();
  }, []);

  function getEmptyForm() {
    return {
      date: '',
      venue: '',
      location: '',
      ticket_text: '',
      ticket_url: '',
      image_url: '',
      display_order: 0,
      is_visible: true,
    };
  }

  async function fetchGigs() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('gigs')
        .select('*')
        .order('date', { ascending: true });

      if (fetchError) throw fetchError;
      setGigs(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching gigs:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(gig) {
    setEditingGig(gig.id);
    setShowAddForm(false);
    setFormData({
      date: gig.date || '',
      venue: gig.venue || '',
      location: gig.location || '',
      ticket_text: gig.ticket_text || '',
      ticket_url: gig.ticket_url || '',
      image_url: gig.image_url || '',
      display_order: gig.display_order || 0,
      is_visible: gig.is_visible ?? true,
    });
    setSaveMessage(null);
  }

  function handleAdd() {
    setEditingGig(null);
    setShowAddForm(true);
    setFormData({
      ...getEmptyForm(),
      display_order: gigs.length + 1,
    });
    setSaveMessage(null);
  }

  function handleCancel() {
    setEditingGig(null);
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
      const payload = {
        date: formData.date,
        venue: formData.venue,
        location: formData.location,
        ticket_text: formData.ticket_text || null,
        ticket_url: formData.ticket_url || null,
        image_url: formData.image_url || null,
        display_order: formData.display_order,
        is_visible: formData.is_visible,
      };

      if (editingGig) {
        const { error: updateError } = await supabase
          .from('gigs')
          .update(payload)
          .eq('id', editingGig);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('gigs')
          .insert(payload);

        if (insertError) throw insertError;
      }

      setSaveMessage({ type: 'success', text: editingGig ? 'Gig updated.' : 'Gig added.' });
      await fetchGigs();

      setTimeout(() => {
        handleCancel();
      }, 1500);
    } catch (err) {
      console.error('Error saving gig:', err);
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(gig) {
    setDeleting(true);

    try {
      const { error: deleteError } = await supabase
        .from('gigs')
        .delete()
        .eq('id', gig.id);

      if (deleteError) throw deleteError;

      setDeleteConfirm(null);
      await fetchGigs();
    } catch (err) {
      console.error('Error deleting gig:', err);
    } finally {
      setDeleting(false);
    }
  }

  async function handleToggleVisibility(gig) {
    try {
      const { error: updateError } = await supabase
        .from('gigs')
        .update({ is_visible: !gig.is_visible })
        .eq('id', gig.id);

      if (updateError) throw updateError;

      await fetchGigs();
    } catch (err) {
      console.error('Error toggling gig visibility:', err);
    }
  }

  function isFormValid() {
    return (
      formData.date.trim() !== '' &&
      formData.venue.trim() !== '' &&
      formData.location.trim() !== ''
    );
  }

  // Split gigs into upcoming and previous
  const upcomingGigs = gigs.filter((g) => isUpcoming(g.date));
  const previousGigs = gigs.filter((g) => !isUpcoming(g.date));

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Gigs</h1>
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          Loading gigs...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Gigs</h1>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          Failed to load gigs: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Gigs</h1>
          <p className="text-zinc-400 text-sm">
            {upcomingGigs.length} upcoming, {previousGigs.length} previous.
            Gigs automatically move to "previous" once the date passes.
          </p>
        </div>
        {!showAddForm && !editingGig && (
          <button
            onClick={handleAdd}
            className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_PRIMARY}`}
          >
            Add new gig
          </button>
        )}
      </div>

      {/* Add/Edit form */}
      {(showAddForm || editingGig) && (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 mb-6`}>
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingGig ? 'Edit Gig' : 'Add New Gig'}
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  className={INPUT_STYLE}
                />
              </div>

              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Venue
                </label>
                <input
                  id="venue"
                  type="text"
                  value={formData.venue}
                  onChange={(e) => handleFormChange('venue', e.target.value)}
                  placeholder="e.g. The Garage"
                  className={INPUT_STYLE}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  placeholder="e.g. London"
                  className={INPUT_STYLE}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ticket_text" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Ticket Button Text
                </label>
                <input
                  id="ticket_text"
                  type="text"
                  value={formData.ticket_text}
                  onChange={(e) => handleFormChange('ticket_text', e.target.value)}
                  placeholder="e.g. Get Tickets, Free Entry"
                  className={INPUT_STYLE}
                />
                <p className="mt-1 text-xs text-zinc-500">Leave blank for past gigs or gigs without tickets.</p>
              </div>

              <div>
                <label htmlFor="ticket_url" className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Ticket URL
                </label>
                <input
                  id="ticket_url"
                  type="url"
                  value={formData.ticket_url}
                  onChange={(e) => handleFormChange('ticket_url', e.target.value)}
                  placeholder="https://tickets.example.com/..."
                  className={INPUT_STYLE}
                />
              </div>
            </div>

            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-zinc-300 mb-1.5">
                Venue Image URL
              </label>
              <input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleFormChange('image_url', e.target.value)}
                placeholder="https://example.com/venue-logo.png"
                className={INPUT_STYLE}
              />
              <p className="mt-1 text-xs text-zinc-500">Optional. Shown in the venue photos slideshow for upcoming gigs.</p>
            </div>

            {/* Image preview */}
            {formData.image_url && (
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded overflow-hidden bg-zinc-700 flex-shrink-0">
                  <img
                    src={formData.image_url}
                    alt="Venue image preview"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <span className="text-xs text-zinc-400">Image preview</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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
                <p className="mt-1 text-xs text-zinc-500">Tiebreaker when multiple gigs share the same date.</p>
              </div>

              <div className="flex items-center pt-7">
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

            {/* Date hint */}
            {formData.date && (
              <div className={`p-3 rounded text-sm ${
                isUpcoming(formData.date)
                  ? 'bg-green-900/20 border border-green-800 text-green-300'
                  : 'bg-zinc-700/30 border border-zinc-600 text-zinc-400'
              }`}>
                This gig will appear under <strong>{isUpcoming(formData.date) ? 'Upcoming Gigs' : 'Previous Gigs'}</strong> on the public site.
              </div>
            )}

            {/* Save/Cancel buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !isFormValid()}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${BTN_PRIMARY} ${BTN_DISABLED}`}
              >
                {saving ? 'Saving...' : editingGig ? 'Update gig' : 'Add gig'}
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

      {/* Upcoming gigs */}
      <h2 className={SECTION_HEADER}>
        Upcoming Gigs ({upcomingGigs.length})
      </h2>
      {upcomingGigs.length === 0 ? (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-4 text-center`}>
          <p className="text-zinc-400 text-sm">No upcoming gigs. Click "Add new gig" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingGigs.map((gig) => (
            <GigCard
              key={gig.id}
              gig={gig}
              onEdit={handleEdit}
              onDelete={setDeleteConfirm}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}

      {/* Previous gigs */}
      <h2 className={SECTION_HEADER}>
        Previous Gigs ({previousGigs.length})
      </h2>
      {previousGigs.length === 0 ? (
        <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-4 text-center`}>
          <p className="text-zinc-400 text-sm">No previous gigs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {previousGigs.map((gig) => (
            <GigCard
              key={gig.id}
              gig={gig}
              onEdit={handleEdit}
              onDelete={setDeleteConfirm}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-6 max-w-sm w-full mx-4`}>
            <h3 className="text-lg font-semibold text-white mb-2">Delete gig?</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Are you sure you want to delete the gig at <strong className="text-white">{deleteConfirm.venue}</strong> on <strong className="text-white">{formatDate(deleteConfirm.date)}</strong>? This cannot be undone.
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

/**
 * GigCard -- Individual gig row in the list.
 * Extracted as a component to keep the main render clean.
 */
function GigCard({ gig, onEdit, onDelete, onToggleVisibility }) {
  const upcoming = isUpcoming(gig.date);

  return (
    <div className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-4 flex items-center gap-4`}>
      {/* Venue image thumbnail */}
      <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-zinc-700 flex items-center justify-center">
        {gig.image_url ? (
          <img
            src={gig.image_url}
            alt={`${gig.venue} logo`}
            className="w-full h-full object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="text-zinc-500 text-xs">No img</span>
        )}
      </div>

      {/* Gig details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium">{gig.venue}</h3>
          {!gig.is_visible && (
            <span className="text-xs text-zinc-500 bg-zinc-700 px-2 py-0.5 rounded">
              Hidden
            </span>
          )}
        </div>
        <p className="text-zinc-400 text-sm">
          {formatDate(gig.date)} -- {gig.location}
        </p>
        {upcoming && gig.ticket_text && (
          <p className="text-zinc-500 text-xs mt-0.5">
            Ticket: {gig.ticket_text}
          </p>
        )}
      </div>

      {/* Order badge */}
      <span className="text-xs text-zinc-500 flex-shrink-0">
        Order: {gig.display_order}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onToggleVisibility(gig)}
          className="p-1.5 rounded transition-colors bg-zinc-700 hover:bg-zinc-600"
          title={gig.is_visible ? 'Hide from public site' : 'Show on public site'}
          aria-label={gig.is_visible ? 'Hide gig' : 'Show gig'}
        >
          {gig.is_visible ? (
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
          onClick={() => onEdit(gig)}
          className="px-3 py-1.5 text-sm rounded transition-colors bg-zinc-700 hover:bg-zinc-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(gig)}
          className="px-3 py-1.5 text-sm rounded transition-colors bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}