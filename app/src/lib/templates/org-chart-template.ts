import { FFTheme } from "../FFTheme";

const content = `
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

const template = `=====
{
  "cytoscapeStyle": "@import url(\\"https://fonts.googleapis.com/css2?family=Onest:wght@300&display=swap\\");\\n\\n$background: #fefdf9;\\n$color: #2a2a26;\\n$fontFamily: \\"Onest\\", sans-serif;\\n$red: #f1bfb8;\\n$orange: #ff8e16;\\n$yellow: #f8edba;\\n$green: #b1d1d3;\\n$blue: #c1e1f8;\\n$pink: #e9b5da;\\n$purple: #d0a9e1;\\n$grey: #cacaca;\\n\\nedge {\\ntext-wrap: wrap;\\n  width: 1;\\n  curve-style: taxi;\\n  taxi-direction: downward;\\n  line-color: $color;\\n  source-arrow-color: $color;\\n  target-arrow-color: $color;\\n  label: data(label);\\n  text-background-color: $background;\\n  text-background-opacity: 1;\\n  text-background-padding: 5;\\n  font-family: $fontFamily;\\n  font-size: 14;\\n}\\n\\n:childless[textMarginY] {\\n  text-margin-y: data(textMarginY);\\n}\\n\\n:childless[textMarginX] {\\n  text-margin-x: data(textMarginX);\\n}\\n\\n:childless {\\n  label: data(label);\\n  font-family: $fontFamily;\\n  font-size: 16;\\n  text-valign: center;\\n  text-halign: center;\\n  width: 180;\\n  height: label;\\n  padding: 16;\\n  line-height: 1.4;\\n  shape: roundrectangle;\\n  background-color: $background;\\n  color: $color;\\n  border-color: $color;\\n  border-width: 1;\\n  border-style: solid;\\n  font-weight: 300;\\n  text-margin-y: 1;\\n}\\n\\n:childless.color_red {\\n  background-color: $red;\\n  border-color: #be8179;\\n}\\n:childless.color_yellow {\\n  background-color: $yellow;\\n  border-color: #c8bd84;\\n}\\n:childless.color_green {\\n  background-color: $green;\\n  border-color: #7ea9a5;\\n}\\n:childless.color_blue {\\n  background-color: $blue;\\n  border-color: #89add1;\\n}\\n:childless.color_purple {\\n  background-color: $purple;\\n  border-color: #aa82ba;\\n}\\n:childless.color_pink {\\n  background-color: $pink;\\n  border-color: #a585b1;\\n}\\n\\n:childless.shape_rectangle {\\n  shape: rectangle;\\n}\\n:childless.shape_roundrectangle {\\n  shape: roundrectangle;\\n}\\n:childless.shape_ellipse {\\n  shape: ellipse;\\n}\\n:childless.shape_triangle {\\n  shape: triangle;\\n}\\n:childless.shape_pentagon {\\n  shape: pentagon;\\n}\\n:childless.shape_hexagon {\\n  shape: hexagon;\\n}\\n:childless.shape_heptagon {\\n  shape: heptagon;\\n}\\n:childless.shape_octagon {\\n  shape: octagon;\\n}\\n:childless.shape_star {\\n  shape: star;\\n}\\n:childless.shape_barrel {\\n  shape: barrel;\\n}\\n:childless.shape_diamond {\\n  shape: diamond;\\n}\\n:childless.shape_vee {\\n  shape: vee;\\n}\\n:childless.shape_rhomboid {\\n  shape: rhomboid;\\n}\\n:childless.shape_right-rhomboid {\\n  shape: right-rhomboid;\\n}\\n:childless.shape_tag {\\n  shape: tag;\\n}\\n:childless.shape_round-rectangle {\\n  shape: round-rectangle;\\n}\\n:childless.shape_cut-rectangle {\\n  shape: cut-rectangle;\\n}\\n:childless.shape_bottom-round-rectangle {\\n  shape: bottom-round-rectangle;\\n}\\n:childless.shape_concave-hexagon {\\n  shape: concave-hexagon;\\n}\\n:childless.border_none {\\n  border-width: 0;\\n  border-style: solid;\\n}\\n:childless.border_solid {\\n  border-style: solid;\\n}\\n:childless.border_dashed {\\n  border-style: dashed;\\n}\\n:childless.border_dotted {\\n  border-style: dotted;\\n}\\n\\n:childless.size_lg {\\n  font-size: 24;\\n  padding: 18;\\n  width: 250;\\n  text-margin-y: 2;\\n}\\n\\n:childless[w] {\\n  width: data(w);\\n}\\n\\n:childless[h] {\\n  height: data(h);\\n}\\n\\nedge.line_solid {\\n  line-style: solid;\\n}\\nedge.line_dotted {\\n  line-style: dotted;\\n}\\nedge.line_dashed {\\n  line-style: dashed;\\n}\\nedge.target-arrow_triangle {\\n  target-arrow-shape: triangle;\\n}\\nedge.target-arrow_triangle-tee {\\n  target-arrow-shape: triangle-tee;\\n}\\nedge.target-arrow_circle-triangle {\\n  target-arrow-shape: circle-triangle;\\n}\\nedge.target-arrow_triangle-cross {\\n  target-arrow-shape: triangle-cross;\\n}\\nedge.target-arrow_triangle-backcurve {\\n  target-arrow-shape: triangle-backcurve;\\n}\\nedge.target-arrow_vee {\\n  target-arrow-shape: vee;\\n}\\nedge.target-arrow_tee {\\n  target-arrow-shape: tee;\\n}\\nedge.target-arrow_square {\\n  target-arrow-shape: square;\\n}\\nedge.target-arrow_circle {\\n  target-arrow-shape: circle;\\n}\\nedge.target-arrow_diamond {\\n  target-arrow-shape: diamond;\\n}\\nedge.target-arrow_chevron {\\n  target-arrow-shape: chevron;\\n}\\nedge.target-arrow_none {\\n  target-arrow-shape: none;\\n}\\nedge.source-arrow_triangle {\\n  source-arrow-shape: triangle;\\n}\\nedge.source-arrow_triangle-tee {\\n  source-arrow-shape: triangle-tee;\\n}\\nedge.source-arrow_circle-triangle {\\n  source-arrow-shape: circle-triangle;\\n}\\nedge.source-arrow_triangle-cross {\\n  source-arrow-shape: triangle-cross;\\n}\\nedge.source-arrow_triangle-backcurve {\\n  source-arrow-shape: triangle-backcurve;\\n}\\nedge.source-arrow_vee {\\n  source-arrow-shape: vee;\\n}\\nedge.source-arrow_tee {\\n  source-arrow-shape: tee;\\n}\\nedge.source-arrow_square {\\n  source-arrow-shape: square;\\n}\\nedge.source-arrow_circle {\\n  source-arrow-shape: circle;\\n}\\nedge.source-arrow_diamond {\\n  source-arrow-shape: diamond;\\n}\\nedge.source-arrow_chevron {\\n  source-arrow-shape: chevron;\\n}\\nedge.source-arrow_none {\\n  source-arrow-shape: none;\\n}\\n\\n:parent {\\n  padding: 10;\\n  border-style: solid;\\n  border-width: 2;\\n  border-color: $color;\\n  background-color: $background;\\n  text-valign: top;\\n  font-family: $fontFamily;\\n  label: data(label);\\n  color: $color;\\n  font-size: 19.5px;\\n  text-margin-y: -5;\\n}\\n\\n:parent.color_white {\\n  background-color: white;\\n}\\n:parent.color_grey {\\n  background-color: $grey;\\n}\\n",
  "layout": {
    "spacingFactor": 0.96,
    "name": "dagre"
  }
}
=====`;

export { content, template };

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
    '@import url("https://fonts.googleapis.com/css2?family=Onest:wght@300&display=swap");\n\n$background: #fefdf9;\n$color: #2a2a26;\n$fontFamily: "Onest", sans-serif;\n$red: #f1bfb8;\n$orange: #ff8e16;\n$yellow: #f8edba;\n$green: #b1d1d3;\n$blue: #c1e1f8;\n$pink: #e9b5da;\n$purple: #d0a9e1;\n$grey: #cacaca;\n\n:childless {\n  font-weight: 300;\n}\n\n:childless.color_red {\n  background-color: $red;\n  border-color: #be8179;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n  border-color: #c8bd84;\n}\n:childless.color_green {\n  background-color: $green;\n  border-color: #7ea9a5;\n}\n:childless.color_blue {\n  background-color: $blue;\n  border-color: #89add1;\n}\n:childless.color_purple {\n  background-color: $purple;\n  border-color: #aa82ba;\n}\n:childless.color_pink {\n  background-color: $pink;\n  border-color: #a585b1;\n}\n\n:childless.shape_rectangle {\n  shape: rectangle;\n}\n:childless.shape_roundrectangle {\n  shape: roundrectangle;\n}\n:childless.shape_ellipse {\n  shape: ellipse;\n}\n:childless.shape_triangle {\n  shape: triangle;\n}\n:childless.shape_pentagon {\n  shape: pentagon;\n}\n:childless.shape_hexagon {\n  shape: hexagon;\n}\n:childless.shape_heptagon {\n  shape: heptagon;\n}\n:childless.shape_octagon {\n  shape: octagon;\n}\n:childless.shape_star {\n  shape: star;\n}\n:childless.shape_barrel {\n  shape: barrel;\n}\n:childless.shape_diamond {\n  shape: diamond;\n}\n:childless.shape_vee {\n  shape: vee;\n}\n:childless.shape_rhomboid {\n  shape: rhomboid;\n}\n:childless.shape_right-rhomboid {\n  shape: right-rhomboid;\n}\n:childless.shape_tag {\n  shape: tag;\n}\n:childless.shape_round-rectangle {\n  shape: round-rectangle;\n}\n:childless.shape_cut-rectangle {\n  shape: cut-rectangle;\n}\n:childless.shape_bottom-round-rectangle {\n  shape: bottom-round-rectangle;\n}\n:childless.shape_concave-hexagon {\n  shape: concave-hexagon;\n}\n:childless.border_none {\n  border-width: 0;\n  border-style: solid;\n}\n:childless.border_solid {\n  border-style: solid;\n}\n:childless.border_dashed {\n  border-style: dashed;\n}\n:childless.border_dotted {\n  border-style: dotted;\n}\n\n:childless.size_lg {\n  font-size: 24;\n  padding: 18;\n  width: 250;\n  text-max-width: 218;\n  text-margin-y: 2;\n}\n\n:childless[w] {\n  width: data(w);\n}\n\n:childless[h] {\n  height: data(h);\n}\n\nedge.line_solid {\n  line-style: solid;\n}\nedge.line_dotted {\n  line-style: dotted;\n}\nedge.line_dashed {\n  line-style: dashed;\n}\nedge.target-arrow_triangle {\n  target-arrow-shape: triangle;\n}\nedge.target-arrow_triangle-tee {\n  target-arrow-shape: triangle-tee;\n}\nedge.target-arrow_circle-triangle {\n  target-arrow-shape: circle-triangle;\n}\nedge.target-arrow_triangle-cross {\n  target-arrow-shape: triangle-cross;\n}\nedge.target-arrow_triangle-backcurve {\n  target-arrow-shape: triangle-backcurve;\n}\nedge.target-arrow_vee {\n  target-arrow-shape: vee;\n}\nedge.target-arrow_tee {\n  target-arrow-shape: tee;\n}\nedge.target-arrow_square {\n  target-arrow-shape: square;\n}\nedge.target-arrow_circle {\n  target-arrow-shape: circle;\n}\nedge.target-arrow_diamond {\n  target-arrow-shape: diamond;\n}\nedge.target-arrow_chevron {\n  target-arrow-shape: chevron;\n}\nedge.target-arrow_none {\n  target-arrow-shape: none;\n}\nedge.source-arrow_triangle {\n  source-arrow-shape: triangle;\n}\nedge.source-arrow_triangle-tee {\n  source-arrow-shape: triangle-tee;\n}\nedge.source-arrow_circle-triangle {\n  source-arrow-shape: circle-triangle;\n}\nedge.source-arrow_triangle-cross {\n  source-arrow-shape: triangle-cross;\n}\nedge.source-arrow_triangle-backcurve {\n  source-arrow-shape: triangle-backcurve;\n}\nedge.source-arrow_vee {\n  source-arrow-shape: vee;\n}\nedge.source-arrow_tee {\n  source-arrow-shape: tee;\n}\nedge.source-arrow_square {\n  source-arrow-shape: square;\n}\nedge.source-arrow_circle {\n  source-arrow-shape: circle;\n}\nedge.source-arrow_diamond {\n  source-arrow-shape: diamond;\n}\nedge.source-arrow_chevron {\n  source-arrow-shape: chevron;\n}\nedge.source-arrow_none {\n  source-arrow-shape: none;\n}\n\n:parent {\n  padding: 10;\n  border-style: solid;\n  border-width: 2;\n  border-color: $color;\n  background-color: $background;\n  text-valign: top;\n  font-family: $fontFamily;\n  label: data(label);\n  color: $color;\n  font-size: 19.5px;\n  text-margin-y: -5;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}\n',
};
