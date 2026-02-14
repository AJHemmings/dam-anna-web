export default function Container({ children, className = "" }) {
  return (
    <div className={`container max-w-[1400px] mx-auto px-2 lg:px-4 ${className}`}>
      {children}
    </div>
  );
}
