import cytoscape from "cytoscape";

export type LayoutName =
  | "dagre"
  | "klay"
  | "breadthfirst"
  | "cose"
  | "concentric"
  | "circle"
  | "layered"
  | "tree"
  | "stress"
  | "radial";

export type LayoutDirection = "TB" | "LR" | "RL" | "BT";

export type FFTheme = {
  layoutName: LayoutName;
  layoutDirection: LayoutDirection;
};

/**
 * Takes some input and returns a cytoscape layout and style object
 */
export function toTheme(theme: FFTheme) {
  const layout: cytoscape.LayoutOptions = {
    name: theme.layoutName,
  };
  const style: cytoscape.Stylesheet[] = [];

  return {
    layout,
    style,
  };
}
