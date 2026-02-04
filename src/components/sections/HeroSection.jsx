import { useEffect } from 'react';

export default function HeroSection() {
  useEffect(() => {
    console.log('HeroSection mounted and rendered');
  }, []);

  console.log('HeroSection rendering...');

  return (
    <header>
      <img src="/logo3-resize.png" alt="Dam Anna Logo" />
    </header>
  );
}