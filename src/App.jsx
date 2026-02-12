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

export default function App() {
  const scrollTop = useScrollPosition();
  const [isGuitarLoaded, setIsGuitarLoaded] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);
  const [isAboutUsModalOpen, setIsAboutUsModalOpen] = useState(false);
  const [IsSocialsModalOpen, setIsSocialsModalOpen] = useState(false);
  const [IsContactModalOpen, setIsContactModalOpen] =useState(false);
  const [isYouModalOpen, setIsYouModalOpen] = useState(false);

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
          className="text-white z-[99] relative w-full pt-[180px] pb-[120px] grid grid-cols-12 select-none"
          style={{
            opacity: splashComplete ? 1 : 0,
            transition: 'opacity 0.8s ease-in'
          }}
        >
          <HeroSection />
          
          <BlockQuote>We make music.</BlockQuote>
          
          <div id="gigs-section" className="col-start-2 col-span-10 mb-87.5 flex gap-4 items-start">
            <GigsSection />
            <GigPhotosSection />
          </div>
          
          <div className="col-start-2 col-span-10 mb-87.5 flex gap-4 items-start">
            <PreviousGigsSection />
            <GallerySection />
          </div>
          
          <BlockQuote>Let it cook! <br />-Dam Anna</BlockQuote>
          
          <BlockQuote>Thanks for checking us out!</BlockQuote>
        </main>
      </Container>

      {/* About Us Modal */}
      {isAboutUsModalOpen && <AboutUsModal onClose={() => setIsAboutUsModalOpen(false)} />}

      {/* Socials Modal */}
      {IsSocialsModalOpen && <SocialsModal onClose={() => setIsSocialsModalOpen(false)} />}

      {/* Contact Modal */}
      {IsContactModalOpen && <ContactModal onClose={() => setIsContactModalOpen(false)} />}

      {/* You Modal */}
      {isYouModalOpen && <YouModal onClose={() => setIsYouModalOpen(false)} />}
    </>
  );
}