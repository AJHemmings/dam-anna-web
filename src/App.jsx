import { useState } from 'react';
import { useScrollPosition } from './hooks/useScrollPosition';
import ThreeBackground from './components/ThreeBackground';
import SplashScreen from './components/SplashScreen';
import HeroSection from './components/sections/HeroSection';
import GigsSection from './components/sections/GigsSection';
import PreviousGigsSection from './components/sections/PreviousGigsSection';
import AboutSection from './components/sections/AboutSection';
import BlockQuote from './components/sections/BlockQuote';
import Container from './components/Container';
import GigPhotosSection from './components/sections/GigPhotoSection';
import GallerySection from './components/sections/GallerySection';
// import VideoSection from './components/sections/VideoSection';

export default function App() {
  const scrollTop = useScrollPosition();
  const [isGuitarLoaded, setIsGuitarLoaded] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);

  function handleGuitarLoaded() {
    setIsGuitarLoaded(true);
  }

  function handleSplashComplete() {
    setSplashComplete(true);
  }

  return (
    <>
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
        className="text-white z-99 absolute w-full mx-auto py-30 grid grid-cols-12 select-none"
        style={{
          opacity: splashComplete ? 1 : 0,
          transition: 'opacity 0.8s ease-in'
        }}
      >
        <HeroSection />
        <BlockQuote>We make music.</BlockQuote>
        <div className="col-start-2 col-span-10 mb-87.5 flex gap-4 items-start">
        <GigsSection />
        <GigPhotosSection />
        </div>
        <div className="col-start-2 col-span-10 mb-87.5 flex gap-4 items-start">
        <PreviousGigsSection />
        <GallerySection />
        </div>
        {/* <VideoSection /> */}
        <BlockQuote>Let it cook! <br />-Dam Anna</BlockQuote>
        <AboutSection />
        <BlockQuote>Thanks for checking us out!</BlockQuote>

      </main>
      </Container>
    </>
  );
}