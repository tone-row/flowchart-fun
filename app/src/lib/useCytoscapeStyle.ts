import { usePreviewTheme } from "../components/ThemePicker";
import { useDoc } from "./useDoc";

export function useCytoscapeStyle() {
  const previewStyle = usePreviewTheme((s) => s.cytoscapeStyle);
  const docStyle = useDoc((s) => s.meta?.cytoscapeStyle as string);
  const style = previewStyle ?? docStyle;
  if (typeof style !== "string" || !style) return "";
  return style;
}
