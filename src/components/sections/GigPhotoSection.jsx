import FramedSection from '../FramedSection';
import GigPhotosSlideshow from '../GigPhotosSlideshow';

/**
 * Gig Venue Photos Section
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Mobile: Full width up to max, square aspect ratio
 * Desktop: Fixed dimensions with offset positioning
 */

// CUSTOMIZATION: Mobile/tablet max size (width constrained, height via aspect-square)
const MOBILE_MAX_WIDTH = 'max-w-[350px]';

// CUSTOMIZATION: Desktop fixed dimensions
const DESKTOP_SIZE = 'lg:w-[350px] lg:h-[350px]';

// CUSTOMIZATION: Desktop offset positioning
const DESKTOP_OFFSET = 'lg:ml-50 lg:mt-[-30px]';

export default function GigPhotosSection() {
  return (
    <FramedSection className={`w-full ${MOBILE_MAX_WIDTH} aspect-square ${DESKTOP_SIZE} p-0 flex-shrink-0 ${DESKTOP_OFFSET}`}>
      <GigPhotosSlideshow />
    </FramedSection>
  );
}
