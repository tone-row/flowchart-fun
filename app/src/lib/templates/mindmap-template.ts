import { FFTheme } from "../FFTheme";

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
  arrowScale: 1.25,
  background: "#ffffff",
  borderColor: "#000000",
  borderWidth: 0,
  curveStyle: "bezier",
  direction: "RIGHT",
  edgeColor: "#314137",
  edgeTextSize: 0.8,
  edgeWidth: 2,
  fontFamily: "Kalam",
  layoutName: "cose",
  lineHeight: 1.2,
  nodeBackground: "#ffffff",
  nodeForeground: "#314137",
  padding: 17,
  rotateEdgeLabel: false,
  shape: "ellipse",
  sourceArrowShape: "none",
  sourceDistanceFromNode: 0,
  spacingFactor: 0.95,
  targetArrowShape: "triangle-backcurve",
  targetDistanceFromNode: 7,
  textMarginY: 2,
  textMaxWidth: 100,
  useFixedHeight: false,
  fixedHeight: 130,
};

export const cytoscapeStyle =
  "$green: #ddff75;\n$blue: #bde2ff;\n$orange: #ffe253;\n$pink: #ffb6bc;\n$grey: #f2f0ea;\n\n:childless.size_lg {\n  font-size: 30;\n  width: 150;\n  line-height: 1;\n  text-max-width: 130;\n}\n\n:childless.color_orange {\n  background-color: $orange;\n}\n:childless.color_green {\n  background-color: $green;\n}\n:childless.color_pink {\n  background-color: $pink;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n:childless.color_blue {\n  background-color: $blue;\n}";
