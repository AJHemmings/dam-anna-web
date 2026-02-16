import { useState } from 'react';
import useVideos from '../../hooks/useVideos';
import VideoCarousel from '../VideoCarousel';
import VideoModal from '../modals/VideoModal';

/**
 * VideoSection - Video carousel section on the main page
 * 
 * Displays a 3D carousel of video thumbnails.
 * Click a video to open it in a modal with YouTube player.
 * No framed section wrapper — borderless design.
 * Side videos in carousel provide the depth/fade effect.
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Uses isMobile prop from App.jsx for layout decisions.
 */

// CUSTOMIZATION: Section width
const SECTION_WIDTH = 'w-full lg:max-w-[1000px]';

// CUSTOMIZATION: Heading size per breakpoint
const HEADING_SIZE = 'text-2xl md:text-4xl lg:text-6xl';

// CUSTOMIZATION: Loading/empty state text size
const STATUS_TEXT_SIZE = 'text-sm md:text-lg lg:text-xl';

export default function VideoSection({ isMobile }) {
  const { videos, loading, error } = useVideos();
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (loading) {
    return (
      <div className={`${SECTION_WIDTH} mx-auto text-center py-8`}>
        <p className={`font-hero ${STATUS_TEXT_SIZE} text-gray-400`}>Loading videos...</p>
      </div>
    );
  }

  if (error || videos.length === 0) return null;

  return (
    <>
      <div className={`${SECTION_WIDTH} mx-auto py-8`}>
        <h2 className={`font-hero ${HEADING_SIZE} mb-6 text-center text-white`}>Videos</h2>

        <VideoCarousel
          videos={videos}
          isMobile={isMobile}
          onVideoSelect={setSelectedVideo}
        />
      </div>

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}