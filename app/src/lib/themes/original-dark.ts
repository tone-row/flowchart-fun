import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#101010",
  white: "#fafaf3",
  green: "#01d857",
  yellow: "#ffcf0d",
  blue: "#6172F9",
  orange: "#ff7044",
  purple: "#a492ff",
  red: "#fa2323",
  gray: "#aaaaaa",
};

const fontFamily = "Porpora";
const backgroundColor = colors.black;
const color = colors.white;
const arrowColor = color;
const lineHeight = 1.25;
const padding = "5px";

const borderWidth = 1.111;
const arrowWidth = borderWidth;
const originalDark: Theme = {
  value: "original-dark",
  bg: backgroundColor,
  fg: color,
  minHeight: 4,
  minWidth: 4,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [
      {
        name: fontFamily,
        url: "Porpora-Regular.woff2",
      },
    ],
  },
  colors,
  styles: [
    {
      selector: "node[label!='']",
      style: {
        width: "data(shapeWidth)",
        height: "data(shapeHeight)",
        "text-margin-y": "data(textMarginY)" as any,
        "text-margin-x": "data(textMarginX)" as any,
      },
    },
    {
      selector: "node",
      style: {
        "font-family": fontFamily,
        backgroundColor: backgroundColor,
        "border-color": arrowColor,
        color: color,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        "text-halign": "center",
        "border-width": borderWidth,
        shape: "rectangle",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        "line-height": lineHeight,
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        "loop-direction": "0deg",
        "loop-sweep": "20deg",
        width: arrowWidth,
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "text-background-shape": "rectangle",
        "text-background-padding": "4px",
        "line-color": arrowColor,
        color: arrowColor,
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        label: "data(label)",
        "text-valign": "center",
        "arrow-scale": 1,
        "text-wrap": "wrap",
        "text-halign": "center",
        "text-rotation": "autorotate",
        "target-distance-from-node": 2,
        "source-distance-from-node": 2,
      },
    },
    {
      selector: ":parent",
      style: {
        "text-valign": "top",
        "text-halign": "center",
        // @ts-ignore
        "text-margin-y": `-${padding}`,
        "text-wrap": "none",
      },
    },
    ...Object.entries(colors).map<StylesheetStyle>(([color, value]) => ({
      selector: `node.${color}`,
      style: {
        "background-color": `${value}`,
        "background-opacity": 1,
        "border-color": `${value}`,
        color: ["blue", "black"].includes(color) ? colors.white : colors.black,
      },
    })),
  ],
};

export default originalDark;

