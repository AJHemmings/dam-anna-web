export default function Container({ children, className = "" }) {
  return (
    <div className={`container max-W-[1400px] mx-auto px-4 ${className}`}>
      {children}
    </div>
  );
}