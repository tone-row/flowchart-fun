import { FFTheme } from "../FFTheme";

export const content = `
Database
  Fetch Blog API .color_blue
    (#display)
  Post Comments API .color_green

DisplayBlog\\(\\) #display.color_purple
  (User)
useEffect\\(\\) #effect
  DisplayComments\\(\\) .color_purple
    (User)
Post Comment UI .color_purple
  POST
    (Post Comments API)

User
  (Post Comment UI)
`;

export const theme: FFTheme = {
  arrowScale: 1,
  background: "#f8f8f8",
  borderColor: "#6f7280",
  borderWidth: 2,
  curveStyle: "taxi",
  direction: "DOWN",
  edgeColor: "#b9a6a6",
  edgeTextSize: 1,
  edgeWidth: 2,
  fontFamily: "IBM Plex Sans",
  layoutName: "dagre",
  lineHeight: 1.4,
  nodeBackground: "#6f7280",
  nodeForeground: "#ffffff",
  padding: 19,
  rotateEdgeLabel: false,
  shape: "roundrectangle",
  sourceArrowShape: "none",
  sourceDistanceFromNode: 0,
  spacingFactor: 1,
  targetArrowShape: "triangle",
  targetDistanceFromNode: 5,
  textMarginY: 1.5,
  textMaxWidth: 146,
  useFixedHeight: false,
  fixedHeight: 50,
};

export const cytoscapeStyle =
  "$background: rgb(248, 248, 248);\n$color: #000000;\n$blue: #3375e5;\n$purple: #8b53e6;\n$red: #e63946;\n$orange: #f4a261;\n$yellow: #f1fa3b;\n$green: #72d9b3;\n$grey: #6f7280;\n$lightgrey: #3a3636;\n\n/** Start */\n:childless[in_degree < 1][out_degree > 0] {\n  shape: roundrectangle;\n  border-color: $color;\n  background-color: white;\n  color: $color;\n}\n\n/** Branching */\n:childless[in_degree > 0][in_degree < 2][out_degree > 1] {\n  shape: diamond;\n  border-color: $blue;\n  background-color: #d7e9fc;\n  color: $color;\n  height: $width;\n  text-margin-y: 2;\n}\n\n/** Merging **/\n:childless[in_degree > 1][out_degree > 0][out_degree < 2] {\n}\n\n:childless.color_red {\n  background-color: $red;\n  color: white;\n}\n:childless.color_orange {\n  background-color: $orange;\n  color: white;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n}\n:childless.color_green {\n  border-color: $green;\n  background-color: #f0fbf8;\n  color: $color;\n}\n:childless.color_blue {\n  border-color: $blue;\n  background-color: #d7e9fc;\n  color: $color;\n}\n:childless.color_purple {\n  border-color: $purple;\n  background-color: #e1d8f4;\n  color: $color;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}";
