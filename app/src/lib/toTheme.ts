type LayoutName =
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

type FFTheme = {
  layoutName: LayoutName;
};

/**
 * Takes some input and returns a cytoscape layout and style object
 */
export function toTheme() {}
