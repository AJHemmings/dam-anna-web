import { useState } from 'react';
import { useUserSubmissions } from '../../hooks/useUserSubmissions';

/**
 * SubmissionsPage
 *
 * Admin review queue for user photo submissions.
 * Allows admins to approve, reject, or block submitters.
 * Supports bulk select and clear on reviewed submissions.
 * Supports date-range retrieval of cleared (archived) submissions.
 *
 * RESPONSIVE STRATEGY:
 * isMobile prop from AdminLayout controls single vs two-column grid.
 * Follows list card pattern: content top, actions in bordered bar below.
 *
 * CUSTOMIZATION:
 * - CARD_BG: submission card background
 * - BTN_PRIMARY: approve button style
 * - BTN_DANGER: reject/block button style
 */

// CUSTOMIZATION: Layout
const CARD_BG = 'bg-zinc-800/60';
const CARD_BORDER = 'border border-zinc-700';
const BTN_PRIMARY = 'bg-white text-black hover:bg-zinc-200 active:bg-zinc-300';
const BTN_DANGER = 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800';
const BTN_SECONDARY =
  'border border-zinc-600 text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600';
const BTN_WARNING =
  'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800';
const BTN_GHOST =
  'border border-zinc-600 text-zinc-400 hover:text-white hover:bg-zinc-700 active:bg-zinc-600';
const INPUT_STYLE =
  'w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 text-sm';
const INPUT_DATE =
  'bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:border-zinc-400 text-sm';
const LABEL_STYLE = 'block text-zinc-400 text-xs mb-1';
const TAG_PENDING =
  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
const TAG_APPROVED =
  'bg-green-500/20 text-green-400 border border-green-500/30';
const TAG_REJECTED = 'bg-red-500/20 text-red-400 border border-red-500/30';
const TAG_ARCHIVED = 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30';

const STATUS_TAGS = {
  pending: TAG_PENDING,
  approved: TAG_APPROVED,
  rejected: TAG_REJECTED,
};

const FILTERS = ['pending', 'approved', 'rejected', 'all'];

// Tabs that support bulk select and clear
const CLEARABLE_FILTERS = ['approved', 'rejected', 'all'];

