import { FFTheme } from "../FFTheme";

export const content = `
Should we launch the product? .decision
  Yes: High demand
    Prepare marketing campaign .action
      Set budget .input
      Create ads .input
    Scale production .action
      Hire staff .input
      Increase inventory .input
  No: More research needed
    Conduct market analysis .action.color_blue
      Positive results: Proceed
        (Should we launch the product?)
      Negative results: Abandon
        End project .terminal.color_red
    Improve product .action.color_green
      Minor changes
        (Should we launch the product?)
      Major overhaul
        Seek additional funding .action.color_orange
          Approved: Continue
            (Should we launch the product?)
          Denied: Abandon
            (End project)
`;

export const theme: FFTheme = {
  layoutName: "layered",
  direction: "DOWN",
  spacingFactor: 1.25,

  background: "#f2e9e4",
  fontFamily: "Roboto",
  nodeBackground: "#4a4e69",
  nodeForeground: "#ffffff",
  borderWidth: 0,
  edgeColor: "#22223b",
  padding: 16,
  borderColor: "#ced4da",
  textMaxWidth: 150,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,
  shape: "rectangle",
  curveStyle: "round-taxi",
  edgeWidth: 2,
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 10,
  arrowScale: 1.2,
  edgeTextSize: 12,
  rotateEdgeLabel: false,
  fixedHeight: 100,
};

export const cytoscapeStyle = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');

node {
  font-weight: 500;
  text-halign: center;
  text-valign: center;
  color: #ffffff;
  background-color: #4a4e69;
  border-width: 0;
  font-size: 14px;
  text-wrap: wrap;
  text-max-width: 130px;
  padding: 12px;
  width: 160px;
  height: 80px;
  text-outline-color: #22223b;
  text-outline-width: 1px;
  text-outline-opacity: 0.5;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

edge {
  taxi-direction: downward;
  target-arrow-shape: triangle;
  target-arrow-color: #22223b;
  line-color: #22223b;
  width: 2px;
  font-size: 12px;
  font-weight: 500;
  color: #22223b;
  text-background-color: #f2e9e4;
  text-background-opacity: 1;
  text-background-padding: 3px;
  curve-style: unbundled-bezier;
  control-point-distances: 0 -20 -20 20 0;
  control-point-weights: 0.25 0.5 0.75;
}

.decision {
  shape: diamond;
  background-color: #f72585;
  width: 160px;
  height: 160px;
}

.action {
  shape: rectangle;
  background-color: #4361ee;
}

.input {
  shape: parallelogram;
  background-color: #4cc9f0;
  width: 140px;
  height: 70px;
}

.terminal {
  shape: ellipse;
  background-color: #7209b7;
  width: 140px;
  height: 70px;
}

.recurse {
  shape: rectangle;
  background-color: #4895ef;
  border-width: 3px;
  border-style: dashed;
  border-color: #f72585;
  width: 140px;
  height: 70px;
}

.color_blue {
  background-color: #4cc9f0;
}

.color_green {
  background-color: #52b788;
}

.color_red {
  background-color: #e63946;
}

.color_orange {
  background-color: #fb8500;
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
