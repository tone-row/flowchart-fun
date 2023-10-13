import { FFTheme } from "../FFTheme";

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
  layoutName: "cose",
  direction: "RIGHT",
  spacingFactor: 1.5,
  lineHeight: 1.4,
  shape: "rectangle",
  background: "rgb(239, 239, 239)",
  textMaxWidth: 100,
  padding: 20,
  fontFamily: "Inclusive Sans",
  curveStyle: "bezier",
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 0,
  borderWidth: 0,
  edgeTextSize: 0.88,
  edgeWidth: 2,
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  edgeColor: "#314137",
  borderColor: "#314137",
  nodeBackground: "white",
  nodeForeground: "#314137",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 4,
  arrowScale: 1.25,
  rotateEdgeLabel: true,
};

export const cytoscapeStyle =
  "$background: rgb(239, 239, 239);\n$color: #314137;\n$green: #75ed99;\n$red: #f88373;\n$orange: #ffb566;\n$purple: #a7a3fa;\n$grey: #d3cec8;\n\n:childless {\n  font-weight: 500;\n}\n\n:childless.color_red {\n  background-color: $red;\n}\n:childless.color_orange {\n  background-color: $orange;\n}\n:childless.color_green {\n  background-color: $green;\n}\n:childless.color_purple {\n  background-color: $purple;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n\n:parent {\n  padding: 10;\n  border-style: solid;\n  border-width: 2;\n  border-color: $color;\n  background-color: $background;\n  text-valign: top;\n  font-family: $fontFamily;\n  label: data(label);\n  color: $color;\n  font-size: 19.5px;\n  text-margin-y: -5;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}\n'";
