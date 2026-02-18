import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * SiteContentPage -- Edit key-value site content stored in the site_content table.
 * 
 * Each content entry is displayed as an editable field with its own save button.
 * Changes save directly to the database and reflect on the public site immediately.
 * 
 * Multi-line keys (about_us paragraphs) render as textareas.
 * Single-line keys (email, headings) render as text inputs.
 */

// CUSTOMIZATION: Card styling
const CARD_BG = 'bg-zinc-800';
const CARD_BORDER = 'border border-zinc-700';
const CARD_RADIUS = 'rounded-lg';

// CUSTOMIZATION: Button styling
const SAVE_BG = 'bg-white';
const SAVE_TEXT = 'text-zinc-900';
const SAVE_HOVER = 'hover:bg-zinc-200';
const SAVE_DISABLED = 'disabled:opacity-50 disabled:cursor-not-allowed';

// CUSTOMIZATION: Keys that should render as multi-line textareas
const MULTILINE_KEYS = ['about_us_p1', 'about_us_p2', 'about_us_p3', 'mailing_list_description'];

// CUSTOMIZATION: Textarea rows
const TEXTAREA_ROWS = 5;

// CUSTOMIZATION: Human-readable labels for each key
const KEY_LABELS = {
  about_us_heading: 'About Us Heading',
  about_us_p1: 'About Us -- Paragraph 1',
  about_us_p2: 'About Us -- Paragraph 2',
  about_us_p3: 'About Us -- Paragraph 3',
  band_email: 'Band Email',
  contact_heading: 'Contact Page Heading',
  mailing_list_description: 'Mailing List Description',
};

// CUSTOMIZATION: Display order for fields (keys not listed here appear at the end)
const KEY_ORDER = [
  'about_us_heading',
  'about_us_p1',
  'about_us_p2',
  'about_us_p3',
  'contact_heading',
  'band_email',
  'mailing_list_description',
];

export default function SiteContentPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track edited values separately so we can compare against originals
  const [editedValues, setEditedValues] = useState({});

  // Track save state per key: { key: 'saving' | 'saved' | 'error' | null }
  const [saveStates, setSaveStates] = useState({});

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('site_content')
        .select('*')
        .order('key');

      if (fetchError) throw fetchError;

      setEntries(data || []);

      // Initialise edited values with current database values
      const initialValues = {};
      (data || []).forEach((entry) => {
        initialValues[entry.key] = entry.value;
      });
      setEditedValues(initialValues);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching site content:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key, newValue) {
    setEditedValues((prev) => ({ ...prev, [key]: newValue }));

    // Clear any previous save state when user starts editing again
    setSaveStates((prev) => ({ ...prev, [key]: null }));
  }

  async function handleSave(entry) {
    const key = entry.key;
    const newValue = editedValues[key];

    setSaveStates((prev) => ({ ...prev, [key]: 'saving' }));

    try {
      const { error: updateError } = await supabase
        .from('site_content')
        .update({ value: newValue, updated_at: new Date().toISOString() })
        .eq('id', entry.id);

      if (updateError) throw updateError;

      // Update the original entry so the "unsaved changes" check resets
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, value: newValue } : e))
      );

      setSaveStates((prev) => ({ ...prev, [key]: 'saved' }));

      // Clear "saved" message after 3 seconds
      setTimeout(() => {
        setSaveStates((prev) => ({ ...prev, [key]: null }));
      }, 3000);
    } catch (err) {
      console.error(`Error saving ${key}:`, err);
      setSaveStates((prev) => ({ ...prev, [key]: 'error' }));
    }
  }

  /** Check if a field has been modified from its database value */
  function hasChanged(key) {
    const original = entries.find((e) => e.key === key);
    if (!original) return false;
    return editedValues[key] !== original.value;
  }

  /** Sort entries by KEY_ORDER, with unlisted keys at the end */
  function getSortedEntries() {
    return [...entries].sort((a, b) => {
      const indexA = KEY_ORDER.indexOf(a.key);
      const indexB = KEY_ORDER.indexOf(b.key);
      const orderA = indexA === -1 ? KEY_ORDER.length : indexA;
      const orderB = indexB === -1 ? KEY_ORDER.length : indexB;
      return orderA - orderB;
    });
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Site Content</h1>
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          Loading content...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Site Content</h1>
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          Failed to load content: {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Site Content</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Edit your website content below. Changes go live immediately after saving.
      </p>

      <div className="space-y-4">
        {getSortedEntries().map((entry) => {
          const isMultiline = MULTILINE_KEYS.includes(entry.key);
          const label = KEY_LABELS[entry.key] || entry.key;
          const saveState = saveStates[entry.key];
          const changed = hasChanged(entry.key);
          const isSaving = saveState === 'saving';

          return (
            <div key={entry.id} className={`${CARD_BG} ${CARD_BORDER} ${CARD_RADIUS} p-5`}>
              {/*
                Mobile: stack label, input, then save button full-width below.
                Tablet (md+): side-by-side -- input takes flex-1, save button sits to the right.
              */}
              <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                <div className="flex-1">
                  <label
                    htmlFor={`field-${entry.key}`}
                    className="block text-sm font-medium text-zinc-300 mb-2"
                  >
                    {label}
                  </label>

                  {isMultiline ? (
                    <textarea
                      id={`field-${entry.key}`}
                      value={editedValues[entry.key] ?? ''}
                      onChange={(e) => handleChange(entry.key, e.target.value)}
                      rows={TEXTAREA_ROWS}
                      className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-600 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors resize-y"
                    />
                  ) : (
                    <input
                      id={`field-${entry.key}`}
                      type={entry.key === 'band_email' ? 'email' : 'text'}
                      value={editedValues[entry.key] ?? ''}
                      onChange={(e) => handleChange(entry.key, e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-600 rounded text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                    />
                  )}
                </div>

                {/*
                  Mobile: save button sits below the input, left-aligned, with top margin.
                  Tablet (md+): save button sits to the right with pt-7 to align below the label.
                */}
                <div className="flex items-center md:flex-col md:items-end gap-2 mt-3 md:mt-0 md:pt-7">
                  <button
                    onClick={() => handleSave(entry)}
                    disabled={!changed || isSaving}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors ${SAVE_BG} ${SAVE_TEXT} ${SAVE_HOVER} ${SAVE_DISABLED}`}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>

                  {/* Save state feedback */}
                  {saveState === 'saved' && (
                    <span className="text-green-400 text-xs">Saved</span>
                  )}
                  {saveState === 'error' && (
                    <span className="text-red-400 text-xs">Failed to save</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}