export default function BlockQuote({ children }) {
  return (
    <blockquote className="col-start-2 col-span-9 mb-87.5 m-0 p-0">
      <p className="text-black bg-white text-[4rem] inline-block leading-tight font-bold">
        {children}
      </p>
    </blockquote>
  );
}