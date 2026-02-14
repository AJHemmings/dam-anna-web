/**
 * HeroSection - Welcome logo area
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 */

// CUSTOMIZATION: Logo max width on mobile/tablet
const MOBILE_LOGO_MAX = 'max-w-xs sm:max-w-sm md:max-w-md';

// CUSTOMIZATION: Padding per breakpoint
const SECTION_PADDING = 'p-4 md:p-6 lg:p-8';

// CUSTOMIZATION: Bottom margin per breakpoint
const SECTION_MARGIN = 'mb-16 md:mb-20 lg:mb-87.5';

export default function HeroSection() {
  return (
    <header className={`lg:col-start-2 lg:col-span-5 text-[2.5rem] ${SECTION_PADDING} ${SECTION_MARGIN}`}>
      <img src="/logo3-resize.png" alt="Dam Anna Logo" className={`w-full ${MOBILE_LOGO_MAX} lg:max-w-none`} />
    </header>
  );
}
