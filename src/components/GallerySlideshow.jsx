import { useState, useEffect } from 'react';
import useGalleryImages from '../hooks/useGalleryImages';

/**
 * GallerySlideshow - Auto-sliding image carousel with hover effects
 * 
 * Pulls images from Supabase gallery_images table.
 * 
 * Configuration:
 * - SLIDE_DURATION: How long each image displays (3000ms = 3 seconds)
 * - TRANSITION_SPEED: Slide animation speed (1000ms = 1 second)
 * 
 * Features:
 * - Hover to scale image and show metadata (date, location)
 * - Click to open gallery modal
 */

// CUSTOMIZATION: Slideshow timing
const SLIDE_DURATION = 3000;
const TRANSITION_SPEED = 1000;

export default function GallerySlideshow({ onImageClick }) {
  const { images, loading } = useGalleryImages();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isHovered, images]);

  if (loading || images.length === 0) return null;

  const currentPhoto = images[currentIndex];

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black/50 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onImageClick}
    >
      {images.map((photo, index) => (
        <div
          key={photo.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentIndex
              ? 'translate-x-0 opacity-100'
              : index === (currentIndex + 1) % images.length
              ? 'translate-x-full opacity-0'
              : '-translate-x-full opacity-0'
          }`}
        >
          <img
            src={photo.url}
            alt={photo.alt}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}

      <div 
        className={`absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 transition-all duration-300 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <p className="text-sm font-semibold">{currentPhoto.date}</p>
        <p className="text-xs text-gray-300">{currentPhoto.location}</p>
      </div>
    </div>
  );
}