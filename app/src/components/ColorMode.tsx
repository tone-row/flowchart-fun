import { useContext, useEffect } from "react";
import { AppContext } from "./AppContext";

// Writes current theme color css props onto body
export default function ColorMode() {
  const { theme } = useContext(AppContext);

  useEffect(() => {
    if (document.documentElement) {
      for (const [key, value] of Object.entries(theme)) {
        document.documentElement.style.setProperty(
          `--color-${key}`,
          value as string
        );
      }
    }
  }, [theme]);
  return null;
}
