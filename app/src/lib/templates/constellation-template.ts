import { FFTheme } from "../FFTheme";

export const content = `
Copernicus #copernicus.color_yellow
  heliocentrism: Galileo #galileo.color_blue
    telescope evidence: Newton #newton.color_yellow
      Principia: Laplace #laplace.color_blue
      optics: Maxwell #maxwell.color_red
      gravitation: Halley #halley
  elliptical orbits: Kepler #kepler.color_green
    planetary laws: (#newton)
Tycho Brahe #brahe
  star charts: (#kepler)
Descartes #descartes.color_purple
  analytic geometry: (#newton)
Leibniz #leibniz.color_purple
  calculus dispute: (#newton)
Euler #euler.color_green
  celestial mechanics: (#laplace)
Faraday #faraday.color_orange
  field theory: (#maxwell)
`;

export const theme: FFTheme = {
  layoutName: "cose",
  direction: "DOWN",
  spacingFactor: 1.5,

  background: "#0a0e1f",
  fontFamily: "Satoshi",

  shape: "ellipse",
  nodeBackground: "#e8c26a",
  nodeForeground: "#f5edda",
  padding: 10,
  borderWidth: 0,
  borderColor: "#e8c26a",
  textMaxWidth: 120,
  lineHeight: 1.25,
  textMarginY: 8,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "bezier",
  edgeWidth: 1,
  edgeColor: "#2c3654",
  sourceArrowShape: "none",
  targetArrowShape: "none",
  sourceDistanceFromNode: 2,
  targetDistanceFromNode: 2,
  arrowScale: 1,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/Satoshi.css');

$bg: #0a0e1f;
$gold: #e8c26a;
$goldLight: #ffe9b3;
$goldDark: #3a3320;
$warmWhite: #f5edda;
$line: #2c3654;
$red: #d98a8a;
$orange: #e0975c;
$yellow: #f0d080;
$green: #8fae8b;
$blue: #9db8e8;
$purple: #af97d8;
$grey: #a8b0c4;

node {
  font-family: Satoshi;
  font-size: 16px;
}

/* Stars: small glowing points, serif labels beneath */
:childless {
  width: 26;
  height: 26;
  background-fill: radial-gradient;
  background-gradient-stop-colors: $goldLight $gold $goldDark;
  background-gradient-stop-positions: 0 45 100;
  border-width: 0;
  text-valign: bottom;
  text-halign: center;
  text-margin-y: 8;
  color: $warmWhite;
  font-weight: 400;
  text-outline-color: $bg;
  text-outline-width: 2;
  text-outline-opacity: 0.85;
  underlay-color: $gold;
  underlay-opacity: 0.14;
  underlay-padding: 8;
  underlay-shape: ellipse;
}

/* Hubs: heavily-connected stars shine bigger and brighter */
:childless[in_degree > 2] {
  width: 34;
  height: 34;
  font-size: 18;
  underlay-opacity: 0.22;
  underlay-padding: 10;
}
:childless[out_degree > 2] {
  width: 34;
  height: 34;
  font-size: 18;
  underlay-opacity: 0.22;
  underlay-padding: 10;
}

/* Constellation lines */
edge {
  curve-style: straight;
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  color: #8a93ad;
  font-weight: 400;
  text-background-color: $bg;
  text-background-opacity: 1;
  text-background-padding: 4;
}

:parent {
  background-color: #111a38;
  background-opacity: 0.4;
  border-width: 1;
  border-style: dashed;
  border-color: $line;
  corner-radius: 24;
  color: #8a93ad;
  font-size: 14;
  padding: 20;
}

:childless:selected {
  underlay-color: $gold;
  underlay-opacity: 0.35;
  underlay-padding: 10;
  opacity: 1;
}

edge:selected {
  line-color: $gold;
  target-arrow-color: $gold;
  opacity: 1;
  width: 2;
}

/* Star hues: each class retints the radial gradient */
:childless.color_red {
  background-gradient-stop-colors: #f0c4c4 $red #4a2424;
  underlay-color: $red;
}
:childless.color_orange {
  background-gradient-stop-colors: #ffd9ae $orange #4a3117;
  underlay-color: $orange;
}
:childless.color_yellow {
  background-gradient-stop-colors: #fff3cf $yellow #4a3f1d;
  underlay-color: $yellow;
}
:childless.color_green {
  background-gradient-stop-colors: #cfe3cc $green #263a24;
  underlay-color: $green;
}
:childless.color_blue {
  background-gradient-stop-colors: #d3e1f7 $blue #22304f;
  underlay-color: $blue;
}
:childless.color_purple {
  background-gradient-stop-colors: #ddd0f0 $purple #322648;
  underlay-color: $purple;
}
:childless.color_grey {
  background-gradient-stop-colors: #e8ecf4 $grey #2e3442;
  underlay-color: $grey;
}

:parent.color_white {
  background-color: $warmWhite;
  background-opacity: 0.08;
}
:parent.color_grey {
  background-color: #1a2340;
  background-opacity: 0.6;
}
`;
