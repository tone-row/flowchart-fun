import { FFTheme } from "../FFTheme";

export const content = `
Internet .cloud
  Firewall1 .hexagon
    Router .diamond
      Switch1 .rectangle
        Server1 .server
        Server2 .server
        Workstation1 .workstation
        Workstation2 .workstation
      Switch2 .rectangle
        Server3 .server
        Server4 .server
        Workstation3 .workstation
        Workstation4 .workstation
    VPN .pentagon
      RemoteUser1 .user
      RemoteUser2 .user
  ExternalService1 .cloud
  ExternalService2 .cloud
`;

export const theme: FFTheme = {
  layoutName: "cose",
  direction: "DOWN",
  spacingFactor: 1.2,

  background: "#1e2337",
  fontFamily: "Roboto Mono",

  shape: "rectangle",
  nodeBackground: "#3498db",
  nodeForeground: "#ffffff",
  padding: 12,
  borderWidth: 0,
  borderColor: "#16213e",
  textMaxWidth: 120,
  lineHeight: 1.2,
  textMarginY: 0,
  useFixedHeight: false,

  curveStyle: "bezier",
  edgeWidth: 2,
  edgeColor: "#4cc9f0",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 6,
  arrowScale: 0.8,
  edgeTextSize: 1,
  rotateEdgeLabel: false,
  fixedHeight: 100,
};

export const cytoscapeStyle = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');

node {
  font-weight: bold;
  font-size: 14px;
  text-halign: center;
  text-valign: center;
  color: #ffffff;
  background-color: #3498db;
  text-wrap: wrap;
  text-max-width: 100px;
  padding: 12px;
  width: 120px;
  height: 50px;
  text-outline-color: #000000;
  text-outline-width: 1px;
  text-outline-opacity: 0.5;
}

edge {
  line-color: #4cc9f0;
  opacity: 0.8;
}

.cloud {
  shape: round-rectangle;
  background-color: #000000;
  border-width: 2px;
  border-color: #b19cd9;
  border-style: dashed;
  width: 140px;
  height: 60px;
  color: #b19cd9;
  text-outline-color: #000000;
  text-outline-width: 2px;
  text-outline-opacity: 1;
}

.hexagon {
  shape: hexagon;
  background-color: #e74c3c;
  width: 80px;
  height: 70px;
}

.diamond {
  shape: diamond;
  background-color: #2ecc71;
  width: 80px;
  height: 80px;
}

.rectangle {
  shape: rectangle;
  background-color: #3498db;
  width: 100px;
  height: 50px;
}

.pentagon {
  shape: pentagon;
  background-color: #9b59b6;
  width: 80px;
  height: 75px;
  text-margin-y: 4px;
}

.server {
  shape: round-rectangle;
  background-color: #3498db;
  width: 100px;
  height: 50px;
}

.workstation {
  shape: round-rectangle;
  background-color: #3498db;
  width: 130px;
  height: 50px;
}

.user {
  shape: ellipse;
  background-color: #f39c12;
  width: 100px;
  height: 100px;
}

node:selected {
  border-width: 2px;
  border-color: #ffffff;
  border-opacity: 1;
}

edge:selected {
  width: 2px;
  line-color: #ffffff;
  opacity: 1;
}
`;
