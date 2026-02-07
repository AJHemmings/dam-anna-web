import FramedSection from '../FramedSection';

export default function PreviousGigsSection() {
  return (
    <FramedSection className="col-start-2 col-span-6 mb-87.5">
      <h2 className="font-hero text-6xl mb-4">Previous Gigs</h2>
      <p className="font-hero text-4xl mb-4">
        London, UK - The O2 Academy<br />
        New York, NY - Bowery Ballroom<br />
        Chicago, IL - Metro Chicago<br />
        Austin, TX - Stubb's BBQ<br />
        Seattle, WA - The Crocodile<br />
      </p>

      {/* <h2 className="font-bold text-2xl mb-4">🏆 Accomplishments</h2>
      <ul className="list-disc list-inside">
        <li>Won Battle of the Bands 2022</li>
        <li>Opened for The Strokes in 2023</li>
        <li>Featured in Rolling Stone Magazine</li>
      </ul> */}
    </FramedSection>
  );
}