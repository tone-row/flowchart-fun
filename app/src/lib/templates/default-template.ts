import { FFTheme } from "../FFTheme";

export const content = `
Big Idea .color_purple
  Build a prototype
    Test it with real users
      Ready to launch?
        no: Learn & iterate
          (Build a prototype)
        yes: Ship it! .color_green
          Tell the world 🎉
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1.05,

  background: "#ffffff",
  fontFamily: "Satoshi",

  shape: "roundrectangle",
  nodeBackground: "#ffffff",
  nodeForeground: "#1a1f36",
  padding: 14,
  borderWidth: 1.5,
  borderColor: "#d9dee8",
  textMaxWidth: 160,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "round-taxi",
  edgeWidth: 2,
  edgeColor: "#a3adc2",
  sourceArrowShape: "none",
  targetArrowShape: "vee",
  sourceDistanceFromNode: 4,
  targetDistanceFromNode: 4,
  arrowScale: 0.9,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/Satoshi.css');

$ink: #1a1f36;
$accent: #606ef6;
$red: #e5484d;
$orange: #f76b15;
$yellow: #ffc53d;
$green: #30a46c;
$blue: #3e63dd;
$purple: #8e4ec6;
$grey: #f1f5f9;

node {
  font-family: Satoshi;
  font-size: 16px;
}

:childless {
  corner-radius: 10;
  font-weight: 500;
  underlay-color: #1e293b;
  underlay-opacity: 0.07;
  underlay-padding: 3;
  underlay-shape: round-rectangle;
}

edge {
  taxi-radius: 12;
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  text-background-padding: 4;
  color: #5b657a;
  font-weight: 500;
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
  line-color: $accent;
  target-arrow-color: $accent;
  opacity: 1;
  width: 3;
}

:childless.color_red {
  background-color: $red;
  border-color: #c93a3f;
  color: white;
}
:childless.color_orange {
  background-color: $orange;
  border-color: #d95b0e;
  color: white;
}
:childless.color_yellow {
  background-color: $yellow;
  border-color: #e0a92e;
  color: #453915;
}
:childless.color_green {
  background-color: $green;
  border-color: #26875a;
  color: white;
}
:childless.color_blue {
  background-color: $blue;
  border-color: #3353c4;
  color: white;
}
:childless.color_purple {
  background-color: $purple;
  border-color: #7a3fb0;
  color: white;
}
:childless.color_grey {
  background-color: $grey;
  border-color: #d5dbe3;
  color: #3c4657;
}

:parent.color_white {
  background-color: white;
}
:parent.color_grey {
  background-color: $grey;
}
`;
