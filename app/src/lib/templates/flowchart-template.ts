import { FFTheme } from "../FFTheme";

export const content = `
Brainstorming Session
  Prototyping
    Prototype Evaluation
      Yes: Design .color_blue
        Testing
      No: Review .color_yellow
        Quick Design .color_yellow
          (Prototyping)
Trends
  (Prototyping)
Research
  (Prototyping)
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1,

  background: "#ffffff",
  fontFamily: "Inclusive Sans",

  shape: "roundrectangle",
  nodeBackground: "#ffffff",
  nodeForeground: "#2a2a2a",
  padding: 12,
  borderWidth: 2,
  borderColor: "#565656",
  textMaxWidth: 110,
  lineHeight: 1.4,
  textMarginY: 0.5,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "bezier",
  edgeWidth: 2,
  edgeColor: "#666666",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 4,
  arrowScale: 1.2,
  edgeTextSize: 1,
  rotateEdgeLabel: true,
};

export const cytoscapeStyle = `
$color: #2a2a2a;
$red: #ffebee;
$orange: #fff3e0;
$yellow: #fff8e1;
$green: #e8f5e9;
$blue: #e3f2fd;
$pink: #fce4ec;
$grey: #f5f5f5;

:childless {
  text-outline-width: 0;
  text-outline-color: transparent;
  shadow-blur: 5;
  shadow-color: #00000010;
  shadow-offset-x: 0;
  shadow-offset-y: 2;
}

/** Start */
:childless[in_degree < 1][out_degree > 0] {
  shape: roundrectangle;
  background-color: $green;
}

/** Terminal */
:childless[out_degree < 1][in_degree > 0] {
  shape: roundrectangle;
  background-color: $red;
}

/** Branching - Updated for better readability */
:childless[in_degree > 0][in_degree < 2][out_degree > 1] {
  shape: diamond;
  background-color: white;
  color: $color;
  height: $width;
  text-margin-y: 2;
}

:childless.color_red {
  background-color: $red;
  color: $color;
}
:childless.color_orange {
  background-color: $orange;
  color: $color;
}
:childless.color_yellow {
  background-color: $yellow;
  color: $color;
}
:childless.color_green {
  background-color: $green;
  color: $color;
}
:childless.color_blue {
  background-color: $blue;
  color: $color;
}
:childless.color_pink {
  background-color: $pink;
  color: $color;
}
:childless.color_grey {
  background-color: $grey;
  color: $color;
}
:childless.color_white {
  background-color: white;
}
:childless.color_black {
  background-color: black;
  color: white;
}

:parent.color_white {
  background-color: white;
}
:parent.color_grey {
  background-color: $grey;
}
`;
