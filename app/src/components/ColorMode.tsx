import { useContext, useEffect } from "react";
import { AppContext } from "./AppContext";

export default function ColorMode() {
  const { theme } = useContext(AppContext);
  const themeString = JSON.stringify(theme);
  useEffect(() => {
    const theme = JSON.parse(themeString);

    if (document.body) {
      for (const [key, value] of Object.entries(theme)) {
        document.body.style.setProperty(`--color-${key}`, value as string);
      }
    }
  }, [themeString]);
  return null;
}