export const background = backgroundColor;
export const cytoscapeStyle = `@import url("/fonts/Porpora.css");

$background: #101010;

node {
  font-size: 10px;
  font-family: Porpora;
  background-color: rgb(16, 16, 16);
  border-color: rgb(250, 250, 243);
  color: rgb(250, 250, 243);
  label: data(label);
  text-wrap: wrap;
  text-max-width: data(width);
  text-valign: center;
  text-halign: center;
  border-width: 1.111px;
  shape: rectangle;
  padding: 5px;
  line-height: 1.25;
}
:parent {
  shape: rectangle;
  padding: 10px;
  border-width: 1px;
  text-valign: top;
  text-halign: center;
  text-margin-y: -5px;
  text-wrap: none;
  color: rgb(250, 250, 243);
}
edge {
  width: 1.111px;
  font-size: 10px;
  font-family: Porpora;
  loop-direction: 0deg;
  loop-sweep: 20deg;
  text-background-opacity: 1;
  text-background-color: $background;
  text-background-shape: rectangle;
  text-background-padding: 4px;
  line-color: rgb(250, 250, 243);
  color: rgb(250, 250, 243);
  target-arrow-color: rgb(250, 250, 243);
  source-arrow-color: rgb(250, 250, 243);
  target-arrow-shape: triangle;
  curve-style: bezier;
  label: data(label);
  text-valign: center;
  arrow-scale: 1;
  text-wrap: wrap;
  text-halign: center;
  text-rotation: autorotate;
  target-distance-from-node: 2px;
  source-distance-from-node: 2px;
}
:loop {
  curve-style: bezier;
}
edge:compound {
  curve-style: bezier;
  source-endpoint: outside-to-line;
  target-endpoint: outside-to-line;
}
:selected {
  background-color: rgb(1, 105, 217);
  line-color: rgb(1, 105, 217);
  source-arrow-color: rgb(1, 105, 217);
  mid-source-arrow-color: rgb(1, 105, 217);
  target-arrow-color: rgb(1, 105, 217);
  mid-target-arrow-color: rgb(1, 105, 217);
}
:parent:selected {
  background-color: rgb(204, 225, 249);
  border-color: rgb(174, 200, 229);
}
:active {
  overlay-padding: 10px;
  overlay-color: rgb(0, 0, 0);
  overlay-opacity: 0.25;
}
.nodeHovered,
.edgeHovered,
node:selected {
  underlay-opacity: 0.1;
  underlay-color: rgb(0, 0, 0);
  underlay-padding: 5px;
}

:childless[label!=""] {
  width: data(shapeWidth);
  height: data(shapeHeight);
  text-margin-y: data(textMarginY);
  text-margin-x: data(textMarginX);
}
node.black {
  background-color: rgb(16, 16, 16);
  background-opacity: 1;
  border-color: rgb(16, 16, 16);
  color: rgb(250, 250, 243);
}
node.white {
  background-color: rgb(250, 250, 243);
  background-opacity: 1;
  border-color: rgb(250, 250, 243);
  color: rgb(16, 16, 16);
}
node.green {
  background-color: rgb(1, 216, 87);
  background-opacity: 1;
  border-color: rgb(1, 216, 87);
  color: rgb(16, 16, 16);
}
node.yellow {
  background-color: rgb(255, 207, 13);
  background-opacity: 1;
  border-color: rgb(255, 207, 13);
  color: rgb(16, 16, 16);
}
node.blue {
  background-color: rgb(97, 114, 249);
  background-opacity: 1;
  border-color: rgb(97, 114, 249);
  color: rgb(250, 250, 243);
}
node.orange {
  background-color: rgb(255, 112, 68);
  background-opacity: 1;
  border-color: rgb(255, 112, 68);
  color: rgb(16, 16, 16);
}
node.purple {
  background-color: rgb(164, 146, 255);
  background-opacity: 1;
  border-color: rgb(164, 146, 255);
  color: rgb(16, 16, 16);
}
node.red {
  background-color: rgb(250, 35, 35);
  background-opacity: 1;
  border-color: rgb(250, 35, 35);
  color: rgb(16, 16, 16);
}
node.gray {
  background-color: rgb(170, 170, 170);
  background-opacity: 1;
  border-color: rgb(170, 170, 170);
  color: rgb(16, 16, 16);
}
.rectangle {
  shape: rectangle;
}
.roundrectangle {
  shape: roundrectangle;
}
.ellipse {
  shape: ellipse;
}
.triangle {
  shape: triangle;
}
.pentagon {
  shape: pentagon;
}
.hexagon {
  shape: hexagon;
}
.heptagon {
  shape: heptagon;
}
.octagon {
  shape: octagon;
}
.star {
  shape: star;
}
.barrel {
  shape: barrel;
}
.diamond {
  shape: diamond;
}
.vee {
  shape: vee;
}
.rhomboid {
  shape: rhomboid;
}
.right-rhomboid {
  shape: right-rhomboid;
}
.polygon {
  shape: polygon;
}
.tag {
  shape: tag;
}
.round-rectangle {
  shape: round-rectangle;
}
.cut-rectangle {
  shape: cut-rectangle;
}
.bottom-round-rectangle {
  shape: bottom-round-rectangle;
}
.concave-hexagon {
  shape: concave-hexagon;
}
.circle {
  shape: ellipse;
  height: data(width);
}
edge.dashed {
  line-style: dashed;
}
edge.dotted {
  line-style: dotted;
}
edge.solid {
  line-style: solid;
}
edge.source-triangle {
  source-arrow-shape: triangle;
}
edge.target-triangle {
  target-arrow-shape: triangle;
}
edge.source-triangle-tee {
  source-arrow-shape: triangle-tee;
}
edge.target-triangle-tee {
  target-arrow-shape: triangle-tee;
}
edge.source-circle-triangle {
  source-arrow-shape: circle-triangle;
}
edge.target-circle-triangle {
  target-arrow-shape: circle-triangle;
}
edge.source-triangle-cross {
  source-arrow-shape: triangle-cross;
}
edge.target-triangle-cross {
  target-arrow-shape: triangle-cross;
}
edge.source-triangle-backcurve {
  source-arrow-shape: triangle-backcurve;
}
edge.target-triangle-backcurve {
  target-arrow-shape: triangle-backcurve;
}
edge.source-vee {
  source-arrow-shape: vee;
}
edge.target-vee {
  target-arrow-shape: vee;
}
edge.source-tee {
  source-arrow-shape: tee;
}
edge.target-tee {
  target-arrow-shape: tee;
}
edge.source-square {
  source-arrow-shape: square;
}
edge.target-square {
  target-arrow-shape: square;
}
edge.source-circle {
  source-arrow-shape: circle;
}
edge.target-circle {
  target-arrow-shape: circle;
}
edge.source-diamond {
  source-arrow-shape: diamond;
}
edge.target-diamond {
  target-arrow-shape: diamond;
}
edge.source-chevron {
  source-arrow-shape: chevron;
}
edge.target-chevron {
  target-arrow-shape: chevron;
}
edge.source-none {
  source-arrow-shape: none;
}
edge.target-none {
  target-arrow-shape: none;
}
node.border-solid {
  border-style: solid;
}
node.border-dashed {
  border-style: dashed;
}
node.border-dotted {
  border-style: dotted;
}
node.border-double {
  border-style: double;
}
node.border-none {
  border-width: 0px;
}
.text-sm {
  font-size: 7.5px;
}
.text-lg {
  font-size: 15px;
}
.text-xl {
  font-size: 20px;
}
node[w] {
  width: data(w);
}
node[h] {
  height: data(h);
}
node[src] {
  background-image: data(src);
  background-fit: cover;
  border-width: 0px;
  text-valign: bottom;
  text-margin-y: 5px;
}
`;
