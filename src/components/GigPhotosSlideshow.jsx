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
  {GIG_PHOTOS.map((photo, index) => {
    const position = index === currentIndex ? 'current' 
      : index === (currentIndex + 1) % GIG_PHOTOS.length ? 'next' 
      : 'previous';
    
    return (
      <div
        key={index}
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
        />
      </div>
    );
  })}
</div>
  );
}