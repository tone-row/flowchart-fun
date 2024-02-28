import type { FFTheme } from "shared";

export const content = `
Mind Mapping .size_lg
  Learning Style .color_blue
    Read .color_blue
    Listen .color_blue
    Summarize .color_blue
  Motivation .color_orange
    Tips .color_orange
    Roadmap .color_orange
  Review .color_green
    Notes .color_green
    Method .color_green
    Discuss .color_green
`;

export const theme: FFTheme = {
  layoutName: "cose",
  direction: "RIGHT",
  spacingFactor: 0.95,
  lineHeight: 1.2,
  shape: "ellipse",
  background: "#ffffff",
  textMaxWidth: 100,
  padding: 17,
  fontFamily: "Kalam",
  curveStyle: "bezier",
  textMarginY: 2,
  borderWidth: 0,
  edgeTextSize: 0.8,
  edgeWidth: 2,
  sourceArrowShape: "none",
  targetArrowShape: "triangle-backcurve",
  edgeColor: "#314137",
  borderColor: "#000000",
  nodeBackground: "#ffffff",
  nodeForeground: "#314137",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 7,
  arrowScale: 1.25,
  rotateEdgeLabel: false,
  useFixedHeight: false,
  fixedHeight: 130,
};

export const cytoscapeStyle =
  "$green: #ddff75;\n$blue: #bde2ff;\n$orange: #ffe253;\n$pink: #ffb6bc;\n$grey: #f2f0ea;\n\n:childless.size_lg {\n  font-size: 30;\n  width: 150;\n  line-height: 1;\n  text-max-width: 130;\n}\n\n:childless.color_orange {\n  background-color: $orange;\n}\n:childless.color_green {\n  background-color: $green;\n}\n:childless.color_pink {\n  background-color: $pink;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n:childless.color_blue {\n  background-color: $blue;\n}";
