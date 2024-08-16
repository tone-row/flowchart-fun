import { FFTheme } from "../FFTheme";

export const content = `
Internet [icon=file/cloud]
  Firewall [icon=hardware/security]
    Router [icon=hardware/router]
      Switch1 [icon=hardware/device_hub]
        Server1 [icon=file/folder]
        Server2 [icon=file/folder]
        PC1 [icon=hardware/computer]
        PC2 [icon=hardware/computer]
      Switch2 [icon=hardware/device_hub]
        Server3 [icon=file/folder]
        Server4 [icon=file/folder]
        Mobile1 [icon=hardware/smartphone]
        Mobile2 [icon=hardware/smartphone]
    VPN [icon=communication/vpn_key]
      RemoteUser1 [icon=social/person]
      RemoteUser2 [icon=social/person]
      ExternalService1 [icon=file/cloud]
      ExternalService2 [icon=file/cloud]
`;

export const cytoscapeStyle = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600');

node {
  font-weight: 600;
  font-size: 13px;
  text-halign: center;
  text-valign: bottom;
  background-color: #f0f4ff;
  text-wrap: none;
  background-width: 54px;
  background-height: 54px;
  width: 70px;
  color: #1e3a8a;
}

edge {
  opacity: 0.8;
}

node:selected {
  background-color: rgba(79, 70, 229, 0.2);
  border-color: #4f46e5;
  border-width: 3px;
  border-opacity: 1;
}

edge:selected {
  width: 3px;
  line-color: #4f46e5;
  opacity: 1;
}
`;

export const theme: FFTheme = {
  layoutName: "stress",
  direction: "DOWN",
  spacingFactor: 1.75,

  background: "#e0e7ff",
  fontFamily: "Poppins",

  shape: "roundrectangle",
  nodeBackground: "#f0f4ff",
  nodeForeground: "#1e3a8a",
  padding: 8,
  borderWidth: 0,
  borderColor: "#4b5563",
  textMaxWidth: 200,
  lineHeight: 1.4,
  textMarginY: 6,
  useFixedHeight: true,

  curveStyle: "bezier",
  edgeWidth: 2,
  edgeColor: "#4b5563",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 18,
  targetDistanceFromNode: 15,
  arrowScale: 0.8,
  edgeTextSize: 11,
  rotateEdgeLabel: false,
  fixedHeight: 70,
};
