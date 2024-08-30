import { FFTheme } from "../FFTheme";

export const content = `
Start Process
  Step 1: Initial Assessment
    Decision Point
      Yes: Proceed to Step 2
        Step 2: Detailed Analysis
          Review Documentation [href="https://docs.example.com"]
          Conduct Analysis
            Generate Report
              Share Results [href="https://results.example.com"]
      No: Request More Information
        Contact Client [href="mailto:client@example.com"]
          (Initial Assessment)
  Step 3: Final Decision
    Approve: Complete Process
    Reject: Provide Feedback
      (Start Process)
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1.1,

  background: "#fbfbfb",
  fontFamily: "Inter",

  shape: "roundrectangle",
  nodeBackground: "#e6e6e6",
  nodeForeground: "#333333",
  padding: 15,
  borderWidth: 0,
  borderColor: "#cccccc",
  textMaxWidth: 150,
  lineHeight: 1.3,
  textMarginY: 0,
  useFixedHeight: false,
  fixedHeight: 60,

  curveStyle: "bezier",
  edgeWidth: 2,
  edgeColor: "#888888",
  sourceArrowShape: "none",
  targetArrowShape: "triangle",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 5,
  arrowScale: 1,
  edgeTextSize: 0.9,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap');

:childless {
  font-weight: bold;
}

/** Start */
:childless[in_degree < 1][out_degree > 0] {
  background-color: #50c878;
  border-color: #3da75d;
}

/** Decision Point */
:childless[out_degree > 1] {
  shape: diamond;
  background-color: #ffa500;
  height: $width;
  text-margin-y: 2;
  border-color: #cc8400;
}

/** Terminal */
:childless[out_degree < 1][in_degree > 0] {
  background-color: #ff6347;
  color: white;
  border-color: #e74c3c;
}

/** Links */
:childless[href] {
  background-color: #4a90e2;
  color: white;
  text-decoration: underline;
  cursor: pointer;
  border-color: #3a7ac5;
}
`;
