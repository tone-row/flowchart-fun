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
    '$background: rgb(248, 248, 248);\n$color: #000000;\n$fontFamilySans: "IBM Plex Sans";\n$blue: #3375e5;\n$purple: #8b53e6;\n$red: #e63946;\n$orange: #f4a261;\n$yellow: #f1fa3b;\n$green: #72d9b3;\n$grey: #6f7280;\n$lightgrey: #3a3636;\n\n/** Start */\n:childless[in_degree < 1][out_degree > 0] {\n  shape: roundrectangle;\n  border-color: $color;\n  background-color: white;\n  color: $color;\n}\n\n/** Branching */\n:childless[in_degree > 0][in_degree < 2][out_degree > 1] {\n  shape: diamond;\n  border-color: $blue;\n  background-color: #d7e9fc;\n  color: $color;\n  height: 200;\n  text-margin-y: 2;\n}\n\n/** Merging **/\n:childless[in_degree > 1][out_degree > 0][out_degree < 2] {\n}\n\n:childless.color_red {\n  background-color: $red;\n  color: white;\n}\n:childless.color_orange {\n  background-color: $orange;\n  color: white;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n}\n:childless.color_green {\n  border-color: $green;\n  background-color: #f0fbf8;\n  color: $color;\n}\n:childless.color_blue {\n  border-color: $blue;\n  background-color: #d7e9fc;\n  color: $color;\n}\n:childless.color_purple {\n  border-color: $purple;\n  background-color: #e1d8f4;\n  color: $color;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n\n:childless.shape_rectangle {\n  shape: rectangle;\n}\n:childless.shape_roundrectangle {\n  shape: roundrectangle;\n}\n:childless.shape_ellipse {\n  shape: ellipse;\n}\n:childless.shape_triangle {\n  shape: triangle;\n}\n:childless.shape_pentagon {\n  shape: pentagon;\n}\n:childless.shape_hexagon {\n  shape: hexagon;\n}\n:childless.shape_heptagon {\n  shape: heptagon;\n}\n:childless.shape_octagon {\n  shape: octagon;\n}\n:childless.shape_star {\n  shape: star;\n}\n:childless.shape_barrel {\n  shape: barrel;\n}\n:childless.shape_diamond {\n  shape: diamond;\n}\n:childless.shape_vee {\n  shape: vee;\n}\n:childless.shape_rhomboid {\n  shape: rhomboid;\n}\n:childless.shape_right-rhomboid {\n  shape: right-rhomboid;\n}\n:childless.shape_tag {\n  shape: tag;\n}\n:childless.shape_round-rectangle {\n  shape: round-rectangle;\n}\n:childless.shape_cut-rectangle {\n  shape: cut-rectangle;\n}\n:childless.shape_bottom-round-rectangle {\n  shape: bottom-round-rectangle;\n}\n:childless.shape_concave-hexagon {\n  shape: concave-hexagon;\n}\n:childless.border_none {\n  border-width: 0;\n  border-style: solid;\n}\n:childless.border_solid {\n  border-width: 2;\n  border-style: solid;\n}\n:childless.border_dashed {\n  border-width: 2;\n  border-style: dashed;\n}\n:childless.border_dotted {\n  border-width: 2;\n  border-style: dotted;\n}\n\n:childless[w] {\n  width: data(w);\n}\n\n:childless[h] {\n  height: data(h);\n}\n\nedge.line_solid {\n  line-style: solid;\n}\nedge.line_dotted {\n  line-style: dotted;\n}\nedge.line_dashed {\n  line-style: dashed;\n}\nedge.target-arrow_triangle {\n  target-arrow-shape: triangle;\n}\nedge.target-arrow_triangle-tee {\n  target-arrow-shape: triangle-tee;\n}\nedge.target-arrow_circle-triangle {\n  target-arrow-shape: circle-triangle;\n}\nedge.target-arrow_triangle-cross {\n  target-arrow-shape: triangle-cross;\n}\nedge.target-arrow_triangle-backcurve {\n  target-arrow-shape: triangle-backcurve;\n}\nedge.target-arrow_vee {\n  target-arrow-shape: vee;\n}\nedge.target-arrow_tee {\n  target-arrow-shape: tee;\n}\nedge.target-arrow_square {\n  target-arrow-shape: square;\n}\nedge.target-arrow_circle {\n  target-arrow-shape: circle;\n}\nedge.target-arrow_diamond {\n  target-arrow-shape: diamond;\n}\nedge.target-arrow_chevron {\n  target-arrow-shape: chevron;\n}\nedge.target-arrow_none {\n  target-arrow-shape: none;\n}\nedge.source-arrow_triangle {\n  source-arrow-shape: triangle;\n}\nedge.source-arrow_triangle-tee {\n  source-arrow-shape: triangle-tee;\n}\nedge.source-arrow_circle-triangle {\n  source-arrow-shape: circle-triangle;\n}\nedge.source-arrow_triangle-cross {\n  source-arrow-shape: triangle-cross;\n}\nedge.source-arrow_triangle-backcurve {\n  source-arrow-shape: triangle-backcurve;\n}\nedge.source-arrow_vee {\n  source-arrow-shape: vee;\n}\nedge.source-arrow_tee {\n  source-arrow-shape: tee;\n}\nedge.source-arrow_square {\n  source-arrow-shape: square;\n}\nedge.source-arrow_circle {\n  source-arrow-shape: circle;\n}\nedge.source-arrow_diamond {\n  source-arrow-shape: diamond;\n}\nedge.source-arrow_chevron {\n  source-arrow-shape: chevron;\n}\nedge.source-arrow_none {\n  source-arrow-shape: none;\n}\n\n:parent {\n  padding: 10;\n  border-style: solid;\n  border-width: 2;\n  border-color: $color;\n  background-color: $background;\n  text-valign: top;\n  font-family: $fontFamilyMono;\n  label: data(label);\n  color: $color;\n  font-size: 19.5px;\n  text-margin-y: -5;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}\n',
};
