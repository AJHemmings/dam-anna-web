/**
 * FramedSection - Reusable framed container with decorative border
 * 
 * Customization:
 * - borderImage: Change /boarder1.png to use different frame
 * - borderWidth: Adjust frame thickness (currently 30px)
 * - boxShadow: Modify edge blur effect
 * - bg-black/70: Change overlay darkness (70% = darker, 50% = lighter)
 * - Width: Pass via className prop (e.g., className="w-[600px]")
 */
export default function FramedSection({ children, className = "" }) {
  return (
    <div 
      className={`p-4 text-[1.25rem] leading-relaxed bg-cover bg-center relative ${className}`}
      style={{ 
        borderImage: 'url(/boarder1.png) 60 stretch',
        borderWidth: '30px',
        borderStyle: 'solid',
        boxShadow: 'inset 0 0 40px 20px rgba(0, 0, 0, 0.8)'
      }}
    >
      {/* Dark overlay for readability - adjust opacity via bg-black/XX */}
      <div className="absolute inset-0 bg-black/70 -z-10 blur-sm"></div>
      
      {children}
    </div>
  );
}