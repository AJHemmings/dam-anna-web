/**
 * BlockQuote - Framed quote sections
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 * Uses isMobile prop from App.jsx (JS-driven, matches nav detection)
 * instead of CSS breakpoints to stay in sync on touch devices.
 */

// CUSTOMIZATION: Quote text size — mobile vs desktop
const QUOTE_TEXT_MOBILE = 'text-2xl sm:text-4xl';
const QUOTE_TEXT_DESKTOP = 'text-[7rem]';

// CUSTOMIZATION: Padding — mobile vs desktop
const QUOTE_PADDING_MOBILE = 'p-3 sm:p-4';
const QUOTE_PADDING_DESKTOP = 'p-8';

// CUSTOMIZATION: Bottom margin — mobile vs desktop
const QUOTE_MARGIN_MOBILE = 'mb-16';
const QUOTE_MARGIN_DESKTOP = 'mb-87.5';

export default function BlockQuote({ children, isMobile = false }) {
  return (
    <div 
      className={`${isMobile ? '' : 'col-start-2 col-span-9'} ${isMobile ? QUOTE_MARGIN_MOBILE : QUOTE_MARGIN_DESKTOP} flex justify-start`}
    >
      <div
        className={`${isMobile ? QUOTE_PADDING_MOBILE : QUOTE_PADDING_DESKTOP} relative inline-block`}
        style={{ 
          borderImage: 'url(/boarder1.webp) 60 stretch',
          borderWidth: '30px',
          borderStyle: 'solid',
          boxShadow: 'inset 0 0 40px 20px rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* White background fill */}
        <div className="absolute inset-0 bg-white/70 -z-10 blur-lg"></div>
        
        {/* Black text on white */}
        <p className={`text-black ${isMobile ? QUOTE_TEXT_MOBILE : QUOTE_TEXT_DESKTOP} leading-tight font-hero relative z-10`}>
          {children}
        </p>
      </div>
    </div>
  );
}
