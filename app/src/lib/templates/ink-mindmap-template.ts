import { FFTheme } from "../FFTheme";

export const content = `
Plan the team offsite
  Location .color_orange
    Mountain lodge
    Beach house
  Agenda .color_blue
    Workshops
    Team retro
    2027 roadmap
  Food .color_green
    Local caterer
    Group cooking night
  Fun .color_purple
    Big hike
    Trivia night
  Budget .color_yellow
    Travel costs
    Lodging
`;

export const theme: FFTheme = {
  layoutName: "cose",
  direction: "DOWN",
  spacingFactor: 1.2,

  background: "#faf7f0",
  fontFamily: "Open Runde",

  shape: "roundrectangle",
  nodeBackground: "#fffdf8",
  nodeForeground: "#4b3317",
  padding: 12,
  borderWidth: 2,
  borderColor: "#bb7125",
  textMaxWidth: 140,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "bezier",
  edgeWidth: 2.5,
  edgeColor: "#c9a06a",
  sourceArrowShape: "none",
  targetArrowShape: "none",
  sourceDistanceFromNode: 6,
  targetDistanceFromNode: 6,
  arrowScale: 1,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/OpenRunde.css');

$ink: #4b3317;
$paper: #fffdf8;
$accent: #bb7125;
$red: #c55347;
$orange: #d98137;
$yellow: #e5b83c;
$green: #648f7b;
$blue: #46658c;
$purple: #7d5a78;
$grey: #efe9dd;

node {
  font-family: Open Runde;
  font-size: 16px;
}

:childless {
  corner-radius: 999;
  font-weight: 500;
}

/* The root idea: filled sienna, bigger, round */
:childless[in_degree < 1] {
  shape: ellipse;
  background-color: $accent;
  border-color: #9c5c1c;
  color: $paper;
  font-size: 20;
  font-weight: 600;
  padding: 20;
}

edge {
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  text-background-padding: 4;
  color: #8a6f4d;
  font-weight: 500;
}

:parent {
  corner-radius: 20;
  border-width: 2;
  border-color: #e2d7c2;
  background-color: $paper;
  background-opacity: 0.6;
  color: #8a6f4d;
  font-size: 15;
  padding: 18;
}

:childless:selected {
  underlay-color: $accent;
  underlay-opacity: 0.25;
  underlay-padding: 6;
  underlay-shape: round-rectangle;
  opacity: 1;
  border-color: $accent;
}

edge:selected {
  line-color: $accent;
  target-arrow-color: $accent;
  opacity: 1;
  width: 3;
}

:childless.color_red {
  background-color: #f7e5e1;
  border-color: $red;
  color: $ink;
}
:childless.color_orange {
  background-color: #f9ecdc;
  border-color: $orange;
  color: $ink;
}
:childless.color_yellow {
  background-color: #faf1d6;
  border-color: $yellow;
  color: $ink;
}
:childless.color_green {
  background-color: #e7efe9;
  border-color: $green;
  color: $ink;
}
:childless.color_blue {
  background-color: #e4e9f0;
  border-color: $blue;
  color: $ink;
}
:childless.color_purple {
  background-color: #efe6ee;
  border-color: $purple;
  color: $ink;
}
:childless.color_grey {
  background-color: $grey;
  border-color: #cfc4ab;
  color: $ink;
}

:parent.color_white {
  background-color: white;
}
:parent.color_grey {
  background-color: $grey;
}
`;
