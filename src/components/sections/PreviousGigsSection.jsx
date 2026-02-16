import FramedSection from '../FramedSection';
import usePreviousGigs from '../../hooks/usePreviousGigs';

/**
 * PreviousGigsSection - Past performances loaded from Supabase
 * 
 * Displays gigs where date < today, most recent first.
 * Falls back gracefully if database is unreachable.
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

// CUSTOMIZATION: Loading/empty state text size
const STATUS_TEXT_SIZE = 'text-sm md:text-lg lg:text-xl';

export default function PreviousGigsSection() {
  const { gigs, loading, error } = usePreviousGigs();

  return (
    <FramedSection className={`mb-0 ${SECTION_WIDTH} flex-shrink-0`}>
      <h2 className={`font-hero ${HEADING_SIZE} mb-4`}>Previous Gigs</h2>
      
      {loading ? (
        <p className={`font-hero ${STATUS_TEXT_SIZE} text-gray-400`}>Loading...</p>
      ) : error ? (
        <p className={`font-hero ${LIST_TEXT_SIZE}`}>Check back soon!</p>
      ) : gigs.length === 0 ? (
        <p className={`font-hero ${LIST_TEXT_SIZE}`}>No previous gigs yet.</p>
      ) : (
        <div className={`font-hero ${LIST_TEXT_SIZE}`}>
          {gigs.map((gig) => (
            <p key={gig.id} className="mb-1">
              {gig.venue} - {gig.location}
            </p>
          ))}
        </div>
      )}
    </FramedSection>
  );
}