import { useState, useEffect, useRef } from 'react';

/**
 * GalleryModal - Full-screen gallery view with thumbnail grid
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

export const GALLERY_IMAGES = [
  { 
    url: 'https://imagizer.imageshack.com/img924/5730/NKzt2p.jpg', 
    alt: '3times7 and Dam Anna at The Oval',
    date: '27-02-26',
    location: 'London, UK'
  },
 { 
    url: 'https://imagizer.imageshack.com/img924/3282/80YQww.jpg', 
    alt: 'Login Lounge Lobby',
    date: '11-02-26',
    location: 'Camberley, Surrey'
  },
  { 
    url: 'https://imagizer.imageshack.com/img921/3122/JkEN3y.jpg', 
    alt: 'Login Lounge Crowd',
    date: '11-02-26',
    location: 'Camberley, Surrey'
  },
  { 
    url: 'https://imagizer.imageshack.com/img924/8242/nxk5QU.jpg', 
    alt: 'Login Lounge Stage',
    date: '11-02-26',
    location: 'Camberley, Surrey'
  },
  { 
    url: 'https://imagizer.imageshack.com/img922/4269/swbJAF.jpg', 
    alt: 'Login Lounge Showcase',
    date: '06-02-26',
    location: 'Bracknell, Berkshire'
  },
  { 
    url: 'https://imagizer.imageshack.com/img921/1148/7KuT6U.jpg', 
    alt: 'Newton Pippin',
    date: '04-02-26',
    location: 'Bracknell, Berkshire'
  },
  { 
    url: 'https://imagizer.imageshack.com/img923/8763/TbBxxa.jpg', 
    alt: 'Feb Gigs!',
    date: '01-02-26',
    location: 'Bracknell, Berkshire'
  },
  { 
    url: 'https://imagizer.imageshack.com/img922/8733/nikTUE.jpg', 
    alt: 'Acoustic Couch',
    date: '16-07-25',
    location: 'Bracknell, Berkshire'
  },
  { 
    url: 'https://imagizer.imageshack.com/img922/6326/U8yGg6.jpg', 
    alt: 'South Hill Park Summer Jam',
    date: '12-07-25',
    location: 'Bracknell, Berkshire'
  },
];

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

      // Only trigger if horizontal movement is dominant (prevents conflict with vertical scroll)
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const isTouchDevice = useIsTouchDevice();

  // Navigation functions for enlarged view
  function goToNext() {
    setSelectedImage((prev) => (prev + 1) % GALLERY_IMAGES.length);
  }

  function goToPrev() {
    setSelectedImage((prev) => (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  }

  // Swipe support for enlarged image view
  const swipeRef = useSwipe({
    onSwipeLeft: goToNext,   // Swipe left = next image
    onSwipeRight: goToPrev,  // Swipe right = previous image
  });

  // Keyboard navigation for enlarged view
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

  // Lock body scroll when modal opens
  useEffect(() => {
    const scrollY = window.scrollY;
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Clear hover state when going back to grid from enlarged view
  useEffect(() => {
    if (selectedImage === null) {
      setHoveredIndex(null);
    }
  }, [selectedImage]);

  // Close modal when clicking backdrop
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
      {/* Close button - positioned below nav bar on mobile/tablet */}
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
          {/* Swipeable image container */}
          <div 
            ref={swipeRef}
            className="relative max-w-4xl max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={GALLERY_IMAGES[selectedImage].url}
              alt={GALLERY_IMAGES[selectedImage].alt}
              className="max-w-full max-h-[70vh] lg:max-h-[80vh] object-contain select-none"
              draggable={false}
            />

            {/* Metadata BELOW the image */}
            <div className="w-full bg-black/80 text-white p-3 lg:p-4 text-center mt-0">
              <p className={`font-semibold ${META_TITLE_SIZE}`}>
                {GALLERY_IMAGES[selectedImage].alt}
              </p>
              <p className={`${META_SUBTITLE_SIZE} text-gray-300`}>
                {GALLERY_IMAGES[selectedImage].date} · {GALLERY_IMAGES[selectedImage].location}
              </p>
              {/* Image counter */}
              <p className={`${META_SUBTITLE_SIZE} text-gray-500 mt-1`}>
                {selectedImage + 1} / {GALLERY_IMAGES.length}
              </p>
            </div>

            {/* Previous arrow */}
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-14 w-11 h-11 flex items-center justify-center text-white/70 hover:text-white active:text-gray-300 transition-colors"
              aria-label="Previous image"
            >
              <svg className="w-8 h-8 lg:w-10 lg:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next arrow */}
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
          
          <div className={`grid ${GRID_COLS} ${GRID_GAP}`}>
            {GALLERY_IMAGES.map((image, index) => (
              <div
                key={index}
                className="relative cursor-pointer group"
                onMouseEnter={() => !isTouchDevice && setHoveredIndex(index)}
                onMouseLeave={() => !isTouchDevice && setHoveredIndex(null)}
                onClick={() => setSelectedImage(index)}
              >
                {/* Thumbnail image */}
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className={`w-full aspect-square object-cover transition-transform duration-300 ${
                      hoveredIndex === index ? 'scale-110' : 'scale-100'
                    }`}
                  />
                </div>

                {/* Metadata overlay - DESKTOP ONLY (hover) */}
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
        </div>
      )}
    </div>
  );
}