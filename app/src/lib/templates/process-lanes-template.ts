import { FFTheme } from "../FFTheme";

export const content = `
Sales .color_red {
  Qualify lead #qualify
    Send proposal #proposal
}
Legal .color_blue {
  Review contract #review
    Request changes #changes
    Approve terms #approve
}
IT .color_green {
  Provision accounts #provision
    Kickoff call #kickoff
}
(#proposal)
  review: (#review)
(#changes)
  revise: (#proposal)
(#approve)
  signed: (#provision)
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "RIGHT",
  spacingFactor: 1.1,

  background: "#ffffff",
  fontFamily: "Public Sans",

  shape: "roundrectangle",
  nodeBackground: "#ffffff",
  nodeForeground: "#24292e",
  padding: 14,
  borderWidth: 1.5,
  borderColor: "#d7dde5",
  textMaxWidth: 150,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "round-taxi",
  edgeWidth: 2,
  edgeColor: "#9aa7b8",
  sourceArrowShape: "none",
  targetArrowShape: "vee",
  sourceDistanceFromNode: 4,
  targetDistanceFromNode: 4,
  arrowScale: 0.9,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/PublicSans.css');

$ink: #24292e;
$accent: #4d7fb2;
$lane: #eef1f5;
$laneBorder: #c6cfda;
$red: #c65a54;
$orange: #dd8543;
$yellow: #eec254;
$green: #4f9d7c;
$blue: #4d7fb2;
$purple: #82689f;
$grey: #eef1f5;

node {
  font-family: Public Sans;
  font-size: 16px;
}

:childless {
  corner-radius: 8;
  font-weight: 500;
  underlay-color: #1f2933;
  underlay-opacity: 0.06;
  underlay-padding: 3;
  underlay-shape: round-rectangle;
}

edge {
  taxi-radius: 12;
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  text-background-padding: 4;
  color: #5f6b7a;
  font-weight: 600;
}

/* Lanes: tinted rounded bands with dashed borders */
:parent {
  corner-radius: 18;
  border-width: 1.5;
  border-style: dashed;
  border-color: $laneBorder;
  background-color: $lane;
  background-opacity: 1;
  color: #4c5560;
  font-size: 15;
  font-weight: 600;
  padding: 18;
}

:childless:selected {
  underlay-color: $accent;
  underlay-opacity: 0.25;
  underlay-padding: 6;
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
  background-color: $red;
  border-color: #a8453f;
  color: white;
}
:childless.color_orange {
  background-color: $orange;
  border-color: #bd6a2f;
  color: white;
}
:childless.color_yellow {
  background-color: $yellow;
  border-color: #cc9c35;
  color: #423311;
}
:childless.color_green {
  background-color: $green;
  border-color: #3d8265;
  color: white;
}
:childless.color_blue {
  background-color: $blue;
  border-color: #3a6694;
  color: white;
}
:childless.color_purple {
  background-color: $purple;
  border-color: #6a5384;
  color: white;
}
:childless.color_grey {
  background-color: $grey;
  border-color: #cfd7e0;
  color: #3b4552;
}

/* Lane tints (Wada 260, ~12% saturation) */
:parent.color_red {
  background-color: #f7e6e4;
  border-color: #ddb8b3;
  color: #7c5049;
}
:parent.color_orange {
  background-color: #f9efe6;
  border-color: #e0c8a9;
  color: #7d6142;
}
:parent.color_yellow {
  background-color: #f8f3e0;
  border-color: #ddd0a3;
  color: #746a3d;
}
:parent.color_green {
  background-color: #dff2ee;
  border-color: #a9d2c6;
  color: #3f6f61;
}
:parent.color_blue {
  background-color: #e6edf4;
  border-color: #b7c8da;
  color: #47607a;
}
:parent.color_purple {
  background-color: #efe9f2;
  border-color: #ccbcd6;
  color: #64536f;
}
:parent.color_white {
  background-color: white;
}
:parent.color_grey {
  background-color: $grey;
}
`;
