import { useState, useEffect } from 'react';

/**
 * SocialsModal - Social media links in card layout
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 * Mobile = default, Tablet = md (768px+), Desktop = lg (1024px+)
 * 
 * Future: Social links may be managed via dashboard
 */

// CUSTOMIZATION: Social media links
const SOCIAL_LINKS = [
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/damannaofficial',
    icon: '/icons/instagram.svg', 
    color: ''
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/@DamAnnaOfficial',
    icon: '/icons/youtube.svg', 
    color: ''
  },
];

// CUSTOMIZATION: Appearance settings
const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';
const ANIMATION_DURATION = 500;

// CUSTOMIZATION: Close button position
const CLOSE_BTN_TOP = 'top-20 md:top-20 lg:top-8';
const CLOSE_BTN_SIZE = 'text-3xl lg:text-4xl';

// CUSTOMIZATION: Heading size per breakpoint
const HEADING_SIZE = 'text-3xl md:text-5xl lg:text-8xl';

// CUSTOMIZATION: Card grid columns per breakpoint
const GRID_COLS = 'grid-cols-1 md:grid-cols-2';

// CUSTOMIZATION: Card grid gap per breakpoint
const GRID_GAP = 'gap-3 md:gap-4 lg:gap-6';

// CUSTOMIZATION: Card padding per breakpoint
const CARD_PADDING = 'p-4 md:p-5 lg:p-8';

// CUSTOMIZATION: Card name text size per breakpoint
const CARD_NAME_SIZE = 'text-xl md:text-2xl lg:text-4xl';

// CUSTOMIZATION: Card icon container margin per breakpoint
const CARD_ICON_MARGIN = 'mb-2 md:mb-3 lg:mb-4';

// CUSTOMIZATION: Card icon image size per breakpoint
const CARD_ICON_SIZE = 'w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16';

export default function SocialsModal({ onClose }) {
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
      className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined}}
      onClick={handleBackdropClick}
    >
      {/* Close button - below nav bar on mobile/tablet */}
      <button
        onClick={handleClose}
        className={`fixed ${CLOSE_BTN_TOP} right-4 md:right-6 lg:right-8 ${CLOSE_BTN_SIZE} text-white hover:text-gray-300 active:text-gray-400 transition-colors z-[10000] w-11 h-11 flex items-center justify-center`}
        aria-label="Close socials"
      >
        ×
      </button>

      {/* Content wrapper - scrollable on mobile, centered on desktop */}
      <div className="min-h-full flex items-center justify-center px-4 md:px-6 lg:px-8 pt-24 pb-8 lg:pt-8">
        <div 
          className={`relative max-w-2xl w-full transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className={`font-hero text-white ${HEADING_SIZE} font-bold mb-4 md:mb-6 lg:mb-8 text-center`}>Connect With Us</h2>
          
          <div className={`grid ${GRID_COLS} ${GRID_GAP}`}>
            {SOCIAL_LINKS.map((social) => (
              <a 
                key={social.id} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`${social.color} rounded-lg ${CARD_PADDING} flex flex-col items-center justify-center text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl`}
              >
                <div className={CARD_ICON_MARGIN}>
                  <img src={social.icon} alt="icon" className={CARD_ICON_SIZE} />
                </div>
                <h3 className={`font-hero ${CARD_NAME_SIZE} font-bold`}>{social.name}</h3>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
