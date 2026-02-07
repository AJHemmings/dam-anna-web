import { useState, useEffect } from 'react';

/**
 * GigPhotosSlideshow - Auto-sliding image carousel for gig photos
 * 
 * Configuration:
 * - SLIDE_DURATION: How long each image displays (milliseconds)
 * - TRANSITION_SPEED: How fast slide animation runs (milliseconds)
 * 
 * Images array structure:
 * - url: Direct link to hosted image
 * - alt: Accessibility description
 */

const GIG_PHOTOS = [
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtInX2AUMzQ2weQqNTvaZpSxvba7E_F4XMog&s', alt: 'Gig photo 1' },
  { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHnPUokmUSW2qg7dzzb2Z714FZDD4vsmSLHQ&s', alt: 'Gig photo 2' },
  { url: 'https://pbs.twimg.com/profile_images/501448840205959168/qEPC8G___400x400.jpeg', alt: 'Gig photo 3' },
];

const SLIDE_DURATION = 3000; // 3 seconds per image
const TRANSITION_SPEED = 1000; // 1 second transition

export default function GigPhotosSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // After transition completes, update index
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % GIG_PHOTOS.length);
        setIsTransitioning(false);
      }, TRANSITION_SPEED);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black/50">
      {GIG_PHOTOS.map((photo, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === currentIndex
              ? 'translate-x-0'
              : index === (currentIndex + 1) % GIG_PHOTOS.length
              ? 'translate-x-full'
              : '-translate-x-full'
          }`}
        >
          <img
            src={photo.url}
            alt={photo.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}