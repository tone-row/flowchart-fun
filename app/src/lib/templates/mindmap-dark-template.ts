import { FFTheme } from "../FFTheme";

export const content = `
Universe .color_blue .shape_ellipse
  Stars .color_yellow
    Sun .shape_circle
  Planets .color_green
    Earth .shape_roundrectangle
      Moon .color_grey .shape_circle
    Mars .color_red .shape_circle
  Galaxies .color_purple
    Milky Way .shape_star
  Black Holes .color_black .shape_octagon
`;

export const theme: FFTheme = {
  layoutName: "cose",
  spacingFactor: 1,

  background: "#111827",
  fontFamily: "Space Grotesk",

  shape: "roundrectangle",
  nodeBackground: "#1f2937",
  nodeForeground: "#f3f4f6",
  padding: 15,
  borderWidth: 2,
  borderColor: "#4b5563",
  textMaxWidth: 100,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,

  curveStyle: "bezier",
  edgeWidth: 2,
  edgeColor: "#6b7280",
  sourceArrowShape: "none",
  targetArrowShape: "none",
  sourceDistanceFromNode: 5,
  targetDistanceFromNode: 5,
  edgeTextSize: 10,
  rotateEdgeLabel: false,
  direction: "DOWN",
  fixedHeight: 300,
  arrowScale: 1,
};

export const cytoscapeStyle = `
$bg-dark: #111827;
$bg-light: #1f2937;
$text-light: #f3f4f6;
$text-dark: #9ca3af;
$accent-blue: #3b82f6;
$accent-yellow: #fbbf24;
$accent-green: #10b981;
$accent-red: #ef4444;
$accent-purple: #8b5cf6;
$accent-grey: #6b7280;
$accent-black: #000000;

node {
  font-weight: 400;
  text-halign: center;
  text-valign: center;
  color: $text-light;
  background-color: $bg-light;
  border-color: $text-dark;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-outline-color: $bg-dark;
  text-outline-width: 1px;
  text-outline-opacity: 0.5;
}

edge {
  curve-style: bezier;
  line-color: $text-dark;
  width: 2px;
  opacity: 0.8;
}

:parent {
  background-color: rgba(29, 78, 216, 0.15);
  border-color: $accent-blue;
  border-width: 2px;
  border-style: dashed;
}

:childless {
  padding: 12px;
  font-size: 14px;
  text-wrap: wrap;
  text-max-width: 90px;
}

.color_blue { background-color: $accent-blue; }
.color_yellow { background-color: $accent-yellow; color: $bg-dark; }
.color_green { background-color: $accent-green; }
.color_red { background-color: $accent-red; }
.color_purple { background-color: $accent-purple; }
.color_grey { background-color: $accent-grey; }
.color_black { background-color: $accent-black; }

.shape_circle { shape: circle; }
.shape_ellipse { shape: ellipse; }
.shape_roundrectangle { shape: roundrectangle; }
.shape_star { shape: star; }
.shape_octagon { shape: octagon; }

#Universe {
  font-size: 18px;
  font-weight: bold;
  text-max-width: 120px;
  border-width: 3px;
  border-color: $accent-yellow;
}

:childless[depth = 1] {
  font-weight: 700;
}

:childless:selected,
:parent:selected {
  border-color: $accent-yellow;
  border-width: 3px;
  border-style: solid;
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.4);
}

edge:selected {
  width: 4px;
  line-color: $accent-yellow;
}
`;
