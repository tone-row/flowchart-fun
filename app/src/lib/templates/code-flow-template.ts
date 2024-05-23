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
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1.15,

  background: "#f8f8f8",
  fontFamily: "IBM Plex Sans",

  shape: "roundrectangle",
  nodeBackground: "#9397a6",
  nodeForeground: "#ffffff",
  padding: 19,
  borderWidth: 2,
  borderColor: "#8f95b1",
  textMaxWidth: 146,
  lineHeight: 1.4,
  textMarginY: 1.5,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "round-taxi",
  edgeWidth: 2,
  edgeColor: "#9a9a9a",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 5,
  arrowScale: 1,
  edgeTextSize: 1,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle =
  "$background: rgb(248, 248, 248);\n$color: #000000;\n$blue: #3375e5;\n$purple: #8646ed;\n$red: #e63946;\n$orange: #f4a261;\n$yellow: #f1fa3b;\n$green: #72d9b3;\n$grey: #474747;\n$lightgrey: #3a3636;\n\n/** Start */\n:childless[in_degree < 1][out_degree > 0] {\n  shape: roundrectangle;\n  border-color: $color;\n  background-color: white;\n  color: $color;\n}\n\n/** Branching */\n:childless[in_degree > 0][in_degree < 2][out_degree > 1] {\n  shape: diamond;\n  border-color: $blue;\n  background-color: #d7e9fc;\n  color: $color;\n  height: $width;\n  text-margin-y: 2;\n}\n\n/** Merging **/\n:childless[in_degree > 1][out_degree > 0][out_degree < 2] {\n}\n\n:childless.color_red {\n  background-color: $red;\n  color: white;\n}\n:childless.color_orange {\n  background-color: $orange;\n  color: white;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n}\n:childless.color_green {\n  border-color: $green;\n  background-color: #f0fbf8;\n  color: $color;\n}\n:childless.color_blue {\n  border-color: $blue;\n  background-color: $blue;\n}\n:childless.color_purple {\n  border-color: $purple;\n  background-color: $purple;\n}\n:childless.color_grey {\n  background-color: $grey;\n  border-color: $grey;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}";
