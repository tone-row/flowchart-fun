import { FFTheme } from "../FFTheme";

export const content = `
My Favorite Things! .root
  Animals .category
    Dogs .subcategory
      Fluffy .item
      Spotty .item
    Cats .subcategory
      Whiskers .item
      Mittens .item
    Unicorns .subcategory
  Food .category
    Pizza .subcategory
      Cheese .item
      Pepperoni .item
    Ice Cream .subcategory
      Chocolate .item
      Vanilla .item
    Cookies .subcategory
  Hobbies .category
    Drawing .subcategory
    Dancing .subcategory
    Singing .subcategory
  Places .category
    Beach .subcategory
    Mountains .subcategory
    Space .subcategory
`;

export const theme: FFTheme = {
  layoutName: "cose",
  direction: "DOWN",
  spacingFactor: 1.1,

  background: "#FFFFFF",
  fontFamily: "Patrick Hand",

  shape: "ellipse",
  nodeBackground: "#FFB6C1",
  nodeForeground: "#333333",
  padding: 10,
  borderWidth: 2,
  borderColor: "#FF69B4",
  textMaxWidth: 100,
  lineHeight: 1.2,
  textMarginY: 0,
  useFixedHeight: false,

  curveStyle: "bezier",
  edgeWidth: 2,
  edgeColor: "#4CAF50",
  sourceArrowShape: "none",
  targetArrowShape: "none",
  sourceDistanceFromNode: 5,
  targetDistanceFromNode: 5,
  arrowScale: 1,
  edgeTextSize: 12,
  rotateEdgeLabel: false,
  fixedHeight: 100,
};

export const cytoscapeStyle = `
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');

node {
  font-weight: normal;
  font-size: 16px;
  text-halign: center;
  text-valign: center;
  color: #333333;
  text-wrap: wrap;
  text-max-width: 100px;
  padding: 10px;
  shape: ellipse;
  width: 120px;
  height: 60px;
  border-width: 2px;
  border-color: #FF69B4;
}

edge {
  width: 2px;
  line-color: #4CAF50;
  opacity: 0.8;
  curve-style: unbundled-bezier;
  control-point-distances: 20 -40 20;
  control-point-weights: 0.25 0.5 0.75;
}

.root {
  background-color: #FF69B4;
  border-width: 3px;
  border-color: #FF1493;
  width: 180px;
  height: 90px;
  font-size: 20px;
  color: #FFFFFF;
}

.category {
  background-color: #FFD700;
  border-color: #FFA500;
}

.subcategory {
  background-color: #87CEFA;
  border-color: #4169E1;
}

.item {
  background-color: #98FB98;
  border-color: #32CD32;
}

node:selected {
  border-width: 4px;
  border-color: #FF4500;
}

edge:selected {
  width: 4px;
  line-color: #FF4500;
  opacity: 1;
}
`;
