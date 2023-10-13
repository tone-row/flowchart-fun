import { FFTheme } from "../FFTheme";

export const content = `
Brainstorming Session
  Prototyping
    Prototype Evaluation
      Yes: Design .color_blue
        Testing
      No: Review .color_green
        Quick Design .color_green
          (Prototyping)
Trends
  (Prototyping)
Research
  (Prototyping)
`;

export const theme: FFTheme = {
  layoutName: "dagre",
  direction: "DOWN",
  spacingFactor: 1.05,
  lineHeight: 1.4,
  shape: "rectangle",
  background: "#f0f3f5",
  textMaxWidth: 150,
  padding: 10,
  fontFamily: "REM",
  curveStyle: "bezier",
  textMarginY: 0,
  borderWidth: 0,
  edgeTextSize: 0.88,
  useFixedHeight: true,
  fixedHeight: 80,
  edgeWidth: 2,
  sourceArrowShape: "none",
  targetArrowShape: "vee",
  edgeColor: "#5a5a5a",
  borderColor: "#1a1a1a",
  nodeBackground: "#f5c844",
  nodeForeground: "#1a1a1a",
  sourceDistanceFromNode: 0,
  targetDistanceFromNode: 0,
  arrowScale: 1.5,
  rotateEdgeLabel: false,
};

export const cytoscapeStyle =
  "$color: #1a1a1a;\n$red: #ed6e49;\n$orange: #f4a261;\n$yellow: #f5c844;\n$green: #11ac9a;\n$blue: #4351d1;\n$pink: #f5c3c2;\n$grey: #f2eded;\n\n:childless {\n  font-weight: 500;\n}\n\n/** Start */\n:childless[in_degree < 1][out_degree > 0] {\n  border-width: 0;\n  shape: roundrectangle;\n  background-color: $color;\n  color: white;\n}\n\n/** Terminal */\n:childless[out_degree < 1][in_degree > 0] {\n  border-width: 0;\n  shape: roundrectangle;\n  background-color: $color;\n  color: white;\n}\n\n/** Branching */\n:childless[in_degree > 0][in_degree < 2][out_degree > 1] {\n  shape: diamond;\n  background-color: $red;\n  color: white;\n  height: $width;\n  border-width: 0;\n  text-margin-y: 2;\n}\n\n/** Merging **/\n:childless[in_degree > 1][out_degree > 0][out_degree < 2] {\n}\n\n:childless.color_red {\n  background-color: $red;\n  color: white;\n}\n:childless.color_orange {\n  background-color: $orange;\n  color: white;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n}\n:childless.color_green {\n  background-color: $green;\n  color: white;\n}\n:childless.color_blue {\n  background-color: $blue;\n  color: white;\n}\n:childless.color_pink {\n  background-color: $pink;\n  color: $color;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}\n";
