import { useState, useEffect } from 'react';

export function useScrollPosition() {
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    // Function to update scroll position
    function handleScroll() {
      const top = document.body.getBoundingClientRect().top;
      setScrollTop(top);
    }

    // Set initial scroll position
    handleScroll();

    // Add scroll listener
    document.body.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      document.body.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return scrollTop;
}