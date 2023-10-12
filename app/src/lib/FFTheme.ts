export type LayoutName =
  | "dagre"
  | "klay"
  | "breadthfirst"
  | "cose"
  | "concentric"
  | "circle"
  | "layered"
  | "mrtree"
  | "stress"
  | "radial";

export type LayoutDirection = "TB" | "LR" | "RL" | "BT";

export type Direction = "RIGHT" | "LEFT" | "DOWN" | "UP";

export type Shape = "rectangle" | "roundrectangle" | "ellipse";

export type CurveStyle = "bezier" | "taxi";

export type ArrowShape =
  | "none"
  | "triangle"
  | "vee"
  | "triangle-backcurve"
  | "circle";

export type FFTheme = {
  // Global Style
  fontFamily: string;
  background: string;
  lineHeight: number;
  // Layout
  layoutName: LayoutName;
  direction: Direction;
  spacingFactor: number;
  // Node
  shape: Shape;
  textMaxWidth: number;
  padding: number;
  curveStyle: CurveStyle;
  textMarginY: number;
  borderWidth: number;
  borderColor: string;
  nodeBackground: string;
  nodeForeground: string;
  // Text size on edge labels relative to node
  edgeTextSize: number;
  edgeWidth: number;
  sourceArrowShape: ArrowShape;
  targetArrowShape: ArrowShape;
  edgeColor: string;
  sourceDistanceFromNode: number;
  targetDistanceFromNode: number;
  arrowScale: number;
  rotateEdgeLabel: boolean;
  // Advanced Style String
  custom?: string;
};
