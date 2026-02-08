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

const GALLERY_IMAGES = [
 { 
    url: 'https://c.ststat.net/content/entimg/news/gigs-and-tours-appoints-resale-specialist-twickets-as-official-partner-1483720627-940x600.jpeg', 
    alt: 'Gallery photo 1',
    date: '2024-01-15',
    location: 'London, UK'
  },
  { 
    url: 'https://cdn.prod.website-files.com/655e0fa544c67c1ee5ce01c7/655e0fa544c67c1ee5ce0f58_band-checklist-what-to-bring-to-a-gig.webp', 
    alt: 'Gallery photo 2',
    date: '2024-01-20',
    location: 'Manchester, UK'
  },
  { 
    url: 'https://gigswithivan.uk/wp-content/uploads/2025/12/1070848.jpg?w=1568', 
    alt: 'Gallery photo 3',
    date: '2024-01-25',
    location: 'Brighton, UK'
  },
  { 
    url: 'https://cdn.thedailymash.co.uk/wp-content/uploads/20211005125443/live-gig-667x375-1.jpg', 
    alt: 'Gallery photo 4',
    date: '2024-02-01',
    location: 'Birmingham, UK'
  },
  { 
    url: 'https://assets.londonist.com/uploads/2026/01/i875/sebright-arms-live-room-stage-1-1.jpeg', 
    alt: 'Gallery photo 5',
    date: '2024-02-05',
    location: 'Edinburgh, UK'
  },
  { 
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVmkKdQ9GKMzOcPt3lN0sejAejL2lTBPqcPg&s', 
    alt: 'Gallery photo 6',
    date: '2024-02-10',
    location: 'Liverpool, UK'
  },
    { 
    url: 'https://c.ststat.net/content/entimg/news/gigs-and-tours-appoints-resale-specialist-twickets-as-official-partner-1483720627-940x600.jpeg', 
    alt: 'Gallery photo 1',
    date: '2024-01-15',
    location: 'London, UK'
  },
  { 
    url: 'https://cdn.prod.website-files.com/655e0fa544c67c1ee5ce01c7/655e0fa544c67c1ee5ce0f58_band-checklist-what-to-bring-to-a-gig.webp', 
    alt: 'Gallery photo 2',
    date: '2024-01-20',
    location: 'Manchester, UK'
  },
  { 
    url: 'https://gigswithivan.uk/wp-content/uploads/2025/12/1070848.jpg?w=1568', 
    alt: 'Gallery photo 3',
    date: '2024-01-25',
    location: 'Brighton, UK'
  },
  { 
    url: 'https://cdn.thedailymash.co.uk/wp-content/uploads/20211005125443/live-gig-667x375-1.jpg', 
    alt: 'Gallery photo 4',
    date: '2024-02-01',
    location: 'Birmingham, UK'
  },
  { 
    url: 'https://assets.londonist.com/uploads/2026/01/i875/sebright-arms-live-room-stage-1-1.jpeg', 
    alt: 'Gallery photo 5',
    date: '2024-02-05',
    location: 'Edinburgh, UK'
  },
  { 
    url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVmkKdQ9GKMzOcPt3lN0sejAejL2lTBPqcPg&s', 
    alt: 'Gallery photo 6',
    date: '2024-02-10',
    location: 'Liverpool, UK'
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