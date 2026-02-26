import { useState, useEffect, useRef } from 'react';
import { useUserSubmissions } from '../../hooks/useUserSubmissions';

/**
 * YouModal
 *
 * Public-facing photo submission form. Allows fans to upload photos from gigs
 * for admin review before appearing in the gallery.
 *
 * RESPONSIVE STRATEGY:
 * Single column form throughout. Max width constrained by MODAL_WIDTH.
 * Modal scrolls internally on small screens -- the outer wrapper locks the
 * background scroll and the inner card overflows vertically as needed.
 * No isMobile prop needed -- layout is identical across breakpoints,
 * only spacing changes via Tailwind classes.
 *
 * SCROLL LOCK:
 * overflow:hidden is applied to <html> on mount and restored on unmount.
 * This matches the pattern used by GalleryModal and VideoModal.
 *
 * CUSTOMIZATION POINTS:
 * - BLUR_AMOUNT: backdrop blur intensity
 * - DARKNESS_OVERLAY: backdrop tint
 * - MODAL_WIDTH: max width of the modal card
 * - MODAL_PADDING: inner padding per breakpoint
 * - ACCEPTED_TYPES: allowed file MIME types
 * - MAX_FILE_SIZE_MB: client-side file size cap
 */

// CUSTOMIZATION: Backdrop
const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';
const ANIMATION_DURATION = 500;

// CUSTOMIZATION: Close button
// top-4 on mobile keeps the button within the viewport and away from the modal card top edge.
// lg:top-8 gives breathing room on desktop where the card is centred with more space above.
const CLOSE_BTN_TOP = 'top-4 md:top-6 lg:top-8';
const CLOSE_BTN_SIZE = 'text-3xl lg:text-4xl';

// CUSTOMIZATION: Modal dimensions
const MODAL_WIDTH = 'w-full max-w-[700px]';
// p-4 on mobile reclaims width on 320px screens where the border image already consumes 60px.
// Padding scales up on larger screens.
const MODAL_PADDING = 'p-4 sm:p-6 md:p-8 lg:p-12';
// OUTER_PADDING: horizontal padding only on mobile -- vertical scroll handles spacing top/bottom.
const OUTER_PADDING = 'px-3 py-4 sm:px-4 sm:py-6 md:p-6 lg:p-8';

// CUSTOMIZATION: Typography
const HEADING_SIZE = 'text-3xl md:text-4xl lg:text-6xl';
const BODY_TEXT_SIZE = 'text-base md:text-lg lg:text-xl';
const LABEL_SIZE = 'text-sm md:text-base';

// CUSTOMIZATION: Icon
// lg:w-30 is not a valid Tailwind class -- corrected to lg:w-32 lg:h-32.
const ICON_SIZE = 'w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32';

// CUSTOMIZATION: File validation
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
const MAX_FILE_SIZE_MB = 20;

// CUSTOMIZATION: Styles
const INPUT_STYLE =
  'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors text-sm md:text-base';
const BTN_PRIMARY =
  'w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-zinc-200 active:bg-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const BTN_SECONDARY =
  'w-full border border-white/30 text-white py-3 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors';
const DROP_ZONE_BASE =
  'relative border-2 border-dashed rounded-lg p-6 md:p-8 text-center transition-colors cursor-pointer';
const DROP_ZONE_IDLE = 'border-white/30 hover:border-white/60 hover:bg-white/5';
const DROP_ZONE_ACTIVE = 'border-white bg-white/10';
const DROP_ZONE_ERROR = 'border-red-400 bg-red-400/10';

