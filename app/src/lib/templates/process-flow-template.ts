import { FFTheme } from "../FFTheme";

export const content = `
Decision Point .color_blue
  Yes: Review Documentation [href="https://docs.example.com"]
    Complete Process .color_green
  Yes: Conduct Analysis
    (Complete Process)
  No: Request More Information
    Provide Feedback .color_red
  No: Contact Client [href="mailto:client@example.com"]
    (Provide Feedback)
`;

export const theme: FFTheme = {
  layoutName: "layered",
  direction: "RIGHT",
  spacingFactor: 1.4,

  background: "#ffffff",
  fontFamily: "IBM Plex Sans",

  shape: "roundrectangle",
  nodeBackground: "#ffffff",
  nodeForeground: "#2d3748",
  padding: 18,
  borderWidth: 2,
  borderColor: "#475569",
  textMaxWidth: 120,
  lineHeight: 1.4,
  textMarginY: 1,
  useFixedHeight: true,
  fixedHeight: 50,

  curveStyle: "bezier",
  edgeWidth: 2,
  edgeColor: "#475569",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 5,
  arrowScale: 1,
  edgeTextSize: 0.9,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `
$red: #f43f5e;
$orange: #fb923c;
$yellow: #facc15;
$green: #4ade80;
$blue: #3b82f6;
$purple: #a78bfa;
$grey: #f1f5f9;
$border: #052e16;

:childless {
  font-weight: 500;
}

/** Start */
:childless[in_degree < 1][out_degree > 0] {
  background-color: $green;
  color: $border;
}

/** Links */
:childless[href] {
  background-color: $grey;
}

/** Colors **/
:childless.color_green {
  background-color: $green;
  color: $border;
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
  color: $border;
}

:childless.color_purple {
  background-color: $purple;
  color: white;
}

:childless.color_blue {
  background-color: $blue;
  color: white;
}

:childless.color_grey {
  background-color: $grey;
  color: $border;
}
`;
