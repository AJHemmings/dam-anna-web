import { useState } from 'react';
import FramedSection from '../FramedSection';
import GallerySlideshow from '../GallerySlideshow';
// import GalleryModal from '../GalleryModal'; // TODO: Create in Phase 3

/**
 * GallerySection - Main photo gallery slideshow
 * Size: Square, matches PreviousGigsSection height
 * Position: To the right of PreviousGigsSection
 * Click: Opens gallery modal (Phase 3)
 */

export default function GallerySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleImageClick() {
    setIsModalOpen(true);
    // TODO: Open modal in Phase 3
    console.log('Gallery clicked - modal will open here in Phase 3');
  }

  return (
    <>
      <FramedSection className="w-[400px] h-[400px] p-0 flex-shrink-0 ml-50 overflow-visible mt-[-50px]">
        <GallerySlideshow onImageClick={handleImageClick} />
      </FramedSection>

      {/* TODO: Add GalleryModal here in Phase 3 */}
      {/* {isModalOpen && <GalleryModal onClose={() => setIsModalOpen(false)} />} */}
    </>
  );
}