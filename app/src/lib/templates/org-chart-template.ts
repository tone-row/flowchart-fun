import { FFTheme } from "../FFTheme";

export const content = `
Sarah Chen .size_lg.color_black
  Robert Wilson .color_blue
    David Brown
      Jennifer Lee
        Andrew Miller .color_green
        Carrie Richards .color_green
          Terry Peralta .color_green
  Lisa Anderson .color_purple
    Camille Mitchell .color_purple
      Christopher White .color_purple
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1.15,
  lineHeight: 1.4,
  shape: "roundrectangle",
  background: "#ffffff",
  textMaxWidth: 142,
  padding: 16,
  fontFamily: "IBM Plex Sans",
  curveStyle: "round-taxi",
  textMarginY: 1,
  borderWidth: 2,
  edgeTextSize: 1,
  edgeWidth: 2,
  useFixedHeight: false,
  fixedHeight: 60,
  sourceArrowShape: "none",
  targetArrowShape: "none",
  edgeColor: "#94a3b8",
  borderColor: "#cbd5e1",
  nodeBackground: "#ffffff",
  nodeForeground: "#1e293b",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 0,
  arrowScale: 1,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `
edge {
  taxi-radius: 40px;
}

$red: #fecaca;
$orange: #fed7aa; 
$yellow: #fef08a;
$green: #bbf7d0;
$blue: #bfdbfe;
$purple: #ddd6fe;
$grey: #f1f5f9;

:childless {
  font-weight: 400;
  text-outline-width: 0;
  text-outline-color: transparent;
  shadow-blur: 4;
  shadow-color: #0000000d;
  shadow-offset-x: 0;
  shadow-offset-y: 2;
}

:childless.color_red {
  background-color: $red;
  border-color: #dc2626;
}
:childless.color_yellow {
  background-color: $yellow;
  border-color: #ca8a04;
}
:childless.color_green {
  background-color: $green;
  border-color: #16a34a;
}
:childless.color_blue {
  background-color: $blue;
  border-color: #2563eb;
}
:childless.color_purple {
  background-color: $purple;
  border-color: #7c3aed;
}
:childless.color_black {
  background-color: black;
  border-color: black;
  color: white;
}

:childless.size_lg {
  font-size: 24;
  padding: 18;
  width: 250;
  text-max-width: 218;
  text-margin-y: 2;
}`;
