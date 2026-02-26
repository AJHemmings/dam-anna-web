import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * VideoCarousel - 3D carousel for browsing video thumbnails
 * 
 * Desktop: Animated carousel — centre video is prominent, neighbours are
 * smaller, opaque and blurred. Videos slide smoothly between positions.
 * Mobile: Single video with swipe and arrow navigation.
 * Infinite loop through all videos. Click centre to open in modal.
 * 
 * Uses isMobile prop from App.jsx for layout decisions.
 */

// CUSTOMIZATION: Arrow button sizing
const ARROW_SIZE = 'w-11 h-11';
const ARROW_ICON_SIZE = 'w-8 h-8';

// CUSTOMIZATION: Title text size
const TITLE_SIZE = 'text-sm md:text-base lg:text-lg';

// CUSTOMIZATION: Mobile centre size
const MOBILE_CENTRE_SIZE = 'w-full max-w-[350px] aspect-video';

// CUSTOMIZATION: Swipe sensitivity
const SWIPE_THRESHOLD = 50;

// CUSTOMIZATION: YouTube thumbnail sizes used in srcset.
// hqdefault (480x360) always exists and is used as the primary src.
// maxresdefault (1280x720) is excluded — it does not exist for all videos.
const YOUTUBE_THUMBNAIL_SIZES = '(max-width: 768px) 350px, 400px';

/**
 * Returns img props for a video thumbnail.
 * YouTube videos get srcset with reliable thumbnail sizes.
 * Custom thumbnail_url values are returned as-is.
 */
function getThumbnailProps(video) {
  if (video.thumbnail_url) {
    return { src: video.thumbnail_url };
  }
  const id = video.videoId;
  return {
    src: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    srcSet: [
      `https://img.youtube.com/vi/${id}/mqdefault.jpg 320w`,
      `https://img.youtube.com/vi/${id}/hqdefault.jpg 480w`,
    ].join(', '),
    sizes: YOUTUBE_THUMBNAIL_SIZES,
  };
}

// CUSTOMIZATION: Desktop carousel dimensions
const CENTRE_WIDTH = 400;
const CENTRE_HEIGHT = 225;
const SIDE_SCALE = 0.7;
const GAP = 20;

/**
 * Calculate the style for each video based on its offset from centre.
 * offset 0 = centre, -1 = left, +1 = right, etc.
 */
function getCardStyle(offset) {
  if (offset === 0) {
    return {
      transform: 'translateX(0) scale(1)',
      opacity: 1,
      zIndex: 10,
      filter: 'blur(0px)',
    };
  }

  const direction = offset > 0 ? 1 : -1;
  const absOffset = Math.abs(offset);

  if (absOffset > 2) {
    return {
      transform: `translateX(${direction * (CENTRE_WIDTH + GAP) * 2}px) scale(0.5)`,
      opacity: 0,
      zIndex: 0,
      filter: 'blur(4px)',
    };
  }

  const translateX = direction * ((CENTRE_WIDTH / 2) + (CENTRE_WIDTH * SIDE_SCALE / 2) + GAP) * absOffset * 0.85;
  const scale = Math.max(SIDE_SCALE - (absOffset - 1) * 0.15, 0.5);
  const opacity = Math.max(0.5 - (absOffset - 1) * 0.25, 0.1);
  const blur = absOffset * 1.5;

  return {
    transform: `translateX(${translateX}px) scale(${scale})`,
    opacity,
    zIndex: 10 - absOffset,
    filter: `blur(${blur}px)`,
  };
}

export default function VideoCarousel({ videos, isMobile, onVideoSelect }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const carouselRef = useRef(null);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  }, [videos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  }, [videos.length]);

  // Swipe detection for mobile
  useEffect(() => {
    if (!isMobile) return;
    const el = carouselRef.current;
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
          goNext();
        } else {
          goPrev();
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
  }, [isMobile, goNext, goPrev]);

  if (videos.length === 0) return null;

  /**
   * Get the shortest offset from currentIndex to a given index,
   * accounting for wrapping (infinite loop).
   */
  function getOffset(index) {
    const len = videos.length;
    const diff = index - currentIndex;
    // Find shortest path around the loop
    if (Math.abs(diff) <= len / 2) return diff;
    return diff > 0 ? diff - len : diff + len;
  }

  function LeftArrow() {
    return (
      <button
        onClick={goPrev}
        className={`${ARROW_SIZE} flex items-center justify-center text-white/70 hover:text-white active:text-gray-300 transition-colors flex-shrink-0`}
        aria-label="Previous video"
      >
        <svg className={ARROW_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    );
  }

  function RightArrow() {
    return (
      <button
        onClick={goNext}
        className={`${ARROW_SIZE} flex items-center justify-center text-white/70 hover:text-white active:text-gray-300 transition-colors flex-shrink-0`}
        aria-label="Next video"
      >
        <svg className={ARROW_ICON_SIZE} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  if (isMobile) {
    const centreVideo = videos[currentIndex];
    return (
      <div ref={carouselRef} className="flex items-center justify-center gap-2">
        <LeftArrow />
        <button
          onClick={() => onVideoSelect(centreVideo)}
          className={`${MOBILE_CENTRE_SIZE} flex-shrink-0 cursor-pointer group relative overflow-hidden rounded-lg shadow-2xl/190`}
          aria-label={`Play ${centreVideo.title}`}
        >
          <img
            {...getThumbnailProps(centreVideo)}
            alt={centreVideo.title}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <svg className="w-12 h-12 text-white/90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className={`absolute bottom-0 left-0 right-0 bg-black/70 text-white ${TITLE_SIZE} p-2 text-center`}>
            {centreVideo.title}
          </p>
        </button>
        <RightArrow />
      </div>
    );
  }

  // Desktop: Animated 3D carousel
  return (
    <div ref={carouselRef} className="flex items-center justify-center gap-4">
      <LeftArrow />

      <div
        className="relative overflow-hidden"
        style={{ width: `${CENTRE_WIDTH + (CENTRE_WIDTH * SIDE_SCALE + GAP) * 2}px`, height: `${CENTRE_HEIGHT + 40}px` }}
      >
        {videos.map((video, index) => {
          const offset = getOffset(index);
          const style = getCardStyle(offset);
          const isCentre = offset === 0;

          return (
            <div
              key={video.id}
              className="absolute top-0 left-1/2 transition-all duration-500 ease-in-out"
              style={{
                width: `${CENTRE_WIDTH}px`,
                height: `${CENTRE_HEIGHT}px`,
                marginLeft: `-${CENTRE_WIDTH / 2}px`,
                transform: style.transform,
                opacity: style.opacity,
                zIndex: style.zIndex,
                filter: style.filter,
                pointerEvents: isCentre ? 'auto' : 'none',
              }}
            >
              <button
                onClick={isCentre ? () => onVideoSelect(video) : undefined}
                className={`w-full h-full relative overflow-hidden rounded-lg shadow-xl/190 ${isCentre ? 'cursor-pointer group' : 'cursor-default'}`}
                tabIndex={isCentre ? 0 : -1}
                aria-label={isCentre ? `Play ${video.title}` : undefined}
              >
                <img
                  {...getThumbnailProps(video)}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {isCentre && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <svg className="w-16 h-16 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className={`absolute bottom-0 left-0 right-0 bg-black/70 text-white ${TITLE_SIZE} p-2 text-center`}>
                      {video.title}
                    </p>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <RightArrow />
    </div>
  );
}