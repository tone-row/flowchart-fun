import { FFTheme } from "../toTheme";

export const theme: FFTheme = {
  background: "#FFFFFF",
  fontFamily: "IBM Plex Sans",
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1.25,
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
  custom: `@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500&display=swap");

  $background: white;
  $color: #31405b;
  $fontFamily: "IBM Plex Sans", sans-serif;
  $red: #e63946;
  $orange: #f4a261;
  $yellow: #f1fa3b;
  $green: #2a9d8f;
  $blue: #606ef6;
  $purple: #6d4a7c;
  $grey: #f2eded;
  
  :childless {
    color: #31405b;
    font-weight: 500;
  }
  
  /** Start */
  :childless[in_degree < 1][out_degree > 0] {
    border-width: 0;
    shape: roundrectangle;
    background-color: $green;
    color: white;
  }
  
  /** Terminal */
  :childless[out_degree < 1][in_degree > 0] {
    border-width: 0;
    shape: roundrectangle;
    background-color: $red;
    color: white;
  }
  
  /** Branching */
  :childless[in_degree > 0][in_degree < 2][out_degree > 1] {
    shape: diamond;
    background-color: $blue;
    color: white;
    height: 200;
    border-width: 0;
    text-margin-y: 2;
  }
  
  /** Merging **/
  :childless[in_degree > 1][out_degree > 0][out_degree < 2] {
  }
  
  :childless.color_red {
    background-color: $red;
    color: white;
  }
  :childless.color_orange {
    background-color: $orange;
    color: white;
  }
  :childless.color_yellow {
    background-color: $yellow;
  }
  :childless.color_green {
    background-color: $green;
    color: white;
  }
  :childless.color_blue {
    background-color: $blue;
    color: white;
  }
  :childless.color_purple {
    background-color: $purple;
    color: white;
  }
  :childless.color_grey {
    background-color: $grey;
  }
  
  :childless.shape_rectangle {
    shape: rectangle;
  }
  :childless.shape_roundrectangle {
    shape: roundrectangle;
  }
  :childless.shape_ellipse {
    shape: ellipse;
  }
  :childless.shape_triangle {
    shape: triangle;
  }
  :childless.shape_pentagon {
    shape: pentagon;
  }
  :childless.shape_hexagon {
    shape: hexagon;
  }
  :childless.shape_heptagon {
    shape: heptagon;
  }
  :childless.shape_octagon {
    shape: octagon;
  }
  :childless.shape_star {
    shape: star;
  }
  :childless.shape_barrel {
    shape: barrel;
  }
  :childless.shape_diamond {
    shape: diamond;
  }
  :childless.shape_vee {
    shape: vee;
  }
  :childless.shape_rhomboid {
    shape: rhomboid;
  }
  :childless.shape_right-rhomboid {
    shape: right-rhomboid;
  }
  :childless.shape_tag {
    shape: tag;
  }
  :childless.shape_round-rectangle {
    shape: round-rectangle;
  }
  :childless.shape_cut-rectangle {
    shape: cut-rectangle;
  }
  :childless.shape_bottom-round-rectangle {
    shape: bottom-round-rectangle;
  }
  :childless.shape_concave-hexagon {
    shape: concave-hexagon;
  }
  :childless.border_none {
    border-width: 0;
    border-style: solid;
  }
  :childless.border_solid {
    border-width: 2;
    border-style: solid;
  }
  :childless.border_dashed {
    border-width: 2;
    border-style: dashed;
  }
  :childless.border_dotted {
    border-width: 2;
    border-style: dotted;
  }
  
  :childless[w] {
    width: data(w);
  }
  
  :childless[h] {
    height: data(h);
  }
  
  edge.line_solid {
    line-style: solid;
  }
  edge.line_dotted {
    line-style: dotted;
  }
  edge.line_dashed {
    line-style: dashed;
  }
  edge.target-arrow_triangle {
    target-arrow-shape: triangle;
  }
  edge.target-arrow_triangle-tee {
    target-arrow-shape: triangle-tee;
  }
  edge.target-arrow_circle-triangle {
    target-arrow-shape: circle-triangle;
  }
  edge.target-arrow_triangle-cross {
    target-arrow-shape: triangle-cross;
  }
  edge.target-arrow_triangle-backcurve {
    target-arrow-shape: triangle-backcurve;
  }
  edge.target-arrow_vee {
    target-arrow-shape: vee;
  }
  edge.target-arrow_tee {
    target-arrow-shape: tee;
  }
  edge.target-arrow_square {
    target-arrow-shape: square;
  }
  edge.target-arrow_circle {
    target-arrow-shape: circle;
  }
  edge.target-arrow_diamond {
    target-arrow-shape: diamond;
  }
  edge.target-arrow_chevron {
    target-arrow-shape: chevron;
  }
  edge.target-arrow_none {
    target-arrow-shape: none;
  }
  edge.source-arrow_triangle {
    source-arrow-shape: triangle;
  }
  edge.source-arrow_triangle-tee {
    source-arrow-shape: triangle-tee;
  }
  edge.source-arrow_circle-triangle {
    source-arrow-shape: circle-triangle;
  }
  edge.source-arrow_triangle-cross {
    source-arrow-shape: triangle-cross;
  }
  edge.source-arrow_triangle-backcurve {
    source-arrow-shape: triangle-backcurve;
  }
  edge.source-arrow_vee {
    source-arrow-shape: vee;
  }
  edge.source-arrow_tee {
    source-arrow-shape: tee;
  }
  edge.source-arrow_square {
    source-arrow-shape: square;
  }
  edge.source-arrow_circle {
    source-arrow-shape: circle;
  }
  edge.source-arrow_diamond {
    source-arrow-shape: diamond;
  }
  edge.source-arrow_chevron {
    source-arrow-shape: chevron;
  }
  edge.source-arrow_none {
    source-arrow-shape: none;
  }
  
  :parent {
    padding: 10;
    border-style: solid;
    border-width: 2;
    border-color: $color;
    background-color: $background;
    text-valign: top;
    font-family: $fontFamily;
    label: data(label);
    color: $color;
    font-size: 19.5px;
    text-margin-y: -5;
  }
  
  :parent.color_white {
    background-color: white;
  }
  :parent.color_grey {
    background-color: $grey;
  }`,
};

// custom
// font weight 500
// node text color #31405b
// fixed height?
