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
  background: "white",
  borderColor: "black",
  borderWidth: 1.5,
  curveStyle: "bezier",
  direction: "RIGHT",
  edgeColor: "#314137",
  edgeTextSize: 14,
  edgeWidth: 1.5,
  fontFamily: "Kalam",
  layoutName: "cose",
  lineHeight: 1.2,
  nodeBackground: "white",
  nodeForeground: "#314137",
  padding: 16,
  rotateEdgeLabel: false,
  shape: "ellipse",
  sourceArrowShape: "none",
  sourceDistanceFromNode: 0,
  spacingFactor: 1.14,
  targetArrowShape: "triangle-backcurve",
  targetDistanceFromNode: 7,
  textMarginY: 2,
  textMaxWidth: 100,
  custom:
    "$background: white;\n$color: #314137;\n$green: #ddff75;\n$blue: #bde2ff;\n$orange: #ffe253;\n$pink: #ffb6bc;\n$grey: #f2f0ea;\n$borderWidth: 1.5;\n\n:childless.size_lg {\n  font-size: 30;\n  width: 150;\n  line-height: 1;\n  text-max-width: 130;\n}\n\n:childless.color_orange {\n  background-color: $orange;\n}\n:childless.color_green {\n  background-color: $green;\n}\n:childless.color_pink {\n  background-color: $pink;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n:childless.color_blue {\n  background-color: $blue;\n}\n\n:parent {\n  padding: 10;\n  border-style: solid;\n  border-width: 2;\n  border-color: $color;\n  background-color: $background;\n  text-valign: top;\n  label: data(label);\n  color: $color;\n  font-size: 19.5px;\n  text-margin-y: -5;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}\n",
};
