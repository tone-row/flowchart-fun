import { FFTheme } from "../FFTheme";

export const content = `
Customer requests a refund #start
  Purchased within 30 days?
    Yes: Item unused & in original packaging?
      Yes: Issue full refund #refund.color_green
      No: Offer store credit .color_yellow
    No: Was the item defective?
      Yes: (#refund)
      No: Politely decline .color_red
        Share return policy link
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1.15,

  background: "#ffffff",
  fontFamily: "General Sans",

  shape: "roundrectangle",
  nodeBackground: "#ffffff",
  nodeForeground: "#2b2416",
  padding: 14,
  borderWidth: 1.5,
  borderColor: "#e3ddd0",
  textMaxWidth: 190,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 50,

  curveStyle: "round-taxi",
  edgeWidth: 2,
  edgeColor: "#b9b2a4",
  sourceArrowShape: "none",
  targetArrowShape: "vee",
  sourceDistanceFromNode: 4,
  targetDistanceFromNode: 4,
  arrowScale: 0.9,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('/fonts/GeneralSans.css');

$ink: #2b2416;
$decision: #fdf0dd;
$decisionBorder: #e0a45c;
$yes: #648f7b;
$no: #c55347;
$red: #c55347;
$orange: #d97f3e;
$yellow: #eabc5c;
$green: #648f7b;
$blue: #5c7599;
$purple: #8c6a88;
$grey: #f4f1ea;

:childless {
  corner-radius: 8;
  font-weight: 500;
  underlay-color: #3d3425;
  underlay-opacity: 0.06;
  underlay-padding: 3;
  underlay-shape: round-rectangle;
}

edge {
  taxi-radius: 10;
  source-endpoint: outside-to-node;
  target-endpoint: outside-to-node;
  text-background-padding: 4;
  color: #7a7263;
  font-weight: 600;
}

/* Questions: any node that branches is a decision */
:childless[out_degree > 1][in_degree > 0] {
  background-color: $decision;
  border-color: $decisionBorder;
  border-width: 2;
  font-weight: 600;
}

/* Outcomes: leaf nodes become pills */
:childless[out_degree < 1][in_degree > 0] {
  corner-radius: 999;
  background-color: $grey;
  border-color: #ddd6c8;
}

/* Yes / No branches color themselves */
edge[label = 'Yes'], edge[label = 'yes'] {
  line-color: $yes;
  target-arrow-color: $yes;
  color: $yes;
}
edge[label = 'No'], edge[label = 'no'] {
  line-color: $no;
  target-arrow-color: $no;
  color: $no;
}

:childless:selected {
  underlay-color: $decisionBorder;
  underlay-opacity: 0.3;
  underlay-padding: 6;
  opacity: 1;
  border-color: $decisionBorder;
}

edge:selected {
  line-color: $decisionBorder;
  target-arrow-color: $decisionBorder;
  opacity: 1;
  width: 3;
}

:childless.color_red {
  background-color: $red;
  border-color: #a8433a;
  color: white;
}
:childless.color_orange {
  background-color: $orange;
  border-color: #b96830;
  color: white;
}
:childless.color_yellow {
  background-color: $yellow;
  border-color: #c89a3f;
  color: #3d3110;
}
:childless.color_green {
  background-color: $green;
  border-color: #517867;
  color: white;
}
:childless.color_blue {
  background-color: $blue;
  border-color: #4a5f7e;
  color: white;
}
:childless.color_purple {
  background-color: $purple;
  border-color: #715570;
  color: white;
}
:childless.color_grey {
  background-color: $grey;
  border-color: #ddd6c8;
  color: #4a4436;
}

:parent.color_white {
  background-color: white;
}
:parent.color_grey {
  background-color: $grey;
}
`;
