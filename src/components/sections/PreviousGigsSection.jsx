import FramedSection from '../FramedSection';

/**
 * PreviousGigsSection - Past performances list
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 * Mobile = default, Tablet = md (768px+), Desktop = lg (1024px+)
 */

// CUSTOMIZATION: Section width
const SECTION_WIDTH = 'w-full lg:w-[600px]';

// CUSTOMIZATION: Heading font size per breakpoint
const HEADING_SIZE = 'text-2xl md:text-4xl lg:text-6xl';

// CUSTOMIZATION: Gig list font size per breakpoint
const LIST_TEXT_SIZE = 'text-base md:text-2xl lg:text-4xl';

export default function PreviousGigsSection() {
  return (
    <FramedSection className={`mb-0 ${SECTION_WIDTH} flex-shrink-0`}>
      <h2 className={`font-hero ${HEADING_SIZE} mb-4`}>Previous Gigs</h2>
      <p className={`font-hero ${LIST_TEXT_SIZE} mb-4`}>
        The Newton Pippin - Bracknell<br />
        The Plough and Harrow - Bracknell<br />
        The Acoustic Couch - Bracknell<br />
      </p>
    </FramedSection>
  );
}
