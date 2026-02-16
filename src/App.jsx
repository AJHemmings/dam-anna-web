import { useState, useEffect } from 'react';
import { useScrollPosition } from './hooks/useScrollPosition';
import { Analytics } from '@vercel/analytics/react';
import ThreeBackground from './components/ThreeBackground';
import SplashScreen from './components/SplashScreen';
import HeroSection from './components/sections/HeroSection';
import GigsSection from './components/sections/GigsSection';
import PreviousGigsSection from './components/sections/PreviousGigsSection';
import BlockQuote from './components/sections/BlockQuote';
import Container from './components/Container';
import GigPhotosSection from './components/sections/GigPhotoSection';
import GallerySection from './components/sections/GallerySection';
import Navigation from './components/Navigation';
import { scrollToSection, scrollToTop } from './utils/ScrollToSection';
import Portal from './utils/Portal';
import AboutUsModal from './components/modals/AboutUsModal';
import SocialsModal from './components/modals/SocialsModal';
import ContactModal from './components/modals/ContactModal';
import YouModal from './components/modals/YouModal';
import GalleryModal from './components/modals/GalleryModal';

/**
 * Detect if the layout should use mobile mode.
 * Matches the same logic as Navigation.jsx useIsMobileNav():
 * - Screen < 1280px OR touch-primary device
 * 
 * This ensures the layout and nav are always in sync —
 * a tablet in landscape won't get desktop layout with a hamburger menu.
 */
function useIsMobileLayout() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return checkIsMobile();
  });

  useEffect(() => {
    function handleChange() {
      setIsMobile(checkIsMobile());
    }

    window.addEventListener('resize', handleChange);
    window.addEventListener('orientationchange', handleChange);

    const mediaQuery = window.matchMedia('(pointer: coarse)');
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      window.removeEventListener('resize', handleChange);
      window.removeEventListener('orientationchange', handleChange);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}

function checkIsMobile() {
  const isNarrow = window.innerWidth < 1280;
  const isTouchPrimary = window.matchMedia('(pointer: coarse)').matches;
  return isNarrow || isTouchPrimary;
}

export default function App() {
  const scrollTop = useScrollPosition();
  const isMobileLayout = useIsMobileLayout();
  const [isGuitarLoaded, setIsGuitarLoaded] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);
  const [isAboutUsModalOpen, setIsAboutUsModalOpen] = useState(false);
  const [IsSocialsModalOpen, setIsSocialsModalOpen] = useState(false);
  const [IsContactModalOpen, setIsContactModalOpen] =useState(false);
  const [isYouModalOpen, setIsYouModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);

  function handleNavClick(itemId) {
    console.log(`Navigation item clicked: ${itemId}`);
    
    switch (itemId) {
      case 'home':
        scrollToTop();
        break;
      case 'gigs':
        scrollToSection('gigs-section');
        break;
      case 'about':
        setIsAboutUsModalOpen(true);
        break;
      case 'socials':
        setIsSocialsModalOpen(true);
        break;
      case 'contact':
        setIsContactModalOpen(true);
        break;
      case 'gallery':
        setIsGalleryModalOpen(true);
        break;
      case 'you':
        setIsYouModalOpen(true);
        break;
      default:
        console.log(`Handler for ${itemId} not implemented yet`);
    }
  }

  function handleGuitarLoaded() {
    setIsGuitarLoaded(true);
  }

  function handleSplashComplete() {
    setSplashComplete(true);
  }

  return (
    <>
      <Navigation onNavClick={handleNavClick} />
      
      <SplashScreen 
        isLoaded={isGuitarLoaded} 
        onComplete={handleSplashComplete}
      />

      <ThreeBackground 
        scrollTop={scrollTop} 
        onGuitarLoaded={handleGuitarLoaded}
      />
      
      <Container>
        <main 
          className={`text-white z-[99] relative w-full select-none ${
            isMobileLayout
              ? 'pt-[100px] pb-[60px] grid grid-cols-1 px-4'
              : 'pt-[180px] pb-[120px] grid grid-cols-12'
          }`}
          style={{
            opacity: splashComplete ? 1 : 0,
            transition: 'opacity 0.8s ease-in'
          }}
        >
          <HeroSection isMobile={isMobileLayout} />
          
          <BlockQuote isMobile={isMobileLayout}>We make music.</BlockQuote>
          
          {/* Gigs + Gig Photos: side by side on desktop, stacked on mobile */}
          <div 
            id="gigs-section" 
            className={`${isMobileLayout ? '' : 'col-start-2 col-span-10'} ${isMobileLayout ? 'mb-20' : 'mb-87.5'} flex ${isMobileLayout ? 'flex-col items-center' : 'flex-row items-start'} gap-4`}
          >
            <GigsSection onOpenContact={() => setIsContactModalOpen(true)} />
            <GigPhotosSection isMobile={isMobileLayout} onOpenContact={() => setIsContactModalOpen(true)} />
          </div>
          
          {/* Previous Gigs + Gallery: side by side on desktop, stacked on mobile */}
          <div 
            className={`${isMobileLayout ? '' : 'col-start-2 col-span-10'} ${isMobileLayout ? 'mb-20' : 'mb-87.5'} flex ${isMobileLayout ? 'flex-col items-center' : 'flex-row items-start'} gap-4`}
          >
            <PreviousGigsSection />
            <GallerySection onOpenGallery={() => setIsGalleryModalOpen(true)} isMobile={isMobileLayout} />
          </div>
          
          <BlockQuote isMobile={isMobileLayout}>Let it cook! <br />-Dam Anna</BlockQuote>
          
          <BlockQuote isMobile={isMobileLayout}>Thanks for checking us out!</BlockQuote>
        </main>
      </Container>

      {/* All modals rendered via Portal — outside the main DOM tree
          to prevent layout recalculation on sibling elements */}
      <Portal>
        {isAboutUsModalOpen && <AboutUsModal onClose={() => setIsAboutUsModalOpen(false)} />}
        {IsSocialsModalOpen && <SocialsModal onClose={() => setIsSocialsModalOpen(false)} />}
        {IsContactModalOpen && <ContactModal onClose={() => setIsContactModalOpen(false)} />}
        {isGalleryModalOpen && <GalleryModal onClose={() => setIsGalleryModalOpen(false)} />}
        {isYouModalOpen && <YouModal onClose={() => setIsYouModalOpen(false)} />}
      </Portal>
      <Analytics />
    </>
  );
}
