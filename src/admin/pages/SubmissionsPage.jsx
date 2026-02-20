import { useState } from 'react';
import { useUserSubmissions } from '../../hooks/useUserSubmissions';

/**
 * SubmissionsPage
 *
 * Admin review queue for user photo submissions.
 * Tapping any card opens a bottom sheet with full details.
 * Pending cards: Approve opens a metadata edit form before confirming.
 *   Reject and Block Email ask for an optional reason then confirm.
 * Approved and rejected cards are view-only in the sheet.
 *
 * RESPONSIVE STRATEGY:
 * isMobile prop controls single vs two-column grid.
 * Bottom sheet: full width on mobile, max-w-2xl centred on desktop.
 *
 * CUSTOMIZATION:
 * - CARD_BG / CARD_BORDER: card appearance
 * - SHEET_MAX_HEIGHT: max height of bottom sheet
 * - BTN_*: button styles
 */

const CARD_BG = 'bg-zinc-800/60';
const CARD_BORDER = 'border border-zinc-700';
const BTN_PRIMARY = 'bg-white text-black hover:bg-zinc-200 active:bg-zinc-300';
const BTN_DANGER = 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800';
const BTN_SECONDARY = 'border border-zinc-600 text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600';
const BTN_WARNING = 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800';
const BTN_GHOST = 'border border-zinc-600 text-zinc-400 hover:text-white hover:bg-zinc-700 active:bg-zinc-600';
const INPUT_STYLE = 'w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 text-sm';
const INPUT_DATE = 'w-full bg-zinc-700 border border-zinc-600 rounded px-3 py-2 text-white focus:outline-none focus:border-zinc-400 text-sm';
const LABEL_STYLE = 'block text-zinc-400 text-xs mb-1';
const TAG_PENDING = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
const TAG_APPROVED = 'bg-green-500/20 text-green-400 border border-green-500/30';
const TAG_REJECTED = 'bg-red-500/20 text-red-400 border border-red-500/30';
const TAG_ARCHIVED = 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30';

// CUSTOMIZATION: Bottom sheet max height
const SHEET_MAX_HEIGHT = '90vh';

const STATUS_TAGS = { pending: TAG_PENDING, approved: TAG_APPROVED, rejected: TAG_REJECTED };
const FILTERS = ['pending', 'approved', 'rejected', 'all'];

// Sheet steps for pending submissions
// 'actions'  -- Approve / Reject / Block Email buttons
// 'approve'  -- metadata edit form before confirming
// 'reject'   -- optional reason + confirm
// 'block'    -- optional reason + confirm
const STEP_ACTIONS = 'actions';
const STEP_APPROVE = 'approve';
const STEP_REJECT = 'reject';
const STEP_BLOCK = 'block';

