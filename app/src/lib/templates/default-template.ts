import { FFTheme } from "../FFTheme";

export const content = `
Begin Typing
  Consider: Adding a Label
    Yes: Option A
      Use an ID to Connect #connect
    No: Option B
      (#connect)
        Now erase the text and try it yourself!`;

export const theme: FFTheme = {
  background: "#FFFFFF",
  fontFamily: "IBM Plex Sans",
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1.1,
  shape: "rectangle",
  nodeBackground: "#f2eded",
  nodeForeground: "#31405b",
  padding: 25,
  borderWidth: 2,
  borderColor: "#31405b",
  textMaxWidth: 150,
  lineHeight: 1.4,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 60,
  curveStyle: "bezier",
  edgeWidth: 1,
  edgeColor: "#000000",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 0,
  arrowScale: 1,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle =
  "$color: #31405b;\n$red: #e63946;\n$orange: #f4a261;\n$yellow: #f1fa3b;\n$green: #2a9d8f;\n$blue: #606ef6;\n$purple: #6d4a7c;\n$grey: #f2eded;\n\n:childless {\n  font-weight: 500;\n}\n\n/** Start */\n:childless[in_degree < 1][out_degree > 0] {\n  border-width: 0;\n  shape: roundrectangle;\n  background-color: $green;\n  color: white;\n}\n\n/** Terminal */\n:childless[out_degree < 1][in_degree > 0] {\n  border-width: 0;\n  shape: roundrectangle;\n  background-color: $red;\n  color: white;\n}\n\n/** Branching */\n:childless[in_degree > 0][in_degree < 2][out_degree > 1] {\n  shape: diamond;\n  background-color: $blue;\n  color: white;\n  height: $width;\n  border-width: 0;\n  text-margin-y: 2;\n}\n\n/** Merging **/\n:childless[in_degree > 1][out_degree > 0][out_degree < 2] {\n}\n\n:childless.color_red {\n  background-color: $red;\n  color: white;\n}\n:childless.color_orange {\n  background-color: $orange;\n  color: white;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n}\n:childless.color_green {\n  background-color: $green;\n  color: white;\n}\n:childless.color_blue {\n  background-color: $blue;\n  color: white;\n}\n:childless.color_purple {\n  background-color: $purple;\n  color: white;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}";
