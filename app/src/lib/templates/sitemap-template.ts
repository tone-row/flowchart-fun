import { FFTheme } from "../FFTheme";

export const content = `
Home
  Product .color_blue
    Features .color_blue
    Integrations .color_blue
  Pricing #pricing.color_green
  Resources .color_orange
    Blog .color_orange
    Docs .color_orange
      .link_dashed: (#pricing)
    Changelog .color_orange
  Company .color_purple
    About .color_purple
    Careers .color_purple
`;

export const theme: FFTheme = {
  layoutName: "mrtree",
  direction: "DOWN",
  spacingFactor: 1.1,

  background: "#ffffff",
  fontFamily: "Switzer",

  shape: "roundrectangle",
  nodeBackground: "#ffffff",
  nodeForeground: "#1f2430",
  padding: 12,
  borderWidth: 1.5,
  borderColor: "#dbe0ea",
  textMaxWidth: 140,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "taxi",
  edgeWidth: 1.5,
  edgeColor: "#c3cad8",
  sourceArrowShape: "none",
  targetArrowShape: "none",
  sourceDistanceFromNode: 2,
  targetDistanceFromNode: 2,
  arrowScale: 0.8,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/Switzer.css');

$ink: #1f2430;
$accent: #3e63dd;
$red: #e5484d;
$orange: #f76b15;
$yellow: #e0a92e;
$green: #30a46c;
$blue: #3e63dd;
$purple: #8e4ec6;
$grey: #8b94a6;

:childless {
  corner-radius: 6;
  font-weight: 500;
  underlay-color: #1e293b;
  underlay-opacity: 0.05;
  underlay-padding: 2;
  underlay-shape: round-rectangle;
}

/* Home: the tree root gets the filled dark card */
:childless[in_degree < 1] {
  background-color: $ink;
  border-color: $ink;
  color: white;
  corner-radius: 10;
  font-weight: 600;
}

edge {
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  text-background-padding: 4;
  color: #5b657a;
  font-weight: 500;
}

/* Cross-links between sections: dashed with a small arrow */
edge.link_dashed {
  line-style: dashed;
  line-color: #9aa5ba;
  target-arrow-shape: vee;
  target-arrow-color: #9aa5ba;
  arrow-scale: 0.8;
}

:parent {
  corner-radius: 12;
  border-width: 1.5;
  border-color: #dbe0ea;
  background-opacity: 0.6;
  color: #5b657a;
  font-size: 15;
  padding: 16;
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

/* Section tints: 10% background + full-strength border */
:childless.color_red {
  background-color: #fdecec;
  border-color: $red;
  color: #a63038;
}
:childless.color_orange {
  background-color: #feefe4;
  border-color: $orange;
  color: #b34a08;
}
:childless.color_yellow {
  background-color: #fdf6e0;
  border-color: $yellow;
  color: #8f6b13;
}
:childless.color_green {
  background-color: #e9f6f0;
  border-color: $green;
  color: #1e7a4d;
}
:childless.color_blue {
  background-color: #eaeffc;
  border-color: $blue;
  color: #2f4bb0;
}
:childless.color_purple {
  background-color: #f4ecfa;
  border-color: $purple;
  color: #6f3aa0;
}
:childless.color_grey {
  background-color: #f1f4f8;
  border-color: $grey;
  color: #3c4657;
}

:parent.color_white {
  background-color: white;
}
:parent.color_grey {
  background-color: #f1f4f8;
}
`;