export default function SubmissionsPage({ isMobile }) {
  const {
    submissions, loading, error,
    approveSubmission, rejectSubmission, blockEmail, retrieveCleared,
  } = useUserSubmissions();

  const [filter, setFilter] = useState('pending');

  // Bottom sheet
  const [sheetSubmission, setSheetSubmission] = useState(null);
  const [sheetStep, setSheetStep] = useState(STEP_ACTIONS);

  // Approve metadata form state
  const [approveForm, setApproveForm] = useState({
    alt: '', date: '', location: '', display_order: '', is_visible: true,
  });

  // Reject / block reason
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Retrieve panel
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [retrieveFrom, setRetrieveFrom] = useState('');
  const [retrieveTo, setRetrieveTo] = useState('');
  const [retrievedRecords, setRetrievedRecords] = useState([]);
  const [retrieveLoading, setRetrieveLoading] = useState(false);
  const [retrieveError, setRetrieveError] = useState(null);

  const filtered = filter === 'all' ? submissions : submissions.filter((s) => s.status === filter);
  const countByStatus = (status) => submissions.filter((s) => s.status === status).length;

  // ---------------------------------------------------------------------------
  // Bottom sheet handlers
  // ---------------------------------------------------------------------------
  function openSheet(submission) {
    setSheetSubmission(submission);
    setSheetStep(STEP_ACTIONS);
    setApproveForm({
      alt: submission.submitted_by || '',
      date: submission.date || '',
      location: submission.location || '',
      display_order: '',
      is_visible: true,
    });
    setActionReason('');
    setActionError(null);
  }

  function closeSheet() {
    setSheetSubmission(null);
    setSheetStep(STEP_ACTIONS);
    setApproveForm({ alt: '', date: '', location: '', display_order: '', is_visible: true });
    setActionReason('');
    setActionError(null);
  }

  function goToStep(step) {
    setSheetStep(step);
    setActionReason('');
    setActionError(null);
  }

  // ---------------------------------------------------------------------------
  // Confirm handlers
  // ---------------------------------------------------------------------------
  async function handleConfirmApprove() {
    setActionLoading(true);
    setActionError(null);
    const result = await approveSubmission(sheetSubmission, {
      alt: approveForm.alt,
      date: approveForm.date,
      location: approveForm.location,
      display_order: approveForm.display_order,
      is_visible: approveForm.is_visible,
    });
    setActionLoading(false);
    if (result.success) { closeSheet(); } else { setActionError(result.message || 'Something went wrong.'); }
  }

  async function handleConfirmReject() {
    setActionLoading(true);
    setActionError(null);
    const result = await rejectSubmission(sheetSubmission, actionReason.trim() || null);
    setActionLoading(false);
    if (result.success) { closeSheet(); } else { setActionError(result.message || 'Something went wrong.'); }
  }

  async function handleConfirmBlock() {
    setActionLoading(true);
    setActionError(null);
    const result = await blockEmail({
      email: sheetSubmission.email,
      reason: actionReason.trim() || null,
      submissionId: sheetSubmission.id,
    });
    setActionLoading(false);
    if (result.success) { closeSheet(); } else { setActionError(result.message || 'Something went wrong.'); }
  }

  // ---------------------------------------------------------------------------
  // Retrieve cleared records
  // ---------------------------------------------------------------------------
  async function handleRetrieve() {
    if (!retrieveFrom || !retrieveTo) { setRetrieveError('Please select both a from and to date.'); return; }
    setRetrieveLoading(true);
    setRetrieveError(null);
    const result = await retrieveCleared({ from: retrieveFrom, to: retrieveTo });
    setRetrieveLoading(false);
    if (result.success) {
      setRetrievedRecords(result.data);
      if (result.data.length === 0) setRetrieveError('No archived records found in that date range.');
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
  // Render: loading / error
  // ---------------------------------------------------------------------------
  if (loading && submissions.length === 0) {
    return <div className="p-6 text-zinc-400 text-sm">Loading submissions...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-400 text-sm">Error: {error}</div>;
  }

  // ---------------------------------------------------------------------------
  // Render: bottom sheet
  // ---------------------------------------------------------------------------
  const renderBottomSheet = () => {
    if (!sheetSubmission) return null;
    const s = sheetSubmission;
    const statusTag = STATUS_TAGS[s.status] || TAG_PENDING;
    const isPending = s.status === 'pending';

    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-[9998] bg-black/60" onClick={closeSheet} />

        {/* Mobile: bottom sheet. Desktop: centred modal. */}
        <div
          className="fixed bottom-0 left-0 right-0 z-[9999] bg-zinc-900 rounded-t-2xl overflow-y-auto md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-2xl md:w-full"
          style={{ maxHeight: SHEET_MAX_HEIGHT }}
        >
          {/* Drag handle -- mobile only */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-zinc-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusTag}`}>{s.status}</span>
              {s.submitted_by && (
                <span className="text-white text-sm font-medium truncate">{s.submitted_by}</span>
              )}
            </div>
            <button
              onClick={closeSheet}
              className="text-zinc-400 hover:text-white transition-colors w-11 h-11 flex items-center justify-center text-2xl shrink-0"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Image */}
          {s.image_url && (
            <img
              src={s.image_url}
              alt={s.submitted_by || 'Submission'}
              className="w-full object-cover max-h-72"
            />
          )}

          {/* Submission details -- always shown */}
          <div className="px-4 py-4 space-y-2 text-sm border-b border-zinc-700">
            {s.email && <p className="text-zinc-400 break-all"><span className="text-zinc-500">Email: </span>{s.email}</p>}
            {s.date && <p className="text-zinc-400"><span className="text-zinc-500">Gig date: </span>{s.date}</p>}
            {s.location && <p className="text-zinc-400"><span className="text-zinc-500">Location: </span>{s.location}</p>}
            <p className="text-zinc-400">
              <span className="text-zinc-500">Submitted: </span>
              {new Date(s.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
            {s.reviewed_at && (
              <p className="text-zinc-400">
                <span className="text-zinc-500">Reviewed: </span>
                {new Date(s.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
            {s.rejection_reason && (
              <p className="text-zinc-400"><span className="text-zinc-500">Rejection reason: </span>{s.rejection_reason}</p>
            )}
          </div>

          {/* Action area -- pending only */}
          {isPending && (
            <div className="px-4 py-4">

              {/* Step: initial action buttons */}
              {sheetStep === STEP_ACTIONS && (
                <div className="flex flex-col gap-3">
                  <button onClick={() => goToStep(STEP_APPROVE)} className={`w-full py-3 rounded-lg text-sm font-medium ${BTN_PRIMARY}`}>
                    Approve
                  </button>
                  <button onClick={() => goToStep(STEP_REJECT)} className={`w-full py-3 rounded-lg text-sm font-medium ${BTN_DANGER}`}>
                    Reject
                  </button>
                  <button onClick={() => goToStep(STEP_BLOCK)} className={`w-full py-3 rounded-lg text-sm font-medium ${BTN_WARNING}`}>
                    Block Email
                  </button>
                </div>
              )}

              {/* Step: approve -- metadata edit form */}
              {sheetStep === STEP_APPROVE && (
                <div>
                  <p className="text-white text-sm font-medium mb-4">Add to Gallery</p>
                  <p className="text-zinc-400 text-xs mb-4">
                    Fill in the gallery metadata before approving. Date and location are pre-filled from the submission if provided.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className={LABEL_STYLE} htmlFor="approve-alt">Description (alt text)</label>
                      <input
                        id="approve-alt"
                        type="text"
                        value={approveForm.alt}
                        onChange={(e) => setApproveForm((p) => ({ ...p, alt: e.target.value }))}
                        placeholder="e.g. Fan photo from The Joiners gig"
                        className={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className={LABEL_STYLE} htmlFor="approve-date">Date</label>
                      <input
                        id="approve-date"
                        type="text"
                        value={approveForm.date}
                        onChange={(e) => setApproveForm((p) => ({ ...p, date: e.target.value }))}
                        placeholder="e.g. 12 Jan 2025"
                        className={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className={LABEL_STYLE} htmlFor="approve-location">Location</label>
                      <input
                        id="approve-location"
                        type="text"
                        value={approveForm.location}
                        onChange={(e) => setApproveForm((p) => ({ ...p, location: e.target.value }))}
                        placeholder="e.g. The Joiners, Southampton"
                        className={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className={LABEL_STYLE} htmlFor="approve-order">Display order</label>
                      <input
                        id="approve-order"
                        type="number"
                        value={approveForm.display_order}
                        onChange={(e) => setApproveForm((p) => ({ ...p, display_order: e.target.value }))}
                        placeholder="Leave blank to add before existing images"
                        className={INPUT_STYLE}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={approveForm.is_visible}
                          onChange={(e) => setApproveForm((p) => ({ ...p, is_visible: e.target.checked }))}
                          className="w-4 h-4 accent-white cursor-pointer"
                        />
                        <span className="text-zinc-300 text-sm">Visible in gallery</span>
                      </label>
                    </div>
                  </div>

                  {actionError && <p className="text-red-400 text-sm mt-4">{actionError}</p>}

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => goToStep(STEP_ACTIONS)}
                      disabled={actionLoading}
                      className={`flex-1 py-3 rounded-lg text-sm ${BTN_SECONDARY} disabled:opacity-50`}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleConfirmApprove}
                      disabled={actionLoading}
                      className={`flex-1 py-3 rounded-lg text-sm font-medium ${BTN_PRIMARY} disabled:opacity-50`}
                    >
                      {actionLoading ? 'Approving...' : 'Confirm Approve'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: reject */}
              {sheetStep === STEP_REJECT && (
                <div>
                  <p className="text-white text-sm font-medium mb-3">Reject this submission?</p>
                  <div className="mb-4">
                    <label className={LABEL_STYLE} htmlFor="reject-reason">Reason (optional)</label>
                    <input
                      id="reject-reason"
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="e.g. Inappropriate content"
                      className={INPUT_STYLE}
                    />
                  </div>
                  {actionError && <p className="text-red-400 text-sm mb-4">{actionError}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => goToStep(STEP_ACTIONS)} disabled={actionLoading} className={`flex-1 py-3 rounded-lg text-sm ${BTN_SECONDARY} disabled:opacity-50`}>Back</button>
                    <button onClick={handleConfirmReject} disabled={actionLoading} className={`flex-1 py-3 rounded-lg text-sm font-medium ${BTN_DANGER} disabled:opacity-50`}>
                      {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: block */}
              {sheetStep === STEP_BLOCK && (
                <div>
                  <p className="text-white text-sm font-medium mb-1">Block {s.email}?</p>
                  <p className="text-zinc-400 text-xs mb-3">This will reject the submission and silently block all future submissions from this address.</p>
                  <div className="mb-4">
                    <label className={LABEL_STYLE} htmlFor="block-reason">Reason (optional)</label>
                    <input
                      id="block-reason"
                      type="text"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="e.g. Repeated abuse"
                      className={INPUT_STYLE}
                    />
                  </div>
                  {actionError && <p className="text-red-400 text-sm mb-4">{actionError}</p>}
                  <div className="flex gap-3">
                    <button onClick={() => goToStep(STEP_ACTIONS)} disabled={actionLoading} className={`flex-1 py-3 rounded-lg text-sm ${BTN_SECONDARY} disabled:opacity-50`}>Back</button>
                    <button onClick={handleConfirmBlock} disabled={actionLoading} className={`flex-1 py-3 rounded-lg text-sm font-medium ${BTN_DANGER} disabled:opacity-50`}>
                      {actionLoading ? 'Blocking...' : 'Confirm Block'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Safe area spacer */}
          <div className="h-6" />
        </div>
      </>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: retrieve panel
  // ---------------------------------------------------------------------------
  const renderRetrievePanel = () => {
    if (!showRetrieve) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-12 bg-black/60 overflow-y-auto">
        <div className={`${CARD_BG} ${CARD_BORDER} rounded-xl p-6 w-full max-w-lg`}>
          <h3 className="text-white font-semibold text-lg mb-2">Retrieve Archived Records</h3>
          <p className="text-zinc-400 text-sm mb-4">Find cleared submissions by the date they were reviewed.</p>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} mb-4`}>
            <div>
              <label className={LABEL_STYLE} htmlFor="retrieve-from">From</label>
              <input id="retrieve-from" type="date" value={retrieveFrom} onChange={(e) => setRetrieveFrom(e.target.value)} className={INPUT_DATE} />
            </div>
            <div>
              <label className={LABEL_STYLE} htmlFor="retrieve-to">To</label>
              <input id="retrieve-to" type="date" value={retrieveTo} onChange={(e) => setRetrieveTo(e.target.value)} className={INPUT_DATE} />
            </div>
          </div>
          {retrieveError && <p className="text-red-400 text-sm mb-4">{retrieveError}</p>}
          {retrievedRecords.length > 0 && (
            <div className="mb-4 max-h-64 overflow-y-auto space-y-2">
              {retrievedRecords.map((r) => (
                <div key={r.id} className="bg-zinc-700/50 rounded-lg p-3">
                  <div className="flex gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TAG_ARCHIVED}`}>archived</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_TAGS[r.status] || TAG_ARCHIVED}`}>{r.status}</span>
                  </div>
                  <p className="text-white text-sm">{r.submitted_by || 'Unknown'}</p>
                  <p className="text-zinc-400 text-xs">{r.email}</p>
                  {r.rejection_reason && <p className="text-zinc-500 text-xs mt-0.5">Reason: {r.rejection_reason}</p>}
                  <p className="text-zinc-600 text-xs mt-0.5">
                    Reviewed: {new Date(r.reviewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 justify-end flex-wrap">
            <button onClick={closeRetrieve} className={`px-4 py-2.5 rounded-lg text-sm ${BTN_SECONDARY}`}>Close</button>
            <button onClick={handleRetrieve} disabled={retrieveLoading} className={`px-4 py-2.5 rounded-lg text-sm ${BTN_PRIMARY} disabled:opacity-50`}>
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
  const renderCard = (submission) => {
    const statusTag = STATUS_TAGS[submission.status] || TAG_PENDING;
    return (
      <div
        key={submission.id}
        className={`${CARD_BG} ${CARD_BORDER} rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-white/20 active:ring-white/40 transition-shadow`}
        onClick={() => openSheet(submission)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openSheet(submission)}
        aria-label={`View submission from ${submission.submitted_by || submission.email || 'unknown'}`}
      >
        {(submission.status === 'pending' || submission.status === 'approved') && (
          <div className="relative">
            <img
              src={submission.image_url}
              alt={submission.submitted_by || 'Submission'}
              className="w-full object-cover"
              style={{ maxHeight: '280px' }}
            />
            <span className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full ${statusTag}`}>
              {submission.status === 'approved' ? 'Added to gallery' : submission.status}
            </span>
          </div>
        )}
        {submission.status === 'rejected' && (
          <div className="p-4 bg-red-500/10 flex items-center gap-3">
            <span className="text-2xl">✕</span>
            <div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusTag}`}>Rejected</span>
              {submission.rejection_reason && (
                <p className="text-zinc-400 text-xs mt-1 line-clamp-1">{submission.rejection_reason}</p>
              )}
            </div>
          </div>
        )}
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            {submission.submitted_by && (
              <p className="text-white text-sm font-medium truncate">{submission.submitted_by}</p>
            )}
            <p className="text-zinc-400 text-xs truncate">{submission.email}</p>
          </div>
          <span className="text-zinc-600 text-xs shrink-0">Tap to review</span>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Render: main
  // ---------------------------------------------------------------------------
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {renderBottomSheet()}
      {renderRetrievePanel()}

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Submissions</h1>
          <p className="text-zinc-400 text-sm">Review fan photo submissions before they appear in the gallery.</p>
        </div>
        <button onClick={() => setShowRetrieve(true)} className={`px-4 py-2.5 rounded-lg text-sm ${BTN_GHOST}`}>
          Retrieve archived
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-lg text-sm capitalize transition-colors ${
              filter === f ? 'bg-white text-black font-medium' : 'border border-zinc-600 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f === 'all' ? 'All' : `${f.charAt(0).toUpperCase() + f.slice(1)} (${countByStatus(f)})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-zinc-500 text-sm py-12 text-center">
          {filter === 'pending' ? 'No pending submissions. Check back later.' : `No ${filter} submissions.`}
        </div>
      )}

      {filtered.length > 0 && (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
          {filtered.map((s) => renderCard(s))}
        </div>
      )}
    </div>
  );
}
