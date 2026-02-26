/**
 * HeroSection - Welcome logo area
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Uses isMobile prop from App.jsx for JS-driven responsive layout.
 */

// CUSTOMIZATION: Logo max width on mobile
const MOBILE_LOGO_MAX = 'max-w-xs sm:max-w-sm md:max-w-md';

export default function HeroSection({ isMobile = false }) {
  return (
    <header className={`${isMobile ? '' : 'col-start-2 col-span-5'} text-[2.5rem] ${isMobile ? 'p-4 mb-16' : 'p-8 mb-87.5'}`}>
      <img src="/logo3-resize.webp" alt="Dam Anna Logo" className={`w-full ${isMobile ? MOBILE_LOGO_MAX : ''}`} />
    </header>
  );
}
