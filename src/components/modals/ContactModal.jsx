import { useState, useEffect } from 'react';

/**
 * ContactModal - Contact information and mailing list form
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 * Mobile = default, Tablet = md (768px+), Desktop = lg (1024px+)
 * 
 * Future: Form will be connected to email service via dashboard
 */

// CUSTOMIZATION: Contact information
const BAND_EMAIL = 'damannaband@gmail.com';

const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';
const ANIMATION_DURATION = 500;

// CUSTOMIZATION: Close button position
const CLOSE_BTN_TOP = 'top-20 md:top-20 lg:top-8';
const CLOSE_BTN_SIZE = 'text-3xl lg:text-4xl';

// CUSTOMIZATION: Modal width per breakpoint
const MODAL_WIDTH = 'w-full max-w-[700px]';

// CUSTOMIZATION: Modal padding per breakpoint
const MODAL_PADDING = 'p-5 md:p-6 lg:p-8';

// CUSTOMIZATION: Outer padding
const OUTER_PADDING = 'p-4 md:p-6 lg:p-8';

// CUSTOMIZATION: Main heading size per breakpoint
const HEADING_SIZE = 'text-4xl md:text-6xl lg:text-8xl';

// CUSTOMIZATION: Sub-heading size per breakpoint
const SUBHEADING_SIZE = 'text-2xl md:text-3xl lg:text-4xl';

// CUSTOMIZATION: Body text size per breakpoint
const BODY_TEXT_SIZE = 'text-sm md:text-base lg:text-[1.25rem]';

// CUSTOMIZATION: Description text size per breakpoint
const DESCRIPTION_SIZE = 'text-lg md:text-2xl lg:text-3xl';

// CUSTOMIZATION: Email link size per breakpoint
const EMAIL_SIZE = 'text-base md:text-lg lg:text-xl';

// CUSTOMIZATION: Button text size per breakpoint
const BUTTON_TEXT_SIZE = 'text-xl md:text-2xl lg:text-3xl';

export default function ContactModal({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');

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

  function handleSubmit(e) {
    e.preventDefault();
    alert('Mailing list feature coming soon!');
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
        aria-label="Close contact"
      >
        ×
      </button>

      <div 
        className={`relative ${MODAL_WIDTH} ${MODAL_PADDING} text-white ${BODY_TEXT_SIZE} leading-relaxed transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{borderImage: 'url(/boarder1.png) 60 stretch', borderWidth: '30px', borderStyle: 'solid', boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)'}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-black/70 -z-10 blur-sm"></div>
        <div className="relative z-10">
          <h2 className={`font-hero ${HEADING_SIZE} mb-4 md:mb-6 text-center`}>Get In Touch</h2>
          
          <div className="mb-6 md:mb-8">
            <h3 className={`font-hero ${SUBHEADING_SIZE} mb-2 md:mb-3`}>Email Us</h3>
            <a 
              href={`mailto:${BAND_EMAIL}`} 
              className={`text-blue-400 hover:text-blue-300 active:text-blue-200 underline ${EMAIL_SIZE}`}
            >
              {BAND_EMAIL}
            </a>
          </div>
          
          <div>
            <h3 className={`font-hero ${SUBHEADING_SIZE} mb-2 md:mb-3`}>Join Our Mailing List</h3>
            <p className={`font-hero ${DESCRIPTION_SIZE} text-gray-300 mb-3 md:mb-4`}>
              Stay updated with our latest news, gigs, and releases.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="your@email.com" 
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors text-sm md:text-base" 
                  required 
                  disabled 
                />
              </div>
              <button 
                type="submit" 
                disabled 
                className={`font-hero ${BUTTON_TEXT_SIZE} w-full py-2.5 md:py-3 bg-gray-600 text-gray-400 rounded-lg font-bold cursor-not-allowed`}
              >
                Coming Soon
              </button>
              <p className="text-xs md:text-sm text-gray-400 text-center">Mailing list feature will be available soon!</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
