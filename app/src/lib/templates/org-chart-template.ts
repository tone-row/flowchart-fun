import { FFTheme } from "../FFTheme";

export const content = `
Saraswati Sharma .size_lg.color_black\n  Robert Wilson\n    Sarah Thompson\n    David Brown\n      Jennifer Lee\n        Andrew Miller .color_green\n        Carrie Richards .color_green\n          Terry Peralta .color_green\n  Lisa Anderson .color_purple\n    Camille Mitchell .color_purple\n      Christopher White .color_purple\n
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 0.96,
  lineHeight: 1.4,
  shape: "roundrectangle",
  background: "#ffffff",
  textMaxWidth: 142,
  padding: 16,
  fontFamily: "Overpass",
  curveStyle: "round-taxi",
  textMarginY: 2.5,
  borderWidth: 2,
  edgeTextSize: 1,
  edgeWidth: 2,
  useFixedHeight: false,
  fixedHeight: 60,
  sourceArrowShape: "none",
  targetArrowShape: "none",
  edgeColor: "#b6b6b6",
  borderColor: "#dadada",
  nodeBackground: "#f4f4f4",
  nodeForeground: "#2a2a2a",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 0,
  arrowScale: 1,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle =
  "edge {taxi-radius: 40px;}\n\n$red: #ffd1cb;\n$orange: #ff8e16;\n$yellow: #fff7d5;\n$green: #bcfcff;\n$blue: #c1e1f8;\n$pink: #ffe7f7;\n$purple: #eec6ff;\n$grey: #cacaca;\n\n:childless {\n  font-weight: 300;\n}\n\n:childless.color_red {\n  background-color: $red;\n  border-color: #b38d88;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n  border-color: #c8bd84;\n}\n:childless.color_green {\n  background-color: $green;\n  border-color: #60c8bd;\n}\n:childless.color_blue {\n  background-color: $blue;\n  border-color: #89add1;\n}\n:childless.color_purple {\n  background-color: $purple;\n  border-color: #aa82ba;\n}\n:childless.color_pink {\n  background-color: $pink;\n  border-color: #c5aacf;\n}\n:childless.color_black {\n  background-color: black;\n  border-color: black;\n  color: white;\n}\n\n:childless.size_lg {\n  font-size: 24;\n  padding: 18;\n  width: 250;\n  text-max-width: 218;\n  text-margin-y: 3;\n}";
