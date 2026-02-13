import FramedSection from '../FramedSection';

/**
 * GigsSection - Upcoming gigs with ticket links
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 * Mobile = default, Tablet = md (768px+), Desktop = lg (1024px+)
 */

// CUSTOMIZATION: Section width
// Mobile: full width always. Tablet/Desktop: set max width.
const SECTION_WIDTH = 'w-full lg:w-[600px]';

// CUSTOMIZATION: Heading font size per breakpoint
const HEADING_SIZE = 'text-2xl md:text-4xl lg:text-6xl';

// CUSTOMIZATION: Gig entry font size per breakpoint
const GIG_TEXT_SIZE = 'text-sm md:text-lg lg:text-2xl';

// CUSTOMIZATION: Ticket link font size per breakpoint
const TICKET_TEXT_SIZE = 'text-xs md:text-sm lg:text-base';

export default function GigsSection() {
  const gigs = [
    {
      date: "11th Feb",
      venue: "The Login Lounge",
      location: "Camberley, Surrey",
      ticketText: "£6 Tickets",
      ticketUrl: "hhttps://www.loginlounge.co.uk/"
    },
    {
      date: "19th Feb",
      venue: "Other Space Arts",
      location: "Windsor, Berkshire",
      ticketText: "£6 Tickets",
      ticketUrl: "https://www.otherspacearts.com/event-details-registration/gsmc-presents-third-thursday-music-2026-02-19-19-30"
    },
    {
      date: "27th Feb",
      venue: "The Oval",
      location: "Croydon, London",
      ticketText: "Free Entry",
      ticketUrl: "https://theovaltavern.co.uk/"
    }
  ];

  return (
    <FramedSection className={`mb-0 ${SECTION_WIDTH} flex-shrink-0`}>
      <h2 className={`font-hero ${HEADING_SIZE} mb-4`}>Upcoming Gigs!</h2>
      
      <div className="space-y-3">
        {gigs.map((gig, index) => (
          <div key={index} className="flex justify-between items-center gap-2">
            {/* Gig info - single line, truncates if needed */}
            <div className={`font-hero ${GIG_TEXT_SIZE} min-w-0`}>
              <span className="whitespace-nowrap">{gig.date}</span> - {gig.venue}, {gig.location}
            </div>
            
            {/* Ticket link - stays on same line */}
            <a 
              href={gig.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-400 hover:text-blue-300 active:text-blue-200 underline whitespace-nowrap flex-shrink-0 ${TICKET_TEXT_SIZE}`}
            >
              {gig.ticketText}
            </a>
          </div>
        ))}
      </div>
    </FramedSection>
  );
}
