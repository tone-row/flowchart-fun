import { FFTheme } from "../FFTheme";

export const content = `
Maya Torres, CEO #ceo
  Sam Patel, CTO .color_blue
    Engineering Manager .color_blue
      Frontend Engineer .color_blue
      Backend Engineer .color_blue
    Data Lead .color_blue
  Dana Kim, CFO .color_green
    Finance Manager .color_green
    People Ops .color_green
  Alex Rivera, CMO .color_orange
    Content Lead .color_orange
    Growth Marketer .color_orange
  Head of Sales, hiring .role_vacant
Board Advisor
  .line_dotted advises: (#ceo)
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1,

  background: "#ffffff",
  fontFamily: "Cabinet Grotesk",

  shape: "roundrectangle",
  nodeBackground: "#ffffff",
  nodeForeground: "#1d2129",
  padding: 16,
  borderWidth: 1.5,
  borderColor: "#d5d9e0",
  textMaxWidth: 150,
  lineHeight: 1.25,
  textMarginY: 0,
  useFixedHeight: true,
  fixedHeight: 64,

  curveStyle: "round-taxi",
  edgeWidth: 1.5,
  edgeColor: "#aeb6c2",
  sourceArrowShape: "none",
  targetArrowShape: "none",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 0,
  arrowScale: 1,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/CabinetGrotesk.css');

$ink: #1d2129;
$accent: #3e63dd;
$red: #faeceb;
$orange: #fbf0e4;
$yellow: #faf3dc;
$green: #e9f3ec;
$blue: #e8eff8;
$purple: #efeaf7;
$grey: #eef2f7;

node {
  font-family: Cabinet Grotesk;
  font-size: 16px;
}

:childless {
  corner-radius: 8;
  font-weight: 500;
  underlay-color: #1d2129;
  underlay-opacity: 0.05;
  underlay-padding: 2;
  underlay-shape: round-rectangle;
}

edge {
  taxi-radius: 8;
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  text-background-padding: 4;
  color: #6b7488;
  font-weight: 500;
}

/* The top of the org gets a little extra presence */
:childless[in_degree < 1][out_degree > 0] {
  font-weight: 700;
  border-width: 2;
  border-color: #9aa4b4;
}

:parent {
  corner-radius: 10;
  border-width: 1.5;
  border-color: #d5d9e0;
  background-color: #f7f9fc;
  background-opacity: 0.6;
  color: #6b7488;
  font-size: 14;
  padding: 16;
}

/* Open roles: dashed outline, muted */
:childless.role_vacant {
  border-style: dashed;
  border-color: #b8c0cc;
  background-opacity: 0;
  color: #8a93a3;
  font-weight: 500;
  underlay-opacity: 0;
}

/* Advisory / dotted-line reporting */
edge.line_dotted {
  line-style: dotted;
  line-color: #b8c0cc;
  width: 2;
}

:childless:selected {
  underlay-color: $accent;
  underlay-opacity: 0.25;
  underlay-padding: 5;
  opacity: 1;
  border-color: $accent;
}

edge:selected {
  line-color: $accent;
  target-arrow-color: $accent;
  opacity: 1;
  width: 2.5;
}

:childless.color_red {
  background-color: $red;
  border-color: #d49a96;
  border-width: 2;
  color: #8c3a34;
}
:childless.color_orange {
  background-color: $orange;
  border-color: #d9ab7a;
  border-width: 2;
  color: #8f5a1f;
}
:childless.color_yellow {
  background-color: $yellow;
  border-color: #d4bd7a;
  border-width: 2;
  color: #77621d;
}
:childless.color_green {
  background-color: $green;
  border-color: #8fbd9f;
  border-width: 2;
  color: #2e6b45;
}
:childless.color_blue {
  background-color: $blue;
  border-color: #8caed4;
  border-width: 2;
  color: #2c5482;
}
:childless.color_purple {
  background-color: $purple;
  border-color: #ab97d1;
  border-width: 2;
  color: #5b3e8e;
}
:childless.color_grey {
  background-color: $grey;
  border-color: #c3ccd8;
  border-width: 2;
  color: #46505e;
}

:parent.color_white {
  background-color: white;
}
:parent.color_grey {
  background-color: $grey;
}
`;
