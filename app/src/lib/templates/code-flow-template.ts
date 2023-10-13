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
  arrowScale: 1.25,
  background: "rgb(248, 248, 248)",
  borderColor: "#6f7280",
  borderWidth: 2,
  curveStyle: "taxi",
  direction: "DOWN",
  edgeColor: "#3a3636",
  edgeTextSize: 14,
  edgeWidth: 1,
  fontFamily: "IBM Plex Sans",
  layoutName: "dagre",
  lineHeight: 1.4,
  nodeBackground: "#6f7280",
  nodeForeground: "white",
  useFixedHeight: false,
  fixedHeight: 0,
  padding: 24,
  rotateEdgeLabel: false,
  shape: "roundrectangle",
  sourceArrowShape: "none",
  sourceDistanceFromNode: 0,
  spacingFactor: 1,
  targetArrowShape: "triangle",
  targetDistanceFromNode: 5,
  textMarginY: 0,
  textMaxWidth: 200,
  custom:
    '$background: rgb(248, 248, 248);\n$color: #000000;\n$fontFamilySans: "IBM Plex Sans";\n$blue: #3375e5;\n$purple: #8b53e6;\n$red: #e63946;\n$orange: #f4a261;\n$yellow: #f1fa3b;\n$green: #72d9b3;\n$grey: #6f7280;\n$lightgrey: #3a3636;\n\n/** Start */\n:childless[in_degree < 1][out_degree > 0] {\n  shape: roundrectangle;\n  border-color: $color;\n  background-color: white;\n  color: $color;\n}\n\n/** Branching */\n:childless[in_degree > 0][in_degree < 2][out_degree > 1] {\n  shape: diamond;\n  border-color: $blue;\n  background-color: #d7e9fc;\n  color: $color;\n  height: 200;\n  text-margin-y: 2;\n}\n\n/** Merging **/\n:childless[in_degree > 1][out_degree > 0][out_degree < 2] {\n}\n\n:childless.color_red {\n  background-color: $red;\n  color: white;\n}\n:childless.color_orange {\n  background-color: $orange;\n  color: white;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n}\n:childless.color_green {\n  border-color: $green;\n  background-color: #f0fbf8;\n  color: $color;\n}\n:childless.color_blue {\n  border-color: $blue;\n  background-color: #d7e9fc;\n  color: $color;\n}\n:childless.color_purple {\n  border-color: $purple;\n  background-color: #e1d8f4;\n  color: $color;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n\n:parent {\n  padding: 10;\n  border-style: solid;\n  border-width: 2;\n  border-color: $color;\n  background-color: $background;\n  text-valign: top;\n  font-family: $fontFamilyMono;\n  label: data(label);\n  color: $color;\n  font-size: 19.5px;\n  text-margin-y: -5;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}',
};
