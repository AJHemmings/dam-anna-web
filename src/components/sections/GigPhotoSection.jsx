import GigPhotosSlideshow from '../GigPhotosSlideshow';
import useGigVenueImages from '../../hooks/useGigVenueImages';

/**
 * Gig Venue Photos Section
 * 
 * Shows venue logo slideshow when upcoming gigs have images.
 * Falls back to a static "contact to book" image when no images are available.
 * Borderless design with rounded corners to match video carousel style.
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Uses isMobile prop from App.jsx for JS-driven responsive layout.
 * Mobile: Full width up to max, square aspect ratio
 * Desktop: Fixed dimensions with offset positioning
 */

// CUSTOMIZATION: Mobile max size
const MOBILE_MAX_WIDTH = 'max-w-[350px]';

// CUSTOMIZATION: Desktop fixed dimensions and offset
const DESKTOP_CLASSES = 'w-[350px] h-[350px] ml-50 mt-[-30px]';

export default function GigPhotosSection({ isMobile = false, onOpenContact }) {
  const { images, loading } = useGigVenueImages();
  const showFallback = !loading && images.length === 0;

  return (
    <div className={`${isMobile ? `w-full ${MOBILE_MAX_WIDTH} aspect-square` : DESKTOP_CLASSES} shadow-2xl/190 rounded-lg overflow-hidden flex-shrink-0`}>
      {showFallback ? (
        <button
          onClick={onOpenContact}
          className="w-full h-full cursor-pointer"
          aria-label="Contact us to book Dam Anna"
        >
          <img
            src="/fallback.png"
            alt="Contact us to book Dam Anna"
            className="w-full h-full object-cover"
          />
        </button>
      ) : (
        <GigPhotosSlideshow />
      )}
    </div>
  );
}