export default function YouModal({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // Form state
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Privacy checkbox state
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Honeypot -- controlled state, never shown to users, bots fill it in.
  // ref-based honeypot was dropped in Session 6 (null at submit time due to re-renders).
  const [honeypot, setHoneypot] = useState('');
  const fileInputRef = useRef(null);

  const { submitPhoto } = useUserSubmissions({ adminMode: false });

  // Mount animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Scroll lock -- applied to <html> on mount, restored on unmount.
  // Matches the pattern used by GalleryModal and VideoModal.
  useEffect(() => {
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    const prevPaddingRight = html.style.paddingRight;

    // Compensate for scrollbar width to prevent layout shift on desktop.
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    if (scrollbarWidth > 0) {
      html.style.paddingRight = `${scrollbarWidth}px`;
    }
    html.style.overflow = 'hidden';

    return () => {
      html.style.overflow = prevOverflow;
      html.style.paddingRight = prevPaddingRight;
    };
  }, []);

  // Revoke object URL on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleClose() {
    setIsVisible(false);
    setTimeout(() => onClose(), ANIMATION_DURATION);
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) handleClose();
  }

  // ---------------------------------------------------------------------------
  // File validation
  // ---------------------------------------------------------------------------
  function validateFile(candidate) {
    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      return 'Please upload a JPEG, PNG, WebP, or HEIC image.';
    }
    if (candidate.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File must be under ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  }

  function applyFile(candidate) {
    const err = validateFile(candidate);
    if (err) {
      setFileError(err);
      setFile(null);
      setPreview(null);
      return;
    }
    setFileError(null);
    setFile(candidate);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(candidate));
  }

  // ---------------------------------------------------------------------------
  // Drag and drop handlers (desktop only -- mobile uses file picker directly)
  // ---------------------------------------------------------------------------
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
    const dropped = e.dataTransfer.files[0];
    if (dropped) applyFile(dropped);
  }

  function handleFileInput(e) {
    const picked = e.target.files[0];
    if (picked) applyFile(picked);
  }

  function handleRemoveFile() {
    setFile(null);
    setFileError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------
  async function handleSubmit(e) {
    if (honeypot !== '') {
      setSubmitted(true);
      return;
    }

    if (!file) {
      setFileError('Please select a photo to submit.');
      return;
    }
    if (!email.trim()) {
      setSubmitError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const result = await submitPhoto({ file, email, name, date, location });
    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setSubmitError(
        result.message || 'Something went wrong. Please try again.'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Render: success state
  // ---------------------------------------------------------------------------
  if (submitted) {
    return (
      <div
        className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-start justify-center ${OUTER_PADDING} transition-opacity duration-500 opacity-100`}
        style={{
          backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)')
            ? 'rgb(55, 65, 81)'
            : undefined,
        }}
        onClick={handleBackdropClick}
      >
        {/* Close button -- fixed so it stays visible during scroll */}
        <button
          onClick={handleClose}
          className={`fixed ${CLOSE_BTN_TOP} right-4 md:right-6 lg:right-8 ${CLOSE_BTN_SIZE} text-white hover:text-gray-300 active:text-gray-400 transition-colors z-[10000] w-11 h-11 flex items-center justify-center`}
          aria-label="Close"
        >
          ×
        </button>
        <div
          className={`relative ${MODAL_WIDTH} ${MODAL_PADDING} text-white text-center transition-all duration-500 opacity-100 scale-100`}
          style={{
            borderImage: 'url(/boarder1.webp) 60 stretch',
            borderWidth: '30px',
            borderStyle: 'solid',
            boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-black/70 -z-10 blur-sm" />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-3xl">🎸</span>
            </div>
            <h2 className={`font-hero ${HEADING_SIZE}`}>Thanks!</h2>
            <p className={`${BODY_TEXT_SIZE} text-gray-300`}>
              Your photo has been submitted. We'll review it and add it to the
              gallery if it makes the cut.
            </p>
            <button
              onClick={handleClose}
              className={BTN_PRIMARY}
              style={{ marginTop: '0.5rem' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: form state
  // ---------------------------------------------------------------------------
  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-start justify-center ${OUTER_PADDING} transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{
        backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)')
          ? 'rgb(55, 65, 81)'
          : undefined,
      }}
      onClick={handleBackdropClick}
    >
      {/* Close button -- fixed so it stays visible during scroll */}
      <button
        onClick={handleClose}
        className={`fixed ${CLOSE_BTN_TOP} right-4 md:right-6 lg:right-8 ${CLOSE_BTN_SIZE} text-white hover:text-gray-300 active:text-gray-400 transition-colors z-[10000] w-11 h-11 flex items-center justify-center`}
        aria-label="Close"
      >
        ×
      </button>

      <div
        className={`relative ${MODAL_WIDTH} ${MODAL_PADDING} text-white transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          borderImage: 'url(/boarder1.webp) 60 stretch',
          borderWidth: '30px',
          borderStyle: 'solid',
          boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-black/70 -z-10 blur-sm" />
        <div className="relative z-10">
          {/* Header */}
          <div className="mb-6 flex justify-center">
            <img src="/icons/camera1.svg" alt="" className={ICON_SIZE} />
          </div>
          <h2 className={`font-hero ${HEADING_SIZE} mb-2 text-center`}>
            Send Us Your Pics
          </h2>
          <p
            className={`${BODY_TEXT_SIZE} text-gray-300 text-center mb-6 md:mb-8`}
          >
            Shot something at one of our gigs? We'd love to see it. Submit your
            photo below and we'll add it to the gallery if it makes the cut.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {/* Honeypot -- hidden from real users */}
            <div
              style={{
                position: 'absolute',
                left: '-9999px',
                opacity: 0,
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="new-password"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  opacity: 0,
                  pointerEvents: 'none',
                }}
                aria-hidden="true"
              />
            </div>

            {/* Drop zone / file picker
                Clicking the zone triggers the hidden file input on all devices.
                Drag and drop works on desktop. On mobile the native file picker
                opens directly -- no drag-and-drop language shown. */}
            <div className="mb-5">
              {!file ? (
                <div
                  className={`${DROP_ZONE_BASE} ${fileError ? DROP_ZONE_ERROR : isDragging ? DROP_ZONE_ACTIVE : DROP_ZONE_IDLE}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && fileInputRef.current?.click()
                  }
                  aria-label="Choose a photo"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <span className="text-3xl">📷</span>
                    <p className={`${BODY_TEXT_SIZE} text-white/80`}>
                      Choose a photo
                    </p>
                    <p className="text-xs text-white/40">
                      JPEG, PNG, WebP or HEIC up to {MAX_FILE_SIZE_MB}MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                  {/* Remove button: 44x44px touch target to meet minimum standard */}
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-11 h-11 flex items-center justify-center hover:bg-black transition-colors text-lg leading-none"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              )}
              {fileError && (
                <p className="mt-2 text-red-400 text-sm">{fileError}</p>
              )}
            </div>

            {/* Email -- required */}
            <div className="mb-4">
              <label
                className={`block ${LABEL_SIZE} text-white/70 mb-1`}
                htmlFor="submission-email"
              >
                Email address{' '}
                <span className="text-white/40 text-xs">(required)</span>
              </label>
              <input
                id="submission-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={INPUT_STYLE}
                autoComplete="email"
              />
            </div>

            {/* Name -- optional */}
            <div className="mb-4">
              <label
                className={`block ${LABEL_SIZE} text-white/70 mb-1`}
                htmlFor="submission-name"
              >
                Your name{' '}
                <span className="text-white/40 text-xs">(optional)</span>
              </label>
              <input
                id="submission-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we credit you?"
                className={INPUT_STYLE}
                autoComplete="name"
              />
            </div>

            {/* Date -- optional */}
            <div className="mb-4">
              <label
                className={`block ${LABEL_SIZE} text-white/70 mb-1`}
                htmlFor="submission-date"
              >
                Date of the gig{' '}
                <span className="text-white/40 text-xs">(optional)</span>
              </label>
              <input
                id="submission-date"
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. 12 Jan 2025"
                className={INPUT_STYLE}
              />
            </div>

            {/* Location -- optional */}
            <div className="mb-6">
              <label
                className={`block ${LABEL_SIZE} text-white/70 mb-1`}
                htmlFor="submission-location"
              >
                Location{' '}
                <span className="text-white/40 text-xs">(optional)</span>
              </label>
              <input
                id="submission-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. The Joiners, Southampton"
                className={INPUT_STYLE}
              />
            </div>

            {/* Submit error */}
            {submitError && (
              <p className="mb-4 text-red-400 text-sm text-center">
                {submitError}
              </p>
            )}

            {/* Privacy consent checkbox
                The label wraps the checkbox and text to maximise the tap target
                area on mobile. The checkbox itself is 16px but the full label
                line height gives an adequate touch target on all screen sizes. */}
            <div className="mb-4">
              <label
                htmlFor="privacy-consent"
                className="flex items-start gap-3 cursor-pointer"
              >
                <input
                  id="privacy-consent"
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 shrink-0 accent-white cursor-pointer"
                />
                <span className="text-xs text-white/50 leading-relaxed">
                  I agree to the{' '}
                  <a
                    href="/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-white/70 hover:text-white transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    privacy policy
                  </a>
                  . My email is only used to manage my submission.
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="button"
              disabled={submitting || !privacyAccepted}
              className={BTN_PRIMARY}
              onClick={handleSubmit}
            >
              {submitting ? 'Uploading...' : 'Submit Photo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
