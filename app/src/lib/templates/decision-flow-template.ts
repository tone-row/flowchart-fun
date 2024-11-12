import { FFTheme } from "../FFTheme";

export const content = `
Start
  Should we launch the product? .decision
    Yes: Market ready
      Launch campaign .action
        Set budget .input
          Launch .terminal.color_blue
    No: Need improvements
      Improve product .action.color_green
        (Market ready)
`;

export const theme: FFTheme = {
  layoutName: "mrtree",
  direction: "DOWN",
  spacingFactor: 1.2,

  background: "#ffffff",
  fontFamily: "Roboto",
  nodeBackground: "#f8fafc",
  nodeForeground: "#1e293b",
  borderWidth: 2,
  edgeColor: "#64748b",
  padding: 16,
  borderColor: "#64748b",
  textMaxWidth: 150,
  lineHeight: 1.3,
  textMarginY: 1.75,
  useFixedHeight: false,
  shape: "rectangle",
  curveStyle: "bezier",
  edgeWidth: 2,
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 0,
  arrowScale: 1.75,
  edgeTextSize: 0.9,
  rotateEdgeLabel: false,
  fixedHeight: 100,
};

export const cytoscapeStyle = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');

.decision {
  shape: diamond;
  background-color: #f1f5f9;
  height: 150px;
}

.action {
  shape: rectangle;
  background-color: #bfdbfe;
  border-color: #3b82f6;
}

.input {
  shape: parallelogram;
  background-color: #ddd6fe;
  border-color: #7c3aed;
}

.terminal {
  shape: ellipse;
  background-color: #fecaca;
  border-color: #dc2626;
}

.color_blue {
  background-color: #bfdbfe;
  border-color: #3b82f6;
}

.color_green {
  background-color: #bbf7d0;
  border-color: #16a34a;
}

.color_red {
  background-color: #fecaca;
  border-color: #dc2626;
}

.color_orange {
  background-color: #fed7aa;
  border-color: #f97316;
}

@keyframes pulse {
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
}

.decision {
  animation: pulse 2s ease-in-out infinite;
}
`;
