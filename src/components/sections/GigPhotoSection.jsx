import FramedSection from '../FramedSection';
import GigPhotosSlideshow from '../GigPhotosSlideshow';

/**
 * Gig Venue Photos Section
 */

export default function GigPhotosSection() {
  return (
    <FramedSection className="w-[350px] h-[350px] p-0 flex-shrink-0 ml-50 mt-[-30px]">
      <GigPhotosSlideshow />
    </FramedSection>
  );
}