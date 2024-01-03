export function FlowchartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full md:px-8 md:pt-8 bg-[#f2f1f1] grid grid-rows-[auto_minmax(0,1fr)]">
      {children}
    </div>
  );
}
