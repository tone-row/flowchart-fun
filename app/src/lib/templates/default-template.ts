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
  curveStyle: "bezier",
  edgeWidth: 1,
  edgeColor: "#000000",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 0,
  arrowScale: 1,
  edgeTextSize: 14 / 16,
  rotateEdgeLabel: false,
  custom:
    '$background: white;\n$color: #31405b;\n$fontFamily: "IBM Plex Sans", sans-serif;\n$red: #e63946;\n$orange: #f4a261;\n$yellow: #f1fa3b;\n$green: #2a9d8f;\n$blue: #606ef6;\n$purple: #6d4a7c;\n$grey: #f2eded;\n\n:childless {\n  color: #31405b;\n  font-weight: 500;\n}\n\n/** Start */\n:childless[in_degree < 1][out_degree > 0] {\n  border-width: 0;\n  shape: roundrectangle;\n  background-color: $green;\n  color: white;\n}\n\n/** Terminal */\n:childless[out_degree < 1][in_degree > 0] {\n  border-width: 0;\n  shape: roundrectangle;\n  background-color: $red;\n  color: white;\n}\n\n/** Branching */\n:childless[in_degree > 0][in_degree < 2][out_degree > 1] {\n  shape: diamond;\n  background-color: $blue;\n  color: white;\n  height: 200;\n  border-width: 0;\n  text-margin-y: 2;\n}\n\n/** Merging **/\n:childless[in_degree > 1][out_degree > 0][out_degree < 2] {\n}\n\n:childless.color_red {\n  background-color: $red;\n  color: white;\n}\n:childless.color_orange {\n  background-color: $orange;\n  color: white;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n}\n:childless.color_green {\n  background-color: $green;\n  color: white;\n}\n:childless.color_blue {\n  background-color: $blue;\n  color: white;\n}\n:childless.color_purple {\n  background-color: $purple;\n  color: white;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n\n:childless.shape_rectangle {\n  shape: rectangle;\n}\n:childless.shape_roundrectangle {\n  shape: roundrectangle;\n}\n:childless.shape_ellipse {\n  shape: ellipse;\n}\n:childless.shape_triangle {\n  shape: triangle;\n}\n:childless.shape_pentagon {\n  shape: pentagon;\n}\n:childless.shape_hexagon {\n  shape: hexagon;\n}\n:childless.shape_heptagon {\n  shape: heptagon;\n}\n:childless.shape_octagon {\n  shape: octagon;\n}\n:childless.shape_star {\n  shape: star;\n}\n:childless.shape_barrel {\n  shape: barrel;\n}\n:childless.shape_diamond {\n  shape: diamond;\n}\n:childless.shape_vee {\n  shape: vee;\n}\n:childless.shape_rhomboid {\n  shape: rhomboid;\n}\n:childless.shape_right-rhomboid {\n  shape: right-rhomboid;\n}\n:childless.shape_tag {\n  shape: tag;\n}\n:childless.shape_round-rectangle {\n  shape: round-rectangle;\n}\n:childless.shape_cut-rectangle {\n  shape: cut-rectangle;\n}\n:childless.shape_bottom-round-rectangle {\n  shape: bottom-round-rectangle;\n}\n:childless.shape_concave-hexagon {\n  shape: concave-hexagon;\n}\n:childless.border_none {\n  border-width: 0;\n  border-style: solid;\n}\n:childless.border_solid {\n  border-width: 2;\n  border-style: solid;\n}\n:childless.border_dashed {\n  border-width: 2;\n  border-style: dashed;\n}\n:childless.border_dotted {\n  border-width: 2;\n  border-style: dotted;\n}\n\n:childless[w] {\n  width: data(w);\n}\n\n:childless[h] {\n  height: data(h);\n}\n\nedge.line_solid {\n  line-style: solid;\n}\nedge.line_dotted {\n  line-style: dotted;\n}\nedge.line_dashed {\n  line-style: dashed;\n}\nedge.target-arrow_triangle {\n  target-arrow-shape: triangle;\n}\nedge.target-arrow_triangle-tee {\n  target-arrow-shape: triangle-tee;\n}\nedge.target-arrow_circle-triangle {\n  target-arrow-shape: circle-triangle;\n}\nedge.target-arrow_triangle-cross {\n  target-arrow-shape: triangle-cross;\n}\nedge.target-arrow_triangle-backcurve {\n  target-arrow-shape: triangle-backcurve;\n}\nedge.target-arrow_vee {\n  target-arrow-shape: vee;\n}\nedge.target-arrow_tee {\n  target-arrow-shape: tee;\n}\nedge.target-arrow_square {\n  target-arrow-shape: square;\n}\nedge.target-arrow_circle {\n  target-arrow-shape: circle;\n}\nedge.target-arrow_diamond {\n  target-arrow-shape: diamond;\n}\nedge.target-arrow_chevron {\n  target-arrow-shape: chevron;\n}\nedge.target-arrow_none {\n  target-arrow-shape: none;\n}\nedge.source-arrow_triangle {\n  source-arrow-shape: triangle;\n}\nedge.source-arrow_triangle-tee {\n  source-arrow-shape: triangle-tee;\n}\nedge.source-arrow_circle-triangle {\n  source-arrow-shape: circle-triangle;\n}\nedge.source-arrow_triangle-cross {\n  source-arrow-shape: triangle-cross;\n}\nedge.source-arrow_triangle-backcurve {\n  source-arrow-shape: triangle-backcurve;\n}\nedge.source-arrow_vee {\n  source-arrow-shape: vee;\n}\nedge.source-arrow_tee {\n  source-arrow-shape: tee;\n}\nedge.source-arrow_square {\n  source-arrow-shape: square;\n}\nedge.source-arrow_circle {\n  source-arrow-shape: circle;\n}\nedge.source-arrow_diamond {\n  source-arrow-shape: diamond;\n}\nedge.source-arrow_chevron {\n  source-arrow-shape: chevron;\n}\nedge.source-arrow_none {\n  source-arrow-shape: none;\n}\n\n:parent {\n  padding: 10;\n  border-style: solid;\n  border-width: 2;\n  border-color: $color;\n  background-color: $background;\n  text-valign: top;\n  font-family: $fontFamily;\n  label: data(label);\n  color: $color;\n  font-size: 19.5px;\n  text-margin-y: -5;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}',
};
