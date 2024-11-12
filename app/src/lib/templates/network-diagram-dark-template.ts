import { FFTheme } from "../FFTheme";

export const content = `
Internet .cloud
  Firewall .hexagon
    Router .diamond
      Switch .rectangle
        Server .server
        Workstation .workstation
  VPN .pentagon
    RemoteUser .user
      (Workstation)
`;

export const theme: FFTheme = {
  layoutName: "cose",
  direction: "DOWN",
  spacingFactor: 1,

  background: "#2e404f",
  fontFamily: "Inter",

  shape: "rectangle",
  nodeBackground: "#1e293b",
  nodeForeground: "#ffffff",
  padding: 20,
  borderWidth: 3,
  borderColor: "#becce0",
  textMaxWidth: 130,
  lineHeight: 1.4,
  textMarginY: 0.75,
  useFixedHeight: false,

  curveStyle: "bezier",
  edgeWidth: 3,
  edgeColor: "#becce0",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 5,
  targetDistanceFromNode: 5,
  arrowScale: 1.5,
  fixedHeight: 100,
  edgeTextSize: 0.9,
  sourceArrowShape: "none",
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');

node {
  font-weight: 400;
  text-outline-width: 0;
  text-outline-color: transparent;
  shadow-blur: 0;
  shadow-offset-x: 0;
  shadow-offset-y: 0;
}

.cloud {
  shape: round-rectangle;
  background-color: #1e293b;
  border-width: 2px;
  border-color: #becce0;
  border-style: dashed;
  width: 140px;
  color: #becce0;
}

.hexagon {
  shape: rectangle;
  background-color: #b91c1c;
  border-color: #ef4444;
  width: 100px;
}

.diamond {
  shape: rectangle;
  background-color: #15803d;
  border-color: #4ade80;
  width: 100px;
}

.rectangle {
  shape: rectangle;
  background-color: #1d4ed8;
  border-color: #60a5fa;
  width: 100px;
}

.pentagon {
  shape: rectangle;
  background-color: #6d28d9;
  border-color: #a78bfa;
  width: 100px;
}

.server {
  shape: rectangle;
  background-color: #0369a1;
  border-color: #38bdf8;
  width: 100px;
}

.workstation {
  shape: rectangle;
  background-color: #0f766e;
  border-color: #2dd4bf;
  width: 100px;
}

.user {
  shape: rectangle;
  background-color: #c2410c;
  border-color: #fb923c;
  width: 100px;
}

node:selected {
  border-width: 2px;
  border-color: #e2e8f0;
  border-opacity: 0.8;
}

edge:selected {
  width: 2px;
  line-color: #e2e8f0;
  opacity: 0.8;
}
`;
