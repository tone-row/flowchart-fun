import { FFTheme } from "../FFTheme";

export const content = `
Saraswati Sharma .size_lg.color_pink
  Robert Wilson .color_red
    Sarah Thompson .color_yellow
    David Brown .color_yellow
      Jennifer Lee .color_blue
        Andrew Miller .color_green
        Carrie Richards .color_green
          Terry Peralta .border_dashed
  Lisa Anderson .color_red
    Camille Mitchell .color_yellow
      Christopher White .color_blue
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 0.96,
  lineHeight: 1.4,
  shape: "roundrectangle",
  background: "#fefdf9",
  textMaxWidth: 176,
  padding: 14,
  fontFamily: "Onest",
  curveStyle: "taxi",
  textMarginY: 1,
  borderWidth: 1,
  edgeTextSize: 1,
  edgeWidth: 1,
  sourceArrowShape: "none",
  targetArrowShape: "none",
  edgeColor: "#2a2a26",
  borderColor: "#2a2a26",
  nodeBackground: "#fefdf9",
  nodeForeground: "#2a2a26",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 0,
  arrowScale: 1,
  rotateEdgeLabel: false,
  custom:
    "$background: #fefdf9;\n$color: #2a2a26;\n$red: #f1bfb8;\n$orange: #ff8e16;\n$yellow: #f8edba;\n$green: #b1d1d3;\n$blue: #c1e1f8;\n$pink: #e9b5da;\n$purple: #d0a9e1;\n$grey: #cacaca;\n\n:childless {\n  font-weight: 300;\n}\n\n:childless.color_red {\n  background-color: $red;\n  border-color: #be8179;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n  border-color: #c8bd84;\n}\n:childless.color_green {\n  background-color: $green;\n  border-color: #7ea9a5;\n}\n:childless.color_blue {\n  background-color: $blue;\n  border-color: #89add1;\n}\n:childless.color_purple {\n  background-color: $purple;\n  border-color: #aa82ba;\n}\n:childless.color_pink {\n  background-color: $pink;\n  border-color: #a585b1;\n}\n\n:childless.size_lg {\n  font-size: 24;\n  padding: 18;\n  width: 250;\n  text-max-width: 218;\n  text-margin-y: 2;\n}\n\n:parent {\n  padding: 10;\n  border-style: solid;\n  border-width: 2;\n  border-color: $color;\n  background-color: $background;\n  text-valign: top;\n  label: data(label);\n  color: $color;\n  font-size: 19.5px;\n  text-margin-y: -5;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}\n",
};
