import { useState, useEffect } from 'react';

/**
 * SocialsModal - Social media links in card layout
 * 
 * CUSTOMIZATION:
 * - SOCIAL_LINKS: Add/remove/reorder social platforms
 * - Card styling: Adjust hover effects, colors, sizes
 * - BLUR_AMOUNT: Adjust backdrop blur intensity
 * - ANIMATION_DURATION: Adjust fade speed
 * 
 * Future: Social links may be managed via dashboard
 */

// CUSTOMIZATION: Social media links
// Add new platforms by adding objects to this array
const SOCIAL_LINKS = [
  {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com/damannaofficial', // TODO: Replace with actual URL
    icon: '/public/icons/instagram.svg', 
    color: ''
  },
  {
    id: 'youtube',
    name: 'YouTube',
    url: 'https://www.youtube.com/@DamAnnaOfficial', // TODO: Replace with actual URL
    icon: '/icons/youtube.svg', 
    color: ''
  },
  // {
  //   id: 'spotify',
  //   name: 'Spotify',
  //   url: 'https://spotify.com/artist/damanna',
  //   icon: '🎵',
  //   color: 'bg-green-500'
  // },
];

// CUSTOMIZATION: Appearance settings
const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';
const ANIMATION_DURATION = 500;

export default function SocialsModal({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // Trigger fade-in animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll
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

  // Handle close with fade-out
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
      className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-center justify-center p-8 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined}}
      onClick={handleBackdropClick}
    >
      <button onClick={handleClose} className="fixed top-8 right-8 text-white text-4xl hover:text-gray-300 transition-colors z-[10000]" aria-label="Close socials">×</button>
      <div className={`relative max-w-2xl w-full transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <h2 className="font-hero text-white text-8xl font-bold mb-8 text-center">Connect With Us</h2>
        <div className="grid grid-cols-2 gap-6">
          {SOCIAL_LINKS.map((social) => (
            <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className={`${social.color} rounded-lg p-8 flex flex-col items-center justify-center text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
              <div className="text-6xl mb-4"><img src={social.icon} alt='icon'></img></div>
              <h3 className="font-hero text-4xl font-bold">{social.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}