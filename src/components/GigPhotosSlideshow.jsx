import { useState, useEffect } from 'react';
import useGigVenueImages from '../hooks/useGigVenueImages';

/**
 * GigPhotosSlideshow - Auto-sliding venue logo carousel
 * 
 * Shows venue logos for upcoming gigs. When no images are available,
 * renders nothing (parent component handles the fallback).
 * 
 * Configuration:
 * - SLIDE_DURATION: How long each image displays (milliseconds)
 * - TRANSITION_SPEED: How fast slide animation runs (milliseconds)
 */

// CUSTOMIZATION: Slideshow timing
const SLIDE_DURATION = 3000;
const TRANSITION_SPEED = 700;

export default function GigPhotosSlideshow() {
  const { images, loading } = useGigVenueImages();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [images]);

  if (loading || images.length === 0) return null;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black/50">
      {images.map((photo, index) => {
        const position = index === currentIndex ? 'current'
          : index === (currentIndex + 1) % images.length ? 'next'
          : 'previous';

        return (
          <div
            key={photo.url}
            className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              position === 'current'
                ? 'translate-x-0 opacity-100'
                : position === 'next'
                ? 'translate-x-full opacity-0'
                : '-translate-x-full opacity-0'
            }`}
          >
            <img
              src={photo.url}
              alt={photo.alt}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        );
      })}
    </div>
  );
}