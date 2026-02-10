import { useState } from 'react';
import FramedSection from '../FramedSection';
import GallerySlideshow from '../GallerySlideshow';
import GalleryModal from '../modals/GalleryModal'; 

/**
 * GallerySection - Main photo gallery slideshow
 */

export default function GallerySection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleImageClick() {
    setIsModalOpen(true);
  }

  return (
    <>
      <FramedSection className="w-[400px] h-[400px] p-0 flex-shrink-0 ml-50 overflow-visible mt-[-50px]">
        <GallerySlideshow onImageClick={handleImageClick} />
      </FramedSection>

      {/* GalleryModal */}
      {isModalOpen && <GalleryModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}