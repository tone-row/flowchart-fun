import { FFTheme } from "../FFTheme";

export const content = `
Project Start .color_blue
  Design: 2 days
    Prototype: 5 days
      Launch .color_green
    Development: 8 days
      Documentation: 4 days
        Launch .color_green
      .color_orange Testing: 3 days
        .color_green Launch: 5 days
  Research: 3 days
    Development
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "RIGHT",
  spacingFactor: 1.5,

  background: "#f0f4f8",
  fontFamily: "Inter",

  shape: "ellipse",
  nodeBackground: "#ffffff",
  nodeForeground: "#2b6cb0",
  padding: 15,
  borderWidth: 2,
  borderColor: "#4299e1",
  textMaxWidth: 80,
  lineHeight: 1.2,
  textMarginY: 0,
  useFixedHeight: true,
  fixedHeight: 80,

  curveStyle: "bezier",
  edgeWidth: 2,
  edgeColor: "#4299e1",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 5,
  targetDistanceFromNode: 5,
  arrowScale: 1,
  edgeTextSize: 10,
  rotateEdgeLabel: true,
};

export const cytoscapeStyle = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

node {
  font-weight: 600;
  text-halign: center;
  text-valign: center;
  color: #2b6cb0;
  background-color: #ffffff;
  border-color: #4299e1;
  border-width: 2px;
  width: 80px;
  height: 80px;
  font-size: 14px;
  text-wrap: wrap;
  text-max-width: 70px;
}

edge {
  curve-style: bezier;
  target-arrow-shape: triangle;
  target-arrow-color: #4299e1;
  line-color: #4299e1;
  width: 2px;
  font-size: 10px;
  text-rotation: autorotate;
  text-margin-y: -10px;
  text-background-color: #f0f4f8;
  text-background-opacity: 1;
  text-background-padding: 3px;
  text-border-opacity: 0;
}

.color_blue {
  background-color: #3182ce;
  color: #ffffff;
}

.color_green {
  background-color: #48bb78;
  color: #ffffff;
}

.color_orange {
  background-color: #ed8936;
  color: #ffffff;
}

edge.color_blue {
  color: #3182ce;
  target-arrow-color: #3182ce;
  line-color: #3182ce;
}

edge.color_green {
  color: #48bb78;
  target-arrow-color: #48bb78;
  line-color: #48bb78;
}

edge.color_orange {
  color: #ed8936;
  target-arrow-color: #ed8936;
  line-color: #ed8936;
}
`;
