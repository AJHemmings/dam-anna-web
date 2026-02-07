export default function FramedSection({ children, className = "" }) {
  return (
    <div 
      className={`p-4 text-[1.25rem] leading-relaxed bg-cover bg-center relative w-[800px] ${className}`}
      style={{ 
        borderImage: 'url(/boarder1.png) 60 stretch',
        borderWidth: '30px',
        borderStyle: 'solid',
        boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70 -z-10 blur-sm"></div>
      
      {children}
    </div>
  );
}