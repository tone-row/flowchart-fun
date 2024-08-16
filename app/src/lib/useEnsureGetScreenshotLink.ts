import { useEffect } from "react";
import { docToString, useDoc } from "./useDoc";
import { compressToEncodedURIComponent } from "lz-string";

declare global {
  interface Window {
    __get_screenshot_link__: () => string;
  }
}

/**
 * This hook ensures there is a global function to get the fullscreen link
 */
export function useEnsureGetScreenshotLink() {
  useEffect(() => {
    window.__get_screenshot_link__ = () => {
      const docString = docToString(useDoc.getState());
      const shareLink = compressToEncodedURIComponent(docString);
      const fullscreen = `${
        new URL(window.location.href).origin
      }/f?screenshot=true#${shareLink}`;
      return fullscreen;
    };
  }, []);
}
