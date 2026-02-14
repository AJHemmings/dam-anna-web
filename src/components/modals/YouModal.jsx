import { useState, useEffect } from 'react';

/**
 * YouModal - Placeholder for user photo submission feature
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 * Mobile = default, Tablet = md (768px+), Desktop = lg (1024px+)
 * 
 * Future: Full photo submission interface with:
 * - Image upload
 * - Metadata input (date, location)
 * - Preview before submit
 * - Admin approval workflow via dashboard
 */

const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';
const ANIMATION_DURATION = 500;

// CUSTOMIZATION: Close button position
const CLOSE_BTN_TOP = 'top-20 md:top-20 lg:top-8';
const CLOSE_BTN_SIZE = 'text-3xl lg:text-4xl';

// CUSTOMIZATION: Modal width per breakpoint
const MODAL_WIDTH = 'w-full max-w-[700px]';

// CUSTOMIZATION: Modal padding per breakpoint
const MODAL_PADDING = 'p-6 md:p-8 lg:p-12';

// CUSTOMIZATION: Outer padding
const OUTER_PADDING = 'p-4 md:p-6 lg:p-8';

// CUSTOMIZATION: Heading size per breakpoint
const HEADING_SIZE = 'text-3xl md:text-4xl lg:text-6xl';

// CUSTOMIZATION: Body text size per breakpoint
const BODY_TEXT_SIZE = 'text-base md:text-lg lg:text-xl';

// CUSTOMIZATION: Secondary text size per breakpoint
const SECONDARY_TEXT_SIZE = 'text-sm md:text-base lg:text-lg';

// CUSTOMIZATION: Icon size per breakpoint
const ICON_SIZE = 'w-16 h-16 md:w-24 md:h-24 lg:w-30 lg:h-30';

export default function YouModal({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const body = document.body;
    const nav = document.getElementById('main-nav');
    const container = document.querySelector('.container');
    const main = document.querySelector('main');
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollbarWidth}px`;
    if (nav) nav.style.paddingRight = `${scrollbarWidth}px`;
    if (container) container.style.paddingRight = `${scrollbarWidth}px`;
    if (main) main.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      body.style.paddingRight = '';
      if (nav) nav.style.paddingRight = '';
      if (container) container.style.paddingRight = '';
      if (main) main.style.paddingRight = '';
      window.scrollTo(0, scrollY);
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
      className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-center justify-center ${OUTER_PADDING} transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined}}
      onClick={handleBackdropClick}
    >
      {/* Close button - below nav bar on mobile/tablet */}
      <button
        onClick={handleClose}
        className={`fixed ${CLOSE_BTN_TOP} right-4 md:right-6 lg:right-8 ${CLOSE_BTN_SIZE} text-white hover:text-gray-300 active:text-gray-400 transition-colors z-[10000] w-11 h-11 flex items-center justify-center`}
        aria-label="Close"
      >
        ×
      </button>

      <div 
        className={`relative ${MODAL_WIDTH} ${MODAL_PADDING} text-white text-center transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{borderImage: 'url(/boarder1.png) 60 stretch', borderWidth: '30px', borderStyle: 'solid', boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)'}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-black/70 -z-10 blur-sm"></div>
        <div className="relative z-10">
          <div className="mb-4 md:mb-6 flex justify-center">
            <img src="/icons/camera1.svg" alt="Send us your pics!" className={ICON_SIZE} />
          </div>
          <h2 className={`font-hero ${HEADING_SIZE} mb-4 md:mb-6`}>Send Us Your Pics</h2>
          <p className={`${BODY_TEXT_SIZE} text-gray-300 mb-3 md:mb-4`}>This feature is currently in development.</p>
          <p className={`${SECONDARY_TEXT_SIZE} text-gray-400`}>Soon you'll be able to submit your photos from our gigs! All submissions will be reviewed before appearing in the gallery.</p>
        </div>
      </div>
    </div>
  );
}
