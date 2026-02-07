import { useState, useEffect } from 'react';

/**
 * GallerySlideshow - Auto-sliding image carousel with hover effects
 * 
 * Configuration:
 * - SLIDE_DURATION: How long each image displays (3000ms = 3 seconds)
 * - TRANSITION_SPEED: Slide animation speed (1000ms = 1 second)
 * 
 * Features:
 * - Hover to scale image and show metadata (date, location)
 * - Click to open gallery modal
 * 
 * Images array structure:
 * - url: Direct link to hosted image
 * - alt: Accessibility description
 * - date: Photo date (e.g., "2024-02-15")
 * - location: Photo location (e.g., "London, UK")
 */

const GALLERY_PHOTOS = [
  { 
    url: 'https://cdn.prod.website-files.com/655e0fa544c67c1ee5ce01c7/655e0fa544c67c1ee5ce0eb9_how-to-get-gigs-complete-guide-for-musicians.jpeg', 
    alt: 'Gallery photo 1',
    date: '2024-01-15',
    location: 'London, UK'
  },
  { 
    url: 'https://glasgowguardian.co.uk/wp-content/uploads/2021/09/postldgig_mu_cu-Credit_-Unsplash-Anthony-Delanoix.jpg', 
    alt: 'Gallery photo 2',
    date: '2024-01-20',
    location: 'Manchester, UK'
  },
  { 
    url: 'https://www.lastminutemusicians.com/how_to_get_gigs/wp-content/uploads/2013/04/live-music-gig.jpg', 
    alt: 'Gallery photo 3',
    date: '2024-01-25',
    location: 'Brighton, UK'
  },
];

const SLIDE_DURATION = 3000; // 3 seconds per image
const TRANSITION_SPEED = 1000; // 1 second transition

export default function GallerySlideshow({ onImageClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Only auto-advance if not hovered (pause on hover)
    if (isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % GALLERY_PHOTOS.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [isHovered]);

  const currentPhoto = GALLERY_PHOTOS[currentIndex];

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-black/50 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onImageClick}
    >
      {/* Image with slide and scale animation */}
      {GALLERY_PHOTOS.map((photo, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentIndex
              ? 'translate-x-0 opacity-100'
              : index === (currentIndex + 1) % GALLERY_PHOTOS.length
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
          />
        </div>
      ))}

      {/* Metadata overlay - shows on hover */}
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