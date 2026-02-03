export default function VideoSection() {
  return (
    <section className="video-section">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="background-video"
      >
        <source src="/videos/loop-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </section>
  );
}