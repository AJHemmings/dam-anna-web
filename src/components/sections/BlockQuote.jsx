export default function BlockQuote({ children }) {
  return (
    <div 
      className="col-start-2 col-span-9 mb-87.5 flex justify-start"
    >
      <div
        className="p-8 relative inline-block"
        style={{ 
          borderImage: 'url(/boarder1.png) 60 stretch',
          borderWidth: '30px',
          borderStyle: 'solid',
          boxShadow: 'inset 0 0 40px 20px rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* White background fill */}
        <div className="absolute inset-0 bg-white/70 -z-10 blur-lg"></div>
        
        {/* Black text on white */}
        <p className="text-black text-[7rem] leading-tight font-hero relative z-10">
          {children}
        </p>
      </div>
    </div>
  );
}