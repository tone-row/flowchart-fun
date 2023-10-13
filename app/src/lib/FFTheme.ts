/**
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !!!!!!!!!!!! NOTICE !!!!!!!!!!!!!!!!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * If you change this file, you need to run `pnpm -F app theme:schema:generate` to update the
 * json schema file in `app/src/lib/FFTheme.schema.json`.
 */

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

export type Border = "none" | "solid" | "dashed" | "dotted" | "double";

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
  /**
   * The width of the border used on nodes.
   */
  borderWidth: number;
  borderColor: string;
  nodeBackground: string;
  nodeForeground: string;
  /**
   * Whether the node's height should be fixed. Creates a more aesthetically pleasing graph
   * in some cases.
   */
  useFixedHeight: boolean;
  /**
   * The height of the node when `useFixedHeight` is true. Ideal range is between 75 - 250.
   */
  fixedHeight: number;
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
