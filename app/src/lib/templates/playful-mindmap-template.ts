import { FFTheme } from "../FFTheme";

export const content = `
My Favorite Things! .color_pink .size_lg
  Animals .color_yellow
    Dogs .color_blue
      Fluffy .color_green
      Spotty .color_green
    Cats .color_blue
      Whiskers .color_green
      Mittens .color_green
    Unicorns .color_blue
  Food .color_yellow
    Pizza .color_blue
      Cheese .color_green
      Pepperoni .color_green
    Ice Cream .color_blue
      Chocolate .color_green
      Vanilla .color_green
    Cookies .color_blue
  Hobbies .color_yellow
    Drawing .color_blue
    Dancing .color_blue
    Singing .color_blue
  Places .color_yellow
    Beach .color_blue
    Mountains .color_blue
    Space .color_blue
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
  edgeColor: "#888888",
  sourceArrowShape: "none",
  targetArrowShape: "none",
  sourceDistanceFromNode: 5,
  targetDistanceFromNode: 5,
  arrowScale: 1,
  edgeTextSize: 0.875,
  rotateEdgeLabel: false,
  fixedHeight: 100,
};

export const cytoscapeStyle = `
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');

$pink: #FF69B4;
$yellow: #FFD700;
$blue: #87CEFA;
$green: #98FB98;
$red: #FF6B6B;
$orange: #FFB347;
$purple: #DDA0DD;
$grey: #D3D3D3;

:childless.size_lg {
  font-size: 30;
  width: 150;
  line-height: 1;
  text-max-width: 130;
}

:childless.color_pink {
  background-color: $pink;
  border-color: #FF1493;
  color: #FFFFFF;
}

:childless.color_yellow {
  background-color: $yellow;
  border-color: #FFA500;
}

:childless.color_blue {
  background-color: $blue;
  border-color: #4169E1;
}

:childless.color_green {
  background-color: $green;
  border-color: #32CD32;
}

:childless.color_red {
  background-color: $red;
  border-color: #CC0000;
}

:childless.color_orange {
  background-color: $orange;
  border-color: #FF8C00;
}

:childless.color_purple {
  background-color: $purple;
  border-color: #9B30FF;
}

:childless.color_grey {
  background-color: $grey;
  border-color: #A9A9A9;
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
