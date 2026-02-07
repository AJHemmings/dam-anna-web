import FramedSection from '../FramedSection';
import GigPhotosSlideshow from '../GigPhotosSlideshow';

/**
 * GigPhotosSection - Square photo slideshow positioned to the right
 * Size: Configurable square (default 350x350px)
 * Position: Right side of the page
 */

export default function GigPhotosSection() {
  return (
    <FramedSection className="w-[350px] h-[350px] p-0 flex-shrink-0 ml-50">
      <GigPhotosSlideshow />
    </FramedSection>
  );
}