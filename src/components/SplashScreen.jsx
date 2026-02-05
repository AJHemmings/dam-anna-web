import { useEffect, useState, useRef } from 'react';

export default function SplashScreen({ isLoaded, onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (hasCompletedRef.current) return; // Already completed, do nothing

    const minDisplayTime = 2800;
    const maxDisplayTime = 6000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      if (hasCompletedRef.current) {
        clearInterval(interval);
        return;
      }

      const elapsedTime = Date.now() - startTime;

      if (isLoaded && elapsedTime >= minDisplayTime) {
        // Guitar loaded AND minimum time passed
        clearInterval(interval);
        startFadeOut();
      } else if (elapsedTime >= maxDisplayTime) {
        // Max wait time exceeded
        clearInterval(interval);
        startFadeOut();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isLoaded]);

  function startFadeOut() {
    if (hasCompletedRef.current) return; // Prevent double execution
    
    hasCompletedRef.current = true;
    setIsFadingOut(true);

    onComplete(); // Notify parent immediately when fade-out starts
    
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 1500);
  }

  if (!isVisible) return null;

  return (
    <div className={`splash-screen ${isFadingOut ? 'fade-out' : ''}`}>
      <img src="/logo3-resize.png" alt="Dam Anna" className="splash-logo" />
    </div>
  );
}