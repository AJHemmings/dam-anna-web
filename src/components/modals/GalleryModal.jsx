import { useState, useEffect, useRef } from 'react';
import useGalleryImages from '../../hooks/useGalleryImages';

/**
 * GalleryModal - Full-screen gallery view with thumbnail grid
 * 
 * Pulls images from Supabase gallery_images table.
 * 
 * Features:
 * - Dark grey scrollable background
 * - Grid of thumbnails (responsive: 2 cols mobile, 3 cols desktop)
 * - DESKTOP ONLY: Hover thumbnail scales up and shows metadata overlay
 * - MOBILE/TABLET: No hover metadata on thumbnails (prevents sticky overlay bug)
 * - Click thumbnail: shows enlarged view with metadata BELOW the image
 * - SWIPE: Swipe left/right on enlarged image to navigate between photos
 * - ARROWS: Previous/next arrows on enlarged view (desktop + mobile)
 * - Click outside or close button: exits modal
 * - Locks body scroll when open
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 */

// CUSTOMIZATION: Backdrop appearance
const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';

// CUSTOMIZATION: Gallery title size per breakpoint
const TITLE_SIZE = 'text-3xl md:text-5xl lg:text-8xl';

// CUSTOMIZATION: Grid columns per breakpoint
const GRID_COLS = 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3';

// CUSTOMIZATION: Grid gap per breakpoint
const GRID_GAP = 'gap-3 md:gap-4 lg:gap-6';

// CUSTOMIZATION: Grid padding per breakpoint
const GRID_PADDING = 'px-4 md:px-6 lg:px-8';

// CUSTOMIZATION: Close button position (top value clears the nav bar)
const CLOSE_BTN_TOP = 'top-20 md:top-20 lg:top-8';
const CLOSE_BTN_SIZE = 'text-3xl md:text-3xl lg:text-4xl';

// CUSTOMIZATION: Enlarged image metadata text size
const META_TITLE_SIZE = 'text-xs md:text-sm lg:text-base';
const META_SUBTITLE_SIZE = 'text-xs md:text-xs lg:text-sm';

// CUSTOMIZATION: Swipe sensitivity (minimum px distance to trigger swipe)
const SWIPE_THRESHOLD = 50;

// CUSTOMIZATION: Loading/error state text size
const STATUS_TEXT_SIZE = 'text-sm md:text-lg lg:text-xl';

/**
 * Detect if the device uses a coarse pointer (touch-primary).
 * Used to disable hover metadata on thumbnails for mobile/tablet.
 */
function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(pointer: coarse)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    function handleChange(e) {
      setIsTouch(e.matches);
    }
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isTouch;
}

/**
 * Custom hook for swipe detection on touch devices.
 * Returns a ref to attach to the swipeable element.
 * Calls onSwipeLeft/onSwipeRight when a horizontal swipe is detected.
 */
function useSwipe({ onSwipeLeft, onSwipeRight }) {
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    function handleTouchStart(e) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
      if (touchStartX.current === null) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX < 0) {
          onSwipeLeft();
        } else {
          onSwipeRight();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    }

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight]);

  return elementRef;
}

export default function GalleryModal({ onClose }) {
  const { images, loading, error } = useGalleryImages();
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const isTouchDevice = useIsTouchDevice();

  function goToNext() {
    setSelectedImage((prev) => (prev + 1) % images.length);
  }

  function goToPrev() {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  }

  const swipeRef = useSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
  });

  useEffect(() => {
    if (selectedImage === null) return;

    function handleKeyDown(e) {
      if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'Escape') setSelectedImage(null);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (selectedImage === null) {
      setHoveredIndex(null);
    }
  }, [selectedImage]);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      if (selectedImage !== null) {
        setSelectedImage(null);
      } else {
        onClose();
      }
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} supports-[backdrop-filter]:bg-transparent`}
      style={{
        backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined
      }}
      onClick={handleBackdropClick}
    >
      <button
        onClick={onClose}
        className={`fixed ${CLOSE_BTN_TOP} right-4 md:right-6 lg:right-8 ${CLOSE_BTN_SIZE} text-white hover:text-gray-300 active:text-gray-400 transition-colors z-[10000] w-11 h-11 flex items-center justify-center`}
        aria-label="Close gallery"
      >
        ×
      </button>

      {/* Enlarged Image View */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 lg:p-8 bg-black/80 z-[9999]"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            ref={swipeRef}
            className="relative max-w-4xl max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImage].url}
              alt={images[selectedImage].alt}
              className="max-w-full max-h-[70vh] lg:max-h-[80vh] object-contain select-none"
              draggable={false}
            />

            <div className="w-full bg-black/80 text-white p-3 lg:p-4 text-center mt-0">
              <p className={`font-semibold ${META_TITLE_SIZE}`}>
                {images[selectedImage].alt}
              </p>
              <p className={`${META_SUBTITLE_SIZE} text-gray-300`}>
                {images[selectedImage].date} · {images[selectedImage].location}
              </p>
              <p className={`${META_SUBTITLE_SIZE} text-gray-500 mt-1`}>
                {selectedImage + 1} / {images.length}
              </p>
            </div>

            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-14 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white active:text-gray-300 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-14 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white active:text-gray-300 transition-colors"
              aria-label="Next image"
            >
              <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Thumbnail Grid */}
      {selectedImage === null && (
        <div className={`container mx-auto ${GRID_PADDING} pt-24 lg:pt-16 pb-8`}>
          <h2 className={`font-hero text-white ${TITLE_SIZE} mb-6 lg:mb-8 text-center`}>G a l l e r y</h2>
          
          {loading ? (
            <p className={`font-hero ${STATUS_TEXT_SIZE} text-gray-400 text-center`}>Loading gallery...</p>
          ) : error || images.length === 0 ? (
            <p className={`font-hero ${STATUS_TEXT_SIZE} text-gray-400 text-center`}>Gallery coming soon!</p>
          ) : (
            <div className={`grid ${GRID_COLS} ${GRID_GAP}`}>
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative cursor-pointer group"
                  onMouseEnter={() => !isTouchDevice && setHoveredIndex(index)}
                  onMouseLeave={() => !isTouchDevice && setHoveredIndex(null)}
                  onClick={() => setSelectedImage(index)}
                >
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className={`w-full aspect-square object-cover transition-transform duration-300 ${
                        hoveredIndex === index ? 'scale-110' : 'scale-100'
                      }`}
                    />
                  </div>

                  {!isTouchDevice && (
                    <div 
                      className={`absolute bottom-0 left-0 right-0 bg-black/80 text-white p-3 rounded-b-lg transition-all duration-300 ${
                        hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                      }`}
                    >
                      <p className="text-sm font-semibold">{image.date}</p>
                      <p className="text-xs text-gray-300">{image.location}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}