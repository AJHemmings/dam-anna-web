import { useState, useEffect } from 'react';

/**
 * GalleryModal - Full-screen gallery view with thumbnail grid
 * 
 * Features:
 * - Dark grey scrollable background
 * - Grid of thumbnails (configurable columns)
 * - Hover: thumbnail scales up, shows metadata
 * - Click thumbnail: shows enlarged view
 * - Click outside or close button: exits modal
 * - Locks body scroll when open
 */

// CUSTOMIZATION: Adjust these values
const BLUR_AMOUNT = 'backdrop-blur-md';  // Options: backdrop-blur-sm, backdrop-blur, backdrop-blur-md, backdrop-blur-lg, backdrop-blur-xl, backdrop-blur-2xl
const DARKNESS_OVERLAY = 'bg-black/10';  // Options: bg-black/0 (no tint), bg-black/10, bg-black/20, bg-black/30, etc. up to bg-black/100

export const GALLERY_IMAGES = [
  { 
    url: 'https://imagizer.imageshack.com/img924/5730/NKzt2p.jpg', 
    alt: '3times7 and Dam Anna at The Oval',
    date: '27-02-26',
    location: 'London, UK'
  },
 { 
    url: 'https://imagizer.imageshack.com/img924/3282/80YQww.jpg', 
    alt: 'Login Lounge Lobby',
    date: '11-02-26',
    location: 'Camberley, Surrey'
  },
  { 
    url: 'https://imagizer.imageshack.com/img921/3122/JkEN3y.jpg', 
    alt: 'Login Lounge Crowd',
    date: '11-02-26',
    location: 'Camberley, Surrey'
  },
  { 
    url: 'https://imagizer.imageshack.com/img924/8242/nxk5QU.jpg', 
    alt: 'Login Lounge Stage',
    date: '11-02-26',
    location: 'Camberley, Surrey'
  },
  { 
    url: 'https://imagizer.imageshack.com/img922/4269/swbJAF.jpg', 
    alt: 'Login Lounge Showcase',
    date: '06-02-26',
    location: 'Bracknell, Berkshire'
  },
  { 
    url: 'https://imagizer.imageshack.com/img921/1148/7KuT6U.jpg', 
    alt: 'Newton Pippin',
    date: '04-02-26',
    location: 'Bracknell, Berkshire'
  },
  { 
    url: 'https://imagizer.imageshack.com/img923/8763/TbBxxa.jpg', 
    alt: 'Feb Gigs!',
    date: '01-02-26',
    location: 'Bracknell, Berkshire'
  },
  { 
    url: 'https://imagizer.imageshack.com/img922/8733/nikTUE.jpg', 
    alt: 'Acoustic Couch',
    date: '16-07-25',
    location: 'Bracknell, Berkshire'
  },
  { 
    url: 'https://imagizer.imageshack.com/img922/6326/U8yGg6.jpg', 
    alt: 'South Hill Park Summer Jam',
    date: '12-07-25',
    location: 'Bracknell, Berkshire'
  },
];

export default function GalleryModal({ onClose }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Lock body scroll when modal opens
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;
    
    // Lock body scroll
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // Cleanup: restore scroll when modal closes
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Close modal when clicking backdrop
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      if (selectedImage !== null) {
        setSelectedImage(null); // Go back to grid if viewing enlarged image
      } else {
        onClose(); // Close modal entirely
      }
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] overflow-y-auto ${BLUR_AMOUNT} ${DARKNESS_OVERLAY} supports-[backdrop-filter]:bg-transparent`}
      style={{
        // Fallback for browsers that don't support backdrop-blur
        backgroundColor: !CSS.supports('backdrop-filter', 'blur(1px)') ? 'rgb(55, 65, 81)' : undefined
      }}
      onClick={handleBackdropClick}
    >
      {/* Close button - top right */}
      <button
        onClick={onClose}
        className="fixed top-8 right-8 text-white text-4xl hover:text-gray-300 transition-colors z-[10000]"
        aria-label="Close gallery"
      >
        ×
      </button>

      {/* Enlarged Image View */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-8 bg-black/80 z-[9999]"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={GALLERY_IMAGES[selectedImage].url}
              alt={GALLERY_IMAGES[selectedImage].alt}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-4 text-center">
              <p className="font-semibold">{GALLERY_IMAGES[selectedImage].date}</p>
              <p className="text-sm text-gray-300">{GALLERY_IMAGES[selectedImage].location}</p>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Grid */}
      {selectedImage === null && (
        <div className="container mx-auto px-8 py-16">
          <h2 className="font-hero text-white text-8xl mb-8 text-center">G a l l e r y</h2>
          
          {/* Grid - change grid-cols-3 to grid-cols-4 for 4 columns */}
          <div className="grid grid-cols-3 gap-6">
            {GALLERY_IMAGES.map((image, index) => (
              <div
                key={index}
                className="relative cursor-pointer group"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedImage(index)}
              >
                {/* Thumbnail image */}
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className={`w-full aspect-square object-cover transition-transform duration-300 ${
                      hoveredIndex === index ? 'scale-110' : 'scale-100'
                    }`}
                  />
                </div>

                {/* Metadata - shows on hover */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-black/80 text-white p-3 rounded-b-lg transition-all duration-300 ${
                    hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                  }`}
                >
                  <p className="text-sm font-semibold">{image.date}</p>
                  <p className="text-xs text-gray-300">{image.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}