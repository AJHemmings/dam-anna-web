import FramedSection from '../FramedSection';

export default function GigsSection() {
  const gigs = [
    {
      date: "11th Feb",
      venue: "The Login Lounge",
      location: "Camberley, Surrey",
      ticketText: "Free Entry",
      ticketUrl: "https://example.com/gig1"
    },
    {
      date: "19th Feb",
      venue: "Other Space Arts",
      location: "Windsor, Berkshire",
      ticketText: "£10 Tickets",
      ticketUrl: "https://example.com/gig2"
    },
    {
      date: "27th Feb",
      venue: "The Oval",
      location: "Croydon, London",
      ticketText: "£15 Tickets",
      ticketUrl: "https://example.com/gig3"
    }
  ];

  return (
    <FramedSection className="mb-0 w-[600px]">
      <h2 className="font-hero text-6xl mb-4">Upcoming Gigs!</h2>
      
      <div className="space-y-3">
        {gigs.map((gig, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="font-hero text-2xl">
              <span>{gig.date}</span> - {gig.venue}, {gig.location}
            </div>
            
            <a 
              href={gig.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline whitespace-nowrap ml-4"
            >
              {gig.ticketText}
            </a>
          </div>
        ))}
      </div>
    </FramedSection>
  );
}