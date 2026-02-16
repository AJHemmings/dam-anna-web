import GallerySlideshow from '../GallerySlideshow';

/**
 * GallerySection - Main photo gallery slideshow
 * 
 * Borderless design with rounded corners to match video carousel style.
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Uses isMobile prop from App.jsx for JS-driven responsive layout.
 * Mobile: Full width up to max, square aspect ratio
 * Desktop: Fixed dimensions with offset positioning
 * 
 * NOTE: GalleryModal is rendered in App.jsx (single source of truth).
 */

// CUSTOMIZATION: Mobile max size
const MOBILE_MAX_WIDTH = 'max-w-[400px]';

// CUSTOMIZATION: Desktop fixed dimensions and offset
const DESKTOP_CLASSES = 'w-[400px] h-[400px] ml-50 mt-[-50px]';

export default function GallerySection({ onOpenGallery, isMobile = false }) {
  return (
    <div className={`${isMobile ? `w-full ${MOBILE_MAX_WIDTH} aspect-square` : DESKTOP_CLASSES} shadow-2xl/190 rounded-lg overflow-hidden flex-shrink-0`}>
      <GallerySlideshow onImageClick={onOpenGallery} />
    </div>
  );
}