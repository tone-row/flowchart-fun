export function FlowchartLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full md:px-8 md:pt-4 lg:pt-6 bg-[#f2f1f1] grid grid-rows-[auto_minmax(0,1fr)] 2xl:px-16 dark:bg-[#0c0c0c]">
      {children}
    </div>
  );
}
