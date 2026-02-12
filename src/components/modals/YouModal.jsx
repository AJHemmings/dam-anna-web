import { useState, useEffect } from 'react';

/**
 * YouModal - Placeholder for user photo submission feature
 * 
 * CUSTOMIZATION:
 * - Message text can be updated as feature develops
 * - Will be replaced with actual submission form in future
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
    <div className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-center justify-center p-8 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined}} onClick={handleBackdropClick}>
      <button onClick={handleClose} className="fixed top-8 right-8 text-white text-4xl hover:text-gray-300 transition-colors z-[10000]" aria-label="Close">×</button>
      <div className={`relative w-[700px] max-w-full p-12 text-white text-center transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{borderImage: 'url(/boarder1.png) 60 stretch', borderWidth: '30px', borderStyle: 'solid', boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)'}} onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-black/70 -z-10 blur-sm"></div>
        <div className="relative z-10">
          <div className="mb-6 flex justify-center"><img src="/icons/camera1.svg" alt="Send us your pics!" className='w-30 h-30'/></div>
          <h2 className="font-hero text-6xl mb-6">Send Us Your Pics</h2>
          <p className="text-xl text-gray-300 mb-4">This feature is currently in development.</p>
          <p className="text-lg text-gray-400">Soon you'll be able to submit your photos from our gigs! All submissions will be reviewed before appearing in the gallery.</p>
        </div>
      </div>
    </div>
  );
}