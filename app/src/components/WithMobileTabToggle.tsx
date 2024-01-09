import { ReactNode } from "react";

import { useFullscreen } from "../lib/hooks";
import MobileTabToggle from "./MobileTabToggle";
import { useMobileStore } from "../lib/useMobileStore";
/**
 * Adds the wrapper for the toggle between the editor and the graph
 * on mobile.
 */
export function WithMobileTabToggle({ children }: { children: ReactNode }) {
  const tab = useMobileStore((state) => state.tab);
  const isFullscreen = useFullscreen();
  return (
    <div
      className="grid grid-rows-[[main]_minmax(0,1fr)_auto] grid-cols-[[main]_minmax(0,1fr)] max-h-full overflow-hidden md:flex md:px-8 md:pt-8 bg-neutral-50"
      data-mobile-tab={tab}
    >
      {children}
      {!isFullscreen && <MobileTabToggle />}
    </div>
  );
}
