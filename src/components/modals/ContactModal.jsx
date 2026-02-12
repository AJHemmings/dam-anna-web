import { useState, useEffect } from 'react';

/**
 * ContactModal - Contact information and mailing list form
 * 
 * CUSTOMIZATION:
 * - BAND_EMAIL: Update with actual band email
 * - Form fields: Add/modify fields as needed
 * - Styling: Adjust colors, spacing, frame appearance
 * 
 * Future: Form will be connected to email service via dashboard
 */

// CUSTOMIZATION: Contact information
const BAND_EMAIL = 'damannaband@gmail.com';

const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/10';
const ANIMATION_DURATION = 500;

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
    // TODO: Will connect to email service in future
    alert('Mailing list feature coming soon!');
  }

  return (
    <div className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-center justify-center p-8 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined}} onClick={handleBackdropClick}>
      <button onClick={handleClose} className="fixed top-8 right-8 text-white text-4xl hover:text-gray-300 transition-colors z-[10000]" aria-label="Close contact">×</button>
      <div className={`relative w-[700px] max-w-full p-8 text-white text-[1.25rem] leading-relaxed transition-all duration-500 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{borderImage: 'url(/boarder1.png) 60 stretch', borderWidth: '30px', borderStyle: 'solid', boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)'}} onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 bg-black/70 -z-10 blur-sm"></div>
        <div className="relative z-10">
          <h2 className="font-hero text-8xl mb-6 text-center">Get In Touch</h2>
          <div className="mb-8">
            <h3 className="font-hero text-4xl mb-3">Email Us</h3>
            <a href={`mailto:${BAND_EMAIL}`} className="text-blue-400 hover:text-blue-300 underline text-xl">{BAND_EMAIL}</a>
          </div>
          <div>
            <h3 className="font-hero text-4xl mb-3">Join Our Mailing List</h3>
            <p className="font-hero text-3xl text-gray-300 mb-4">Stay updated with our latest news, gigs, and releases.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">Email Address</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors" required disabled />
              </div>
              <button type="submit" disabled className="font-hero text-3xl w-full py-3 bg-gray-600 text-gray-400 rounded-lg font-bold cursor-not-allowed">Coming Soon</button>
              <p className="text-sm text-gray-400 text-center">Mailing list feature will be available soon!</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}