import { useState, useEffect } from 'react';
import useSiteContent from '../../hooks/useSiteContent';

/**
 * AboutUsModal - About Us section in modal format
 * 
 * Content loaded from Supabase site_content table.
 * Falls back to empty state if database is unreachable.
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 */

const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';
const ANIMATION_DURATION = 500;

// CUSTOMIZATION: Close button position
const CLOSE_BTN_TOP = 'top-20 md:top-20 lg:top-8';
const CLOSE_BTN_SIZE = 'text-3xl lg:text-4xl';

// CUSTOMIZATION: Modal sizing
const MODAL_WIDTH = 'w-full max-w-[700px]';
const MODAL_PADDING = 'p-5 md:p-6 lg:p-8';
const OUTER_PADDING = 'p-4 md:p-6 lg:p-8';

// CUSTOMIZATION: Text sizes
const HEADING_SIZE = 'text-2xl md:text-3xl lg:text-4xl';
const BODY_TEXT_SIZE = 'text-sm md:text-base lg:text-[1.25rem]';

// CUSTOMIZATION: Loading/error state text size
const STATUS_TEXT_SIZE = 'text-sm md:text-lg lg:text-xl';

export default function AboutUsModal({ onClose }) {
  const { content, loading, error } = useSiteContent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  function handleClose() {
    setIsVisible(false);
    setTimeout(() => onClose(), ANIMATION_DURATION);
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-center justify-center ${OUTER_PADDING} transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined
      }}
      onClick={handleBackdropClick}
    >
      <button
        onClick={handleClose}
        className={`fixed ${CLOSE_BTN_TOP} right-4 md:right-6 lg:right-8 ${CLOSE_BTN_SIZE} text-white hover:text-gray-300 active:text-gray-400 transition-colors z-[10000] w-11 h-11 flex items-center justify-center`}
        aria-label="Close about us"
      >
        ×
      </button>

      <div 
        className={`relative ${MODAL_WIDTH} ${MODAL_PADDING} text-white ${BODY_TEXT_SIZE} leading-relaxed transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ 
          borderImage: 'url(/boarder1.webp) 60 stretch',
          borderWidth: '30px',
          borderStyle: 'solid',
          boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-black/70 -z-10 blur-sm"></div>

        <div className="relative z-10">
          <h2 className={`font-hero ${HEADING_SIZE} mb-4 md:mb-6 text-center`}>
            {content.about_us_heading || 'About Us'}
          </h2>
          
          {loading ? (
            <p className={`${STATUS_TEXT_SIZE} text-gray-400 text-center`}>Loading...</p>
          ) : error ? (
            <p className={`${STATUS_TEXT_SIZE} text-gray-400 text-center`}>Content coming soon!</p>
          ) : (
            <>
              {content.about_us_p1 && <p className="mb-4">{content.about_us_p1}</p>}
              {content.about_us_p2 && <p className="mb-4">{content.about_us_p2}</p>}
              {content.about_us_p3 && <p>{content.about_us_p3}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}