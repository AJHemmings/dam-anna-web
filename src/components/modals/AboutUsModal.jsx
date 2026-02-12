import { useState, useEffect } from 'react';

/**
 * AboutUsModal - About Us section in modal format
 * 
 * CUSTOMIZATION:
 * - BLUR_AMOUNT: Adjust backdrop blur intensity
 * - ANIMATION_DURATION: 500ms (change both in setTimeout and CSS duration-500)
 * Features:
 * - Fade-in animation on open
 * - Fade-out animation on close
 * 
 * Future: Content may be pulled from database for admin editing
 */

// CUSTOMIZATION: Appearance settings
const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';
const ANIMATION_DURATION = 500; // milliseconds - must match CSS duration-500

export default function AboutUsModal({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger fade-in animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll when modal opens (prevent jolt by reserving scrollbar space)
  useEffect(() => {
    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Get elements that need padding compensation
    const body = document.body;
    const nav = document.getElementById('main-nav');
    const container = document.querySelector('.container'); // Container class
    const main = document.querySelector('main');
    
    // Lock scroll and add padding to compensate for hidden scrollbar
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    body.style.paddingRight = `${scrollbarWidth}px`;
    
    // Add padding to nav, container, and main content
    if (nav) nav.style.paddingRight = `${scrollbarWidth}px`;
    if (container) container.style.paddingRight = `${scrollbarWidth}px`;
    if (main) main.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      // Restore everything
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

  // Handle close with fade-out animation
  function handleClose() {
    setIsVisible(false);
    
    // Wait for animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, ANIMATION_DURATION);
  }

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-center justify-center p-8 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined
      }}
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className="fixed top-8 right-8 text-white text-4xl hover:text-gray-300 transition-colors z-[10000]"
        aria-label="Close about us"
      >
        ×
      </button>

      {/* Framed content container with fade + scale animation */}
      <div 
        className={`relative w-[700px] max-w-full p-8 text-white text-[1.25rem] leading-relaxed transition-all duration-500 ${
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
          <h2 className="font-bold text-4xl mb-6 text-center">About Us</h2>
          
          <p className="mb-4">
            Dam Anna is a dynamic music duo known for their electrifying performances and genre-blending sound. Formed in 2020, the band consists of lead vocalist Hanna Dixon and guitarist Adam Hemmings.
          </p>

          <p className="mb-4">
            Their music combines elements of rock, pop, and electronic, creating a unique and captivating experience for their audience. With a growing fanbase and a reputation for high-energy live shows, Dam Anna is quickly making a name for themselves in the music industry.
          </p>

          <p>
            Join us on our journey as we continue to push boundaries and create music that resonates with fans around the world.
          </p>
        </div>
      </div>
    </div>
  );
}