/**
 * BlockQuote - Framed quote sections
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 * Mobile = default, Tablet = md (768px+), Desktop = lg (1024px+)
 */

// CUSTOMIZATION: Quote text size per breakpoint
const QUOTE_TEXT_SIZE = 'text-2xl sm:text-4xl md:text-5xl lg:text-[7rem]';

// CUSTOMIZATION: Padding per breakpoint
const QUOTE_PADDING = 'p-3 sm:p-4 md:p-6 lg:p-8';

// CUSTOMIZATION: Bottom margin per breakpoint
const QUOTE_MARGIN = 'mb-16 md:mb-20 lg:mb-87.5';

export default function BlockQuote({ children }) {
  return (
    <div 
      className={`lg:col-start-2 lg:col-span-9 ${QUOTE_MARGIN} flex justify-start`}
    >
      <div
        className={`${QUOTE_PADDING} relative inline-block`}
        style={{ 
          borderImage: 'url(/boarder1.png) 60 stretch',
          borderWidth: '30px',
          borderStyle: 'solid',
          boxShadow: 'inset 0 0 40px 20px rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* White background fill */}
        <div className="absolute inset-0 bg-white/70 -z-10 blur-lg"></div>
        
        {/* Black text on white - scales per breakpoint */}
        <p className={`text-black ${QUOTE_TEXT_SIZE} leading-tight font-hero relative z-10`}>
          {children}
        </p>
      </div>
    </div>
  );
}
