import FramedSection from '../FramedSection';
import GigPhotosSlideshow from '../GigPhotosSlideshow';

/**
 * Gig Venue Photos Section
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

export default function GigPhotosSection({ isMobile = false }) {
  return (
    <FramedSection className={`${isMobile ? `w-full ${MOBILE_MAX_WIDTH} aspect-square` : DESKTOP_CLASSES} p-0 flex-shrink-0`}>
      <GigPhotosSlideshow />
    </FramedSection>
  );
}
