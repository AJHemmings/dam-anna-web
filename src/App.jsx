import { useScrollPosition } from './hooks/useScrollPosition';
import ThreeBackground from './components/ThreeBackground';
import VideoSection from './components/sections/VideoSection';

export default function App() {
  const scrollTop = useScrollPosition();

  return (
    <>
      <ThreeBackground scrollTop={scrollTop} />
      
      <main>
        <header>
          <img src="/logo2.png" alt="Dam Anna Logo" />
        </header>

        {/* <VideoSection /> */}

        <blockquote>
          <p>We make music</p>
        </blockquote>

        <section>
          <h2>Gigs!</h2>
          <p>
            12st - The Roxy, Los Angeles, CA<br />
            15th - The Viper Room, Los Angeles, CA<br />
            20th - The Troubadour, Los Angeles, CA<br />
            25th - The Mint, Los Angeles, CA<br />
          </p>
        </section>

        <section className="light">
          <h2>Previous Gigs</h2>
          <p>
            London, UK - The O2 Academy<br />
            New York, NY - Bowery Ballroom<br />
            Chicago, IL - Metro Chicago<br />
            Austin, TX - Stubb's BBQ<br />
            Seattle, WA - The Crocodile<br />
          </p>

          <h2>🏆 Accomplishments</h2>
          <ul>
            <li>Won Battle of the Bands 2022</li>
            <li>Opened for The Strokes in 2023</li>
            <li>Featured in Rolling Stone Magazine</li>
          </ul>
        </section>

        <blockquote>
          <p>Let it cook! <br />-Dam Anna</p>
        </blockquote>

        <section className="left">
          <h2>About Us!</h2>
          <p>
            Dam Anna is a dynamic music duo known for their electrifying performances and genre-blending sound. Formed in 2020, the band consists of lead vocalist Hanna Dixon and guitarist Adam Hemmings. Their music combines elements of rock, pop, and electronic, creating a unique and captivating experience for their audience. With a growing fanbase and a reputation for high-energy live shows, Dam Anna is quickly making a name for themselves in the music industry.
          </p>
        </section>

        <blockquote>
          <p>Thanks for checking us out!</p>
        </blockquote>
      </main>
    </>
  );
}