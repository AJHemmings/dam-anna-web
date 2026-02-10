/**
 * Smooth scroll utility for navigation
 * Usage: scrollToSection('gigs-section')
 */

const SCROLL_OFFSET = 100; // Adjust based on your nav height

export function scrollToSection(sectionId) {
  const targetElement = document.getElementById(sectionId); 
    if (!targetElement) {
        console.warn(`Element with ID '${sectionId}' not found.`);
        return;
    }

    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - SCROLL_OFFSET;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth' // Change to 'auto' for instant scroll
    });
}

export function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Change to 'auto' for instant scroll
    });
}
