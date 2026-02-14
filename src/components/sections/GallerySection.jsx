import FramedSection from '../FramedSection';
import GallerySlideshow from '../GallerySlideshow';

/**
 * GallerySection - Main photo gallery slideshow
 * 
 * NOTE: The GalleryModal is now rendered in App.jsx (single source of truth).
 * Clicking the slideshow triggers onOpenGallery which App handles.
 * This ensures the modal always renders at the top level with correct z-index.
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Mobile: Full width up to max, square aspect ratio
 * Desktop: Fixed dimensions with offset positioning
 */

// CUSTOMIZATION: Mobile/tablet max size
const MOBILE_MAX_WIDTH = 'max-w-[400px]';

// CUSTOMIZATION: Desktop fixed dimensions
const DESKTOP_SIZE = 'lg:w-[400px] lg:h-[400px]';

// CUSTOMIZATION: Desktop offset positioning
const DESKTOP_OFFSET = 'lg:ml-50 lg:mt-[-50px]';

export default function GallerySection({ onOpenGallery }) {
  return (
    <FramedSection className={`w-full ${MOBILE_MAX_WIDTH} aspect-square ${DESKTOP_SIZE} p-0 flex-shrink-0 ${DESKTOP_OFFSET} overflow-visible`}>
      <GallerySlideshow onImageClick={onOpenGallery} />
    </FramedSection>
  );
}
