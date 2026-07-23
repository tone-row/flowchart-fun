import { FFTheme } from "../FFTheme";

export const content = `
Project kickoff #kickoff.color_blue
  2026 Q1: Alpha release
    2026 Q2: Private beta
      Feature freeze .color_orange
        2026 Q3: Public beta
          2026 Q4: GA launch #ga.color_green
            2027 Q1: Post-launch review .color_grey
  2026 Q1: Brand refresh .color_purple
    2026 Q2: Landing page live
      2026 Q3: Launch campaign
        2026 Q4: (#ga)
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "RIGHT",
  spacingFactor: 1.3,

  background: "#ffffff",
  fontFamily: "Satoshi",

  shape: "roundrectangle",
  nodeBackground: "#ffffff",
  nodeForeground: "#191d24",
  padding: 14,
  borderWidth: 1.5,
  borderColor: "#d9dee8",
  textMaxWidth: 150,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "round-taxi",
  edgeWidth: 4,
  edgeColor: "#3e63dd",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 2,
  arrowScale: 0.8,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/Satoshi.css');

$ink: #191d24;
$accent: #3e63dd;
$pill: #eef1fd;
$red: #fdecec;
$orange: #fdf0e3;
$yellow: #fdf6dd;
$green: #e5f5ec;
$blue: #e8edfc;
$purple: #f1eafb;
$grey: #f1f4f8;

node {
  font-family: Satoshi;
  font-size: 16px;
}

:childless {
  corner-radius: 10;
  font-weight: 500;
  underlay-color: #1e293b;
  underlay-opacity: 0.06;
  underlay-padding: 3;
  underlay-shape: round-rectangle;
}

/* The spine: thick accent edges with date pills as labels */
edge {
  taxi-radius: 16;
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  text-background-color: $pill;
  text-background-opacity: 1;
  text-background-shape: round-rectangle;
  text-background-padding: 5;
  color: $accent;
  font-weight: 700;
}

/* The first milestone anchors the timeline */
:childless[in_degree < 1] {
  border-width: 2;
  font-weight: 700;
}

:parent {
  corner-radius: 14;
  border-width: 1.5;
  border-color: #d9dee8;
  background-color: #f8fafc;
  background-opacity: 0.6;
  color: #5b657a;
  font-size: 15;
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
  line-color: $ink;
  target-arrow-color: $ink;
  opacity: 1;
  width: 5;
}

/* Phase tints: soft fill, full-strength border, deep text */
:childless.color_red {
  background-color: $red;
  border-color: #d64545;
  color: #8c2626;
}
:childless.color_orange {
  background-color: $orange;
  border-color: #e07b2e;
  color: #8f4a12;
}
:childless.color_yellow {
  background-color: $yellow;
  border-color: #d9ae38;
  color: #7a5e10;
}
:childless.color_green {
  background-color: $green;
  border-color: #34a266;
  color: #1c6b42;
}
:childless.color_blue {
  background-color: $blue;
  border-color: #3e63dd;
  color: #2947a9;
}
:childless.color_purple {
  background-color: $purple;
  border-color: #8b5cd6;
  color: #5c34a3;
}
:childless.color_grey {
  background-color: $grey;
  border-color: #c6cdd8;
  color: #4a5468;
}

:parent.color_white {
  background-color: white;
}
:parent.color_grey {
  background-color: $grey;
}
`;
