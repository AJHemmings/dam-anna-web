import { useState, useEffect, useRef } from 'react';

/**
 * VideoModal - Full-screen YouTube video player in modal
 * 
 * Opens when a video is selected from the carousel.
 * Responsive: portrait/mobile shows smaller, landscape/desktop shows 16:9.
 * Controls: play/pause, mute/unmute, close. No timeline scrubbing.
 * YouTube IFrame API used for programmatic control.
 * 
 * RESPONSIVE CUSTOMIZATION:
 * Adjust the constants below to control sizes at each breakpoint.
 */

// CUSTOMIZATION: Backdrop appearance
const BLUR_AMOUNT = 'backdrop-blur-md';
const DARKNESS_OVERLAY = 'bg-black/80';
const ANIMATION_DURATION = 500;

// CUSTOMIZATION: Close button position
const CLOSE_BTN_TOP = 'top-20 md:top-20 lg:top-8';
const CLOSE_BTN_SIZE = 'text-3xl lg:text-4xl';

// CUSTOMIZATION: Video container sizing
const VIDEO_WIDTH_MOBILE = 'w-full max-w-[350px]';
const VIDEO_WIDTH_DESKTOP = 'w-full max-w-[900px]';

// CUSTOMIZATION: Control button sizing
const CONTROL_BTN_SIZE = 'w-11 h-11';
const CONTROL_ICON_SIZE = 'w-6 h-6';

// CUSTOMIZATION: Title text size
const TITLE_SIZE = 'text-base md:text-lg lg:text-xl';
const DESCRIPTION_SIZE = 'text-xs md:text-sm lg:text-base';

export default function VideoModal({ video, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!video?.videoId) return;

    // Load the API script if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    function createPlayer() {
      playerRef.current = new window.YT.Player('yt-player', {
        videoId: video.videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          fs: 0,
        },
        events: {
          onReady: () => setPlayerReady(true),
          onStateChange: (e) => {
            setIsPlaying(e.data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [video?.videoId]);

  // Fade in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Lock scroll
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, []);

  function handleClose() {
    setIsVisible(false);
    setTimeout(() => onClose(), ANIMATION_DURATION);
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function togglePlay() {
    if (!playerRef.current || !playerReady) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }

  function toggleMute() {
    if (!playerRef.current || !playerReady) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }

  if (!video) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} flex items-center justify-center p-4 md:p-6 lg:p-8 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={handleClose}
        className={`fixed ${CLOSE_BTN_TOP} right-4 md:right-6 lg:right-8 ${CLOSE_BTN_SIZE} text-white hover:text-gray-300 active:text-gray-400 transition-colors z-[10000] w-11 h-11 flex items-center justify-center`}
        aria-label="Close video"
      >
        ×
      </button>

      {/* Video container */}
      <div
        ref={containerRef}
        className={`${VIDEO_WIDTH_MOBILE} md:${VIDEO_WIDTH_DESKTOP} transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* YouTube embed */}
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
          <div id="yt-player" className="absolute inset-0 w-full h-full" />
        </div>

        {/* Controls bar */}
        <div className="flex items-center justify-between bg-black/90 rounded-b-lg px-4 py-3 -mt-1">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={!playerReady}
              className={`${CONTROL_BTN_SIZE} flex items-center justify-center text-white/80 hover:text-white active:text-gray-300 transition-colors disabled:text-white/30`}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg className={CONTROL_ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className={CONTROL_ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              disabled={!playerReady}
              className={`${CONTROL_BTN_SIZE} flex items-center justify-center text-white/80 hover:text-white active:text-gray-300 transition-colors disabled:text-white/30`}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg className={CONTROL_ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              ) : (
                <svg className={CONTROL_ICON_SIZE} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              )}
            </button>
          </div>

          {/* Title and Watch on YouTube */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`text-white font-semibold ${TITLE_SIZE}`}>{video.title}</p>
              {video.description && (
                <p className={`text-gray-400 ${DESCRIPTION_SIZE}`}>{video.description}</p>
              )}
            </div>
            
            <a
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 active:text-red-300 transition-colors flex-shrink-0"
              aria-label="Watch on YouTube"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                <path fill="white" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}