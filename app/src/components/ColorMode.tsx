import { useContext } from "react";
import { createPortal } from "react-dom";

import { AppContext } from "./AppContext";

// Writes current theme color css props onto body
export default function ColorMode() {
  const { theme } = useContext(AppContext);

  return (
    <>
      {createPortal(
        <style
          dangerouslySetInnerHTML={{
            __html: `:root {${Object.entries(theme)
              .map(([key, value]) => `--color-${key}: ${value};`)
              .join("\n")}}`,
          }}
        />,
        document.head
      )}
    </>
  );
}