export default function SubmissionsPage({ isMobile }) {
  const {
    submissions,
    loading,
    error,
    approveSubmission,
    rejectSubmission,
    blockEmail,
    clearSubmissions,
    retrieveCleared,
  } = useUserSubmissions();

  const [filter, setFilter] = useState('pending');
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Bulk select state
  const [selectedIds, setSelectedIds] = useState([]);

  // Retrieve panel state
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [retrieveFrom, setRetrieveFrom] = useState('');
  const [retrieveTo, setRetrieveTo] = useState('');
  const [retrievedRecords, setRetrievedRecords] = useState([]);
  const [retrieveLoading, setRetrieveLoading] = useState(false);
  const [retrieveError, setRetrieveError] = useState(null);

  // ---------------------------------------------------------------------------
  // Filtering -- excludes cleared records (is_cleared handled in hook query)
  // ---------------------------------------------------------------------------
  const filtered =
    filter === 'all'
      ? submissions
      : submissions.filter((s) => s.status === filter);

  const countByStatus = (status) =>
    submissions.filter((s) => s.status === status).length;

  const isClearableTab = CLEARABLE_FILTERS.includes(filter);

  // Clearable cards in current view -- pending submissions cannot be cleared
  const clearableInView = filtered.filter((s) => s.status !== 'pending');

  // ---------------------------------------------------------------------------
  // Bulk select handlers
  // ---------------------------------------------------------------------------
  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function selectAll() {
    setSelectedIds(clearableInView.map((s) => s.id));
  }

  function deselectAll() {
    setSelectedIds([]);
  }

  // ---------------------------------------------------------------------------
  // Clear selected
  // ---------------------------------------------------------------------------
  async function handleClearSelected() {
    if (selectedIds.length === 0) return;
    const result = await clearSubmissions(selectedIds);
    if (result.success) {
      setSelectedIds([]);
    }
  }

  // ---------------------------------------------------------------------------
  // Retrieve cleared records
  // ---------------------------------------------------------------------------
  async function handleRetrieve() {
    if (!retrieveFrom || !retrieveTo) {
      setRetrieveError('Please select both a from and to date.');
      return;
    }
    setRetrieveLoading(true);
    setRetrieveError(null);
    const result = await retrieveCleared({
      from: retrieveFrom,
      to: retrieveTo,
    });
    setRetrieveLoading(false);
    if (result.success) {
      setRetrievedRecords(result.data);
      if (result.data.length === 0) {
        setRetrieveError('No archived records found in that date range.');
      }
    } else {
      setRetrieveError(result.message || 'Failed to retrieve records.');
    }
  }

  function closeRetrieve() {
    setShowRetrieve(false);
    setRetrieveFrom('');
    setRetrieveTo('');
    setRetrievedRecords([]);
    setRetrieveError(null);
  }

  // ---------------------------------------------------------------------------
  // Action handlers -- all go through confirmation dialog
  // ---------------------------------------------------------------------------
  function openConfirm(type, submission) {
    setConfirmDialog({ type, submission });
    setActionReason('');
    setActionError(null);
  }

  function closeConfirm() {
    setConfirmDialog(null);
    setActionReason('');
    setActionError(null);
  }

  async function handleConfirm() {
    if (!confirmDialog) return;
    const { type, submission } = confirmDialog;

    setActionLoading(true);
    setActionError(null);

    let result;

    if (type === 'approve') {
      result = await approveSubmission(submission);
    } else if (type === 'reject') {
      result = await rejectSubmission(submission, actionReason.trim() || null);
    } else if (type === 'block') {
      result = await blockEmail({
        email: submission.email,
        reason: actionReason.trim() || null,
        submissionId: submission.id,
      });
    }

    setActionLoading(false);

    if (result?.success) {
      closeConfirm();
    } else {
      setActionError(
        result?.message || 'Something went wrong. Please try again.'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Render: loading / error
  // ---------------------------------------------------------------------------
  if (loading && submissions.length === 0) {
    return (
      <div className="p-6 text-zinc-400 text-sm">Loading submissions...</div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-400 text-sm">Error: {error}</div>;
  }

  // ---------------------------------------------------------------------------
  // Render: confirmation dialog
  // ---------------------------------------------------------------------------
  const renderConfirmDialog = () => {
    if (!confirmDialog) return null;
    const { type, submission } = confirmDialog;

    const titles = {
      approve: 'Approve Submission',
      reject: 'Reject Submission',
      block: 'Block Email Address',
    };

    const descriptions = {
      approve: `This will move the photo to the public gallery. Submitted by ${submission.submitted_by || submission.email || 'unknown'}.`,
      reject: `This will delete the photo and record the rejection. Add an optional reason for your records.`,
      block: `This will reject this submission and silently block all future submissions from ${submission.email}.`,
    };

    const reasonLabels = {
      reject: 'Reason for rejection (optional)',
      block: 'Reason for blocking (optional)',
    };

    const reasonPlaceholders = {
      reject: 'e.g. Inappropriate content',
      block: 'e.g. Repeated abuse',
    };

    const confirmBtnStyle = type === 'approve' ? BTN_PRIMARY : BTN_DANGER;
    const confirmBtnLabel = {
      approve: 'Approve',
      reject: 'Reject',
      block: 'Block Email',
    };

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
        <div
          className={`${CARD_BG} ${CARD_BORDER} rounded-xl p-6 w-full max-w-md`}
        >
          <h3 className="text-white font-semibold text-lg mb-2">
            {titles[type]}
          </h3>
          <p className="text-zinc-400 text-sm mb-4">{descriptions[type]}</p>

          {(type === 'reject' || type === 'block') && (
            <div className="mb-4">
              <label className={LABEL_STYLE} htmlFor="action-reason">
                {reasonLabels[type]}
              </label>
              <input
                id="action-reason"
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={reasonPlaceholders[type]}
                className={INPUT_STYLE}
              />
            </div>
          )}

          {actionError && (
            <p className="text-red-400 text-sm mb-4">{actionError}</p>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={closeConfirm}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-lg text-sm ${BTN_SECONDARY} disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-lg text-sm ${confirmBtnStyle} disabled:opacity-50`}
            >
              {actionLoading ? 'Processing...' : confirmBtnLabel[type]}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: retrieve panel
  // ---------------------------------------------------------------------------
  const renderRetrievePanel = () => {
    if (!showRetrieve) return null;

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
        <div
          className={`${CARD_BG} ${CARD_BORDER} rounded-xl p-6 w-full max-w-lg`}
        >
          <h3 className="text-white font-semibold text-lg mb-2">
            Retrieve Archived Records
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
            Find cleared submissions by the date they were reviewed.
          </p>

          <div
            className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} mb-4`}
          >
            <div>
              <label className={LABEL_STYLE} htmlFor="retrieve-from">
                From
              </label>
              <input
                id="retrieve-from"
                type="date"
                value={retrieveFrom}
                onChange={(e) => setRetrieveFrom(e.target.value)}
                className={INPUT_DATE}
              />
            </div>
            <div>
              <label className={LABEL_STYLE} htmlFor="retrieve-to">
                To
              </label>
              <input
                id="retrieve-to"
                type="date"
                value={retrieveTo}
                onChange={(e) => setRetrieveTo(e.target.value)}
                className={INPUT_DATE}
              />
            </div>
          </div>

          {retrieveError && (
            <p className="text-red-400 text-sm mb-4">{retrieveError}</p>
          )}

          {retrievedRecords.length > 0 && (
            <div className="mb-4 max-h-64 overflow-y-auto space-y-2">
              {retrievedRecords.map((r) => (
                <div
                  key={r.id}
                  className="bg-zinc-700/50 rounded-lg p-3 flex items-start justify-between gap-2"
                >
                  <div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${TAG_ARCHIVED}`}
                    >
                      archived
                    </span>
                    <span
                      className={`ml-2 text-xs px-2 py-0.5 rounded-full ${STATUS_TAGS[r.status] || TAG_ARCHIVED}`}
                    >
                      {r.status}
                    </span>
                    <p className="text-white text-sm mt-1">
                      {r.submitted_by || 'Unknown'}
                    </p>
                    <p className="text-zinc-400 text-xs">{r.email}</p>
                    {r.rejection_reason && (
                      <p className="text-zinc-500 text-xs mt-0.5">
                        Reason: {r.rejection_reason}
                      </p>
                    )}
                    <p className="text-zinc-600 text-xs mt-0.5">
                      Reviewed:{' '}
                      {new Date(r.reviewed_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={closeRetrieve}
              className={`px-4 py-2 rounded-lg text-sm ${BTN_SECONDARY}`}
            >
              Close
            </button>
            <button
              onClick={handleRetrieve}
              disabled={retrieveLoading}
              className={`px-4 py-2 rounded-lg text-sm ${BTN_PRIMARY} disabled:opacity-50`}
            >
              {retrieveLoading ? 'Searching...' : 'Retrieve'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: submission card
  // ---------------------------------------------------------------------------
  const renderCard = (submission, isArchived = false) => {
    const isExpanded = expandedId === submission.id;
    const statusTag = STATUS_TAGS[submission.status] || TAG_PENDING;
    const isSelected = selectedIds.includes(submission.id);
    const isSelectable = isClearableTab && submission.status !== 'pending';

    return (
      <div
        key={submission.id}
        className={`${CARD_BG} ${CARD_BORDER} rounded-xl overflow-hidden ${
          isSelected ? 'ring-2 ring-white/40' : ''
        } ${isArchived ? 'opacity-70' : ''}`}
      >
        {/* Pending: show image from submissions bucket */}
        {submission.status === 'pending' && (
          <div className="relative">
            <img
              src={submission.image_url}
              alt={submission.alt || 'Submission'}
              className="w-full object-cover"
              style={{ maxHeight: '280px' }}
            />
            <span
              className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full ${statusTag}`}
            >
              {submission.status}
            </span>
          </div>
        )}

        {/* Approved: show image from gallery bucket */}
        {submission.status === 'approved' && (
          <div className="relative">
            <img
              src={submission.image_url}
              alt={submission.alt || 'Approved submission'}
              className="w-full object-cover"
              style={{ maxHeight: '280px' }}
            />
            {/* Bulk select checkbox overlay */}
            {isSelectable && (
              <button
                onClick={() => toggleSelect(submission.id)}
                className={`absolute top-2 right-2 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-white border-white'
                    : 'bg-black/40 border-white/60 hover:border-white'
                }`}
                aria-label={isSelected ? 'Deselect' : 'Select'}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            )}
            <span
              className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full ${statusTag}`}
            >
              Added to gallery
            </span>
          </div>
        )}

        {/* Rejected: no image, info box only */}
        {submission.status === 'rejected' && (
          <div className="p-4 bg-red-500/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✕</span>
              <div>
                <span className={`text-xs px-2 py-1 rounded-full ${statusTag}`}>
                  Rejected
                </span>
                {submission.rejection_reason && (
                  <p className="text-zinc-400 text-xs mt-1">
                    Reason: {submission.rejection_reason}
                  </p>
                )}
              </div>
            </div>
            {/* Bulk select checkbox for rejected cards */}
            {isSelectable && (
              <button
                onClick={() => toggleSelect(submission.id)}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-white border-white'
                    : 'bg-black/40 border-white/60 hover:border-white'
                }`}
                aria-label={isSelected ? 'Deselect' : 'Select'}
              >
                {isSelected && (
                  <svg
                    className="w-3 h-3 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              {submission.submitted_by && (
                <p className="text-white text-sm font-medium">
                  {submission.submitted_by}
                </p>
              )}
              {submission.email && (
                <p className="text-zinc-400 text-xs break-all">
                  {submission.email}
                </p>
              )}
            </div>
            <button
              onClick={() => setExpandedId(isExpanded ? null : submission.id)}
              className="text-zinc-500 hover:text-zinc-300 text-xs shrink-0 transition-colors"
            >
              {isExpanded ? 'Less' : 'More'}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-2 space-y-1 text-xs text-zinc-400 border-t border-zinc-700 pt-3">
              {submission.date && (
                <p>
                  <span className="text-zinc-500">Date:</span> {submission.date}
                </p>
              )}
              {submission.location && (
                <p>
                  <span className="text-zinc-500">Location:</span>{' '}
                  {submission.location}
                </p>
              )}
              <p>
                <span className="text-zinc-500">Submitted:</span>{' '}
                {new Date(submission.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              {submission.reviewed_at && (
                <p>
                  <span className="text-zinc-500">Reviewed:</span>{' '}
                  {new Date(submission.reviewed_at).toLocaleDateString(
                    'en-GB',
                    { day: 'numeric', month: 'short', year: 'numeric' }
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action bar -- only on pending submissions */}
        {submission.status === 'pending' && (
          <div className="border-t border-zinc-700 px-4 py-3 flex gap-2 flex-wrap">
            <button
              onClick={() => openConfirm('approve', submission)}
              className={`px-3 py-2 rounded-lg text-xs font-medium ${BTN_PRIMARY}`}
            >
              Approve
            </button>
            <button
              onClick={() => openConfirm('reject', submission)}
              className={`px-3 py-2 rounded-lg text-xs font-medium ${BTN_DANGER}`}
            >
              Reject
            </button>
            <button
              onClick={() => openConfirm('block', submission)}
              className={`px-3 py-2 rounded-lg text-xs font-medium ml-auto ${BTN_WARNING}`}
            >
              Block Email
            </button>
          </div>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: main
  // ---------------------------------------------------------------------------
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {renderConfirmDialog()}
      {renderRetrievePanel()}

      {/* Page header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Submissions
          </h1>
          <p className="text-zinc-400 text-sm">
            Review fan photo submissions before they appear in the gallery.
          </p>
        </div>
        <button
          onClick={() => setShowRetrieve(true)}
          className={`px-4 py-2 rounded-lg text-sm ${BTN_GHOST}`}
        >
          Retrieve archived
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setSelectedIds([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              filter === f
                ? 'bg-white text-black font-medium'
                : 'border border-zinc-600 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f === 'all'
              ? 'All'
              : `${f.charAt(0).toUpperCase() + f.slice(1)} (${countByStatus(f)})`}
          </button>
        ))}
      </div>

      {/* Bulk select toolbar -- only on clearable tabs */}
      {isClearableTab && clearableInView.length > 0 && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <button
            onClick={
              selectedIds.length === clearableInView.length
                ? deselectAll
                : selectAll
            }
            className={`px-3 py-1.5 rounded text-xs ${BTN_GHOST}`}
          >
            {selectedIds.length === clearableInView.length
              ? 'Deselect all'
              : 'Select all'}
          </button>
          {selectedIds.length > 0 && (
            <>
              <span className="text-zinc-500 text-xs">
                {selectedIds.length} selected
              </span>
              <button
                onClick={handleClearSelected}
                className={`px-3 py-1.5 rounded text-xs ${BTN_DANGER}`}
              >
                Clear selected
              </button>
            </>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-zinc-500 text-sm py-12 text-center">
          {filter === 'pending'
            ? 'No pending submissions. Check back later.'
            : `No ${filter} submissions.`}
        </div>
      )}

      {/* Submissions grid */}
      {filtered.length > 0 && (
        <div
          className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}
        >
          {filtered.map((s) => renderCard(s))}
        </div>
      )}
    </div>
  );
}
