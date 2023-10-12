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
    '@import url("https://fonts.googleapis.com/css2?family=Kalam&display=swap");\n\n$background: white;\n$color: #314137;\n$fontFamily: "Kalam", sans-serif;\n$green: #ddff75;\n$blue: #bde2ff;\n$orange: #ffe253;\n$pink: #ffb6bc;\n$grey: #f2f0ea;\n$borderWidth: 1.5;\n\n:childless.size_lg {\n  font-size: 30;\n  width: 150;\n  line-height: 1;\n  text-max-width: 130;\n}\n\n:childless.color_orange {\n  background-color: $orange;\n}\n:childless.color_green {\n  background-color: $green;\n}\n:childless.color_pink {\n  background-color: $pink;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n:childless.color_blue {\n  background-color: $blue;\n}\n\n:childless.shape_rectangle {\n  shape: rectangle;\n}\n:childless.shape_roundrectangle {\n  shape: roundrectangle;\n}\n:childless.shape_ellipse {\n  shape: ellipse;\n}\n:childless.shape_triangle {\n  shape: triangle;\n}\n:childless.shape_pentagon {\n  shape: pentagon;\n}\n:childless.shape_hexagon {\n  shape: hexagon;\n}\n:childless.shape_heptagon {\n  shape: heptagon;\n}\n:childless.shape_octagon {\n  shape: octagon;\n}\n:childless.shape_star {\n  shape: star;\n}\n:childless.shape_barrel {\n  shape: barrel;\n}\n:childless.shape_diamond {\n  shape: diamond;\n}\n:childless.shape_vee {\n  shape: vee;\n}\n:childless.shape_rhomboid {\n  shape: rhomboid;\n}\n:childless.shape_right-rhomboid {\n  shape: right-rhomboid;\n}\n:childless.shape_tag {\n  shape: tag;\n}\n:childless.shape_round-rectangle {\n  shape: round-rectangle;\n}\n:childless.shape_cut-rectangle {\n  shape: cut-rectangle;\n}\n:childless.shape_bottom-round-rectangle {\n  shape: bottom-round-rectangle;\n}\n:childless.shape_concave-hexagon {\n  shape: concave-hexagon;\n}\n:childless.border_none {\n  border-width: 0;\n  border-style: solid;\n}\n:childless.border_solid {\n  border-width: 2;\n  border-style: solid;\n}\n:childless.border_dashed {\n  border-width: 2;\n  border-style: dashed;\n}\n:childless.border_dotted {\n  border-width: 2;\n  border-style: dotted;\n}\n\n:childless[w] {\n  width: data(w);\n}\n\n:childless[h] {\n  height: data(h);\n}\n\nedge.line_solid {\n  line-style: solid;\n}\nedge.line_dotted {\n  line-style: dotted;\n}\nedge.line_dashed {\n  line-style: dashed;\n}\nedge.target-arrow_triangle {\n  target-arrow-shape: triangle;\n}\nedge.target-arrow_triangle-tee {\n  target-arrow-shape: triangle-tee;\n}\nedge.target-arrow_circle-triangle {\n  target-arrow-shape: circle-triangle;\n}\nedge.target-arrow_triangle-cross {\n  target-arrow-shape: triangle-cross;\n}\nedge.target-arrow_triangle-backcurve {\n  target-arrow-shape: triangle-backcurve;\n}\nedge.target-arrow_vee {\n  target-arrow-shape: vee;\n}\nedge.target-arrow_tee {\n  target-arrow-shape: tee;\n}\nedge.target-arrow_square {\n  target-arrow-shape: square;\n}\nedge.target-arrow_circle {\n  target-arrow-shape: circle;\n}\nedge.target-arrow_diamond {\n  target-arrow-shape: diamond;\n}\nedge.target-arrow_chevron {\n  target-arrow-shape: chevron;\n}\nedge.target-arrow_none {\n  target-arrow-shape: none;\n}\nedge.source-arrow_triangle {\n  source-arrow-shape: triangle;\n}\nedge.source-arrow_triangle-tee {\n  source-arrow-shape: triangle-tee;\n}\nedge.source-arrow_circle-triangle {\n  source-arrow-shape: circle-triangle;\n}\nedge.source-arrow_triangle-cross {\n  source-arrow-shape: triangle-cross;\n}\nedge.source-arrow_triangle-backcurve {\n  source-arrow-shape: triangle-backcurve;\n}\nedge.source-arrow_vee {\n  source-arrow-shape: vee;\n}\nedge.source-arrow_tee {\n  source-arrow-shape: tee;\n}\nedge.source-arrow_square {\n  source-arrow-shape: square;\n}\nedge.source-arrow_circle {\n  source-arrow-shape: circle;\n}\nedge.source-arrow_diamond {\n  source-arrow-shape: diamond;\n}\nedge.source-arrow_chevron {\n  source-arrow-shape: chevron;\n}\nedge.source-arrow_none {\n  source-arrow-shape: none;\n}\n\n:parent {\n  padding: 10;\n  border-style: solid;\n  border-width: 2;\n  border-color: $color;\n  background-color: $background;\n  text-valign: top;\n  font-family: $fontFamily;\n  label: data(label);\n  color: $color;\n  font-size: 19.5px;\n  text-margin-y: -5;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}\n',
};
