import { useState, useEffect } from 'react';

/**
 * AboutUsModal - About Us section in modal format
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 * Mobile = default, Tablet = md (768px+), Desktop = lg (1024px+)
 * 
 * Future: Content may be pulled from database for admin editing
 */

// CUSTOMIZATION: Appearance settings
const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';
const ANIMATION_DURATION = 500;

// CUSTOMIZATION: Close button position (top value clears nav bar on mobile/tablet)
const CLOSE_BTN_TOP = 'top-20 md:top-20 lg:top-8';
const CLOSE_BTN_SIZE = 'text-3xl lg:text-4xl';

// CUSTOMIZATION: Modal width per breakpoint
const MODAL_WIDTH = 'w-full max-w-[700px]';

// CUSTOMIZATION: Modal padding per breakpoint
const MODAL_PADDING = 'p-5 md:p-6 lg:p-8';

// CUSTOMIZATION: Outer padding (space between modal and screen edge)
const OUTER_PADDING = 'p-4 md:p-6 lg:p-8';

// CUSTOMIZATION: Heading size per breakpoint
const HEADING_SIZE = 'text-2xl md:text-3xl lg:text-4xl';

// CUSTOMIZATION: Body text size per breakpoint
const BODY_TEXT_SIZE = 'text-sm md:text-base lg:text-[1.25rem]';

export default function AboutUsModal({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger fade-in animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll when modal opens
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
      className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-center justify-center ${OUTER_PADDING} transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined
      }}
      onClick={handleBackdropClick}
    >
      {/* Close button - below nav bar on mobile/tablet */}
      <button
        onClick={handleClose}
        className={`fixed ${CLOSE_BTN_TOP} right-4 md:right-6 lg:right-8 ${CLOSE_BTN_SIZE} text-white hover:text-gray-300 active:text-gray-400 transition-colors z-[10000] w-11 h-11 flex items-center justify-center`}
        aria-label="Close about us"
      >
        ×
      </button>

      {/* Framed content container */}
      <div 
        className={`relative ${MODAL_WIDTH} ${MODAL_PADDING} text-white ${BODY_TEXT_SIZE} leading-relaxed transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ 
          borderImage: 'url(/boarder1.png) 60 stretch',
          borderWidth: '30px',
          borderStyle: 'solid',
          boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/70 -z-10 blur-sm"></div>

        {/* Content */}
        <div className="relative z-10">
          <h2 className={`font-hero ${HEADING_SIZE} mb-4 md:mb-6 text-center`}>About Us</h2>
          
          <p className="mb-4">
            Dam Anna is a dynamic music duo known for their electrifying performances and genre-blending sound. Formed in 2025, the band consists of lead vocalist Hanna Dixon and guitarist Adam Hemmings.
          </p>

          <p className="mb-4">
            Their music combines elements of soul, rock, and punk, creating a unique and captivating experience for their audience. With a growing fanbase and a reputation for high-energy live shows, Dam Anna is quickly making a name for themselves in the local scene.
          </p>

          <p>
            Join us on our journey as we continue to push boundaries and create music that resonates with fans around the world.
          </p>
        </div>
      </div>
    </div>
  );
}
