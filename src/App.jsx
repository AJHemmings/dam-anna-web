import { useState } from 'react';
import { useScrollPosition } from './hooks/useScrollPosition';
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
import AboutUsModal from './components/modals/AboutUsModal';
import SocialsModal from './components/modals/SocialsModal';
import ContactModal from './components/modals/ContactModal';
import YouModal from './components/modals/YouModal';
import GalleryModal from './components/modals/GalleryModal';

export default function App() {
  const scrollTop = useScrollPosition();
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
          className="text-white z-[99] relative w-full pt-[100px] lg:pt-[180px] pb-[60px] lg:pb-[120px] grid grid-cols-1 lg:grid-cols-12 select-none px-4 lg:px-0"
          style={{
            opacity: splashComplete ? 1 : 0,
            transition: 'opacity 0.8s ease-in'
          }}
        >
          <HeroSection />
          
          <BlockQuote>We make music.</BlockQuote>
          
          {/* Gigs + Gig Photos: side by side on desktop, stacked on mobile */}
          <div id="gigs-section" className="lg:col-start-2 lg:col-span-10 mb-20 lg:mb-87.5 flex flex-col lg:flex-row gap-4 items-center lg:items-start">
            <GigsSection />
            <GigPhotosSection />
          </div>
          
          {/* Previous Gigs + Gallery: side by side on desktop, stacked on mobile */}
          <div className="lg:col-start-2 lg:col-span-10 mb-20 lg:mb-87.5 flex flex-col lg:flex-row gap-4 items-center lg:items-start">
            <PreviousGigsSection />
            {/* GallerySection triggers the same modal as the nav bar */}
            <GallerySection onOpenGallery={() => setIsGalleryModalOpen(true)} />
          </div>
          
          <BlockQuote>Let it cook! <br />-Dam Anna</BlockQuote>
          
          <BlockQuote>Thanks for checking us out!</BlockQuote>
        </main>
      </Container>

      {/* All modals render at top level for correct z-index */}
      {isAboutUsModalOpen && <AboutUsModal onClose={() => setIsAboutUsModalOpen(false)} />}
      {IsSocialsModalOpen && <SocialsModal onClose={() => setIsSocialsModalOpen(false)} />}
      {IsContactModalOpen && <ContactModal onClose={() => setIsContactModalOpen(false)} />}
      {isGalleryModalOpen && <GalleryModal onClose={() => setIsGalleryModalOpen(false)} />}
      {isYouModalOpen && <YouModal onClose={() => setIsYouModalOpen(false)} />}
    </>
  );
}
