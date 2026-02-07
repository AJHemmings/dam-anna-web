import FramedSection from '../FramedSection';

export default function PreviousGigsSection() {
  return (
<FramedSection className="mb-0 w-[600px] flex-shrink-0">
      <h2 className="font-hero text-6xl mb-4">Previous Gigs</h2>
      <p className="font-hero text-4xl mb-4">
        The Newton Pippin - Bracknell<br />
        The Plough and Harrow - Bracknell<br />
        The Acoustic Couch - Bracknell<br />
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