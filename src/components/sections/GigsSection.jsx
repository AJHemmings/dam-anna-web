import FramedSection from '../FramedSection';
import useUpcomingGigs from '../../hooks/useUpcomingGigs';

/**
 * GigsSection - Upcoming gigs loaded from Supabase
 * 
 * Displays gigs where date >= today.
 * Falls back to a message if no upcoming gigs or if the database is unreachable.
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 * Mobile = default, Tablet = md (768px+), Desktop = lg (1024px+)
 */

// CUSTOMIZATION: Section width
const SECTION_WIDTH = 'w-full lg:w-[600px]';

// CUSTOMIZATION: Heading font size per breakpoint
const HEADING_SIZE = 'text-2xl md:text-4xl lg:text-6xl';

// CUSTOMIZATION: Gig entry font size per breakpoint
const GIG_TEXT_SIZE = 'text-sm md:text-lg lg:text-2xl';

// CUSTOMIZATION: Ticket link font size per breakpoint
const TICKET_TEXT_SIZE = 'text-xs md:text-sm lg:text-base';

// CUSTOMIZATION: Loading/empty state text size
const STATUS_TEXT_SIZE = 'text-sm md:text-lg lg:text-xl';

export default function GigsSection({ onOpenContact }) {
  const { gigs, loading, error } = useUpcomingGigs();

  return (
    <FramedSection className={`mb-0 ${SECTION_WIDTH} flex-shrink-0`}>
      <h2 className={`font-hero ${HEADING_SIZE} mb-4`}>Upcoming Gigs!</h2>
      
      {loading ? (
        <p className={`font-hero ${STATUS_TEXT_SIZE} text-gray-400`}>Loading gigs...</p>
      ) : error ? (
        <p className={`font-hero ${STATUS_TEXT_SIZE} text-gray-400`}>Check back soon for upcoming gigs!</p>
      ) : gigs.length === 0 ? (
        <p className={`font-hero ${STATUS_TEXT_SIZE} text-gray-400`}>
          No upcoming gigs right now — stay tuned or{' '}
          <button
            onClick={onOpenContact}
            className="text-blue-400 hover:text-blue-300 active:text-blue-200 underline"
          >
            contact us
          </button>
          {' '}for available dates to play at your venue!
        </p>
      ) : (
        <div className="space-y-3">
          {gigs.map((gig) => (
            <div key={gig.id} className="flex justify-between items-center gap-2">
              <div className={`font-hero ${GIG_TEXT_SIZE} min-w-0`}>
                <span className="whitespace-nowrap">
                  {new Date(gig.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span> - {gig.venue}, {gig.location}
              </div>
              
              {gig.ticket_url && (
                <a 
                  href={gig.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-blue-400 hover:text-blue-300 active:text-blue-200 underline whitespace-nowrap flex-shrink-0 ${TICKET_TEXT_SIZE}`}
                >
                  {gig.ticket_text || 'Tickets'}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </FramedSection>
  );
}