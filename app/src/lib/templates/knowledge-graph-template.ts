import type { FFTheme } from "shared";

export const content = `
Fall of Ancient Rome .color_purple
  Economic Instability
  Military Spending
  Overexpansion and Political Instability
  Invasion by Barbarian tribes
  Rise of the Eastern Empire
  Dependence on Slave Labor
  Religious Disputes
`;

export const theme: FFTheme = {
  layoutName: "radial",
  direction: "RIGHT",
  spacingFactor: 1.15,
  lineHeight: 1.4,
  shape: "rectangle",
  background: "#efefef",
  textMaxWidth: 125,
  padding: 16,
  fontFamily: "Inclusive Sans",
  curveStyle: "bezier",
  textMarginY: 0,
  borderWidth: 0,
  edgeTextSize: 0.88,
  edgeWidth: 2,
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  edgeColor: "#314137",
  borderColor: "#314137",
  nodeBackground: "#ffffff",
  nodeForeground: "#314137",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 4,
  arrowScale: 1.25,
  rotateEdgeLabel: true,
  useFixedHeight: false,
  fixedHeight: 90,
};

export const cytoscapeStyle =
  "$green: #75ed99;\n$red: #f88373;\n$orange: #ffb566;\n$purple: #a7a3fa;\n$grey: #d3cec8;\n\n:childless.color_red {\n  background-color: $red;\n}\n:childless.color_orange {\n  background-color: $orange;\n}\n:childless.color_green {\n  background-color: $green;\n}\n:childless.color_purple {\n  background-color: $purple;\n}\n:childless.color_grey {\n  background-color: $grey;\n}";
