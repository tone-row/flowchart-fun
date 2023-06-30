import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  red: "#f05935",
  orange: "#ecbb40",
  blue: "#425cde",
  black: "#352f39",
  white: "#fffdfd",
  green: "#5ba662",
  yellow: "#fffa96",
  gray: "#e3ded7",
  purple: "#6620e4  ",
};

const fontFamily = '"Gaegu"';
const backgroundColor = colors.yellow;
const arrowColor = colors.black;
const lineHeight = 1;
const padding = "14px";
const borderWidth = 1.5;

const eggs: Theme = {
  value: "eggs",
  bg: backgroundColor,
  fg: arrowColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: "Gaegu", url: "Gaegu-Regular.woff2" }],
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
        backgroundColor: colors.white,
        "border-color": arrowColor,
        color: arrowColor,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "ellipse",
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
        "curve-style": "unbundled-bezier",
        "loop-direction": "10deg",
        "loop-sweep": "20deg",
        width: borderWidth,
        "line-color": arrowColor,
        label: "data(label)",
        color: arrowColor,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "target-arrow-shape": "triangle",
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "text-background-padding": "3px",
        "text-background-shape": "roundrectangle",
        "text-border-style": "solid",
        // @ts-ignore
        "edge-text-rotation": "autorotate",
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
        color: ["purple", "blue", "red", "green", "black"].includes(color)
          ? colors.white
          : colors.black,
      },
    })),
  ],
};

export default eggs;

export const background = "#fffa96";
export const cytoscapeStyle = `@import url("/fonts/GaeguRegular.css");

:parent {
  shape: rectangle;
  background-color: rgb(238, 238, 238);
  padding: 10px;
  border-color: rgb(204, 204, 204);
  border-width: 1px;
  text-valign: top;
  text-halign: center;
  text-margin-y: -14px;
  text-wrap: none;
  color: rgb(53, 47, 57);
}
edge {
  width: 1.5px;
  font-size: 10px;
  curve-style: unbundled-bezier;
  loop-direction: 10deg;
  loop-sweep: 20deg;
  line-color: rgb(53, 47, 57);
  label: data(label);
  color: rgb(53, 47, 57);
  text-valign: bottom;
  text-wrap: wrap;
  font-family: "Gaegu";
  target-arrow-color: rgb(53, 47, 57);
  source-arrow-color: rgb(53, 47, 57);
  target-arrow-shape: triangle;
  text-background-opacity: 1;
  text-background-color: rgb(255, 250, 150);
  text-background-padding: 3px;
  text-background-shape: roundrectangle;
  text-border-style: solid;
  text-rotation: autorotate;
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
node {
  font-size: 10px;
  font-family: "Gaegu";
  background-color: rgb(255, 253, 253);
  border-color: rgb(53, 47, 57);
  color: rgb(53, 47, 57);
  label: data(label);
  text-wrap: wrap;
  text-max-width: data(width);
  text-valign: center;
  shape: ellipse;
  padding: 14px;
  line-height: 1;
}
node[label!=""] {
  width: data(shapeWidth);
  height: data(shapeHeight);
  text-margin-y: data(textMarginY);
  text-margin-x: data(textMarginX);
}
node.red {
  background-color: rgb(240, 89, 53);
  background-opacity: 1;
  color: rgb(255, 253, 253);
}
node.orange {
  background-color: rgb(236, 187, 64);
  background-opacity: 1;
  color: rgb(53, 47, 57);
}
node.blue {
  background-color: rgb(66, 92, 222);
  background-opacity: 1;
  color: rgb(255, 253, 253);
}
node.black {
  background-color: rgb(53, 47, 57);
  background-opacity: 1;
  color: rgb(255, 253, 253);
}
node.white {
  background-color: rgb(255, 253, 253);
  background-opacity: 1;
  color: rgb(53, 47, 57);
}
node.green {
  background-color: rgb(91, 166, 98);
  background-opacity: 1;
  color: rgb(255, 253, 253);
}
node.yellow {
  background-color: rgb(255, 250, 150);
  background-opacity: 1;
  color: rgb(53, 47, 57);
}
node.gray {
  background-color: rgb(227, 222, 215);
  background-opacity: 1;
  color: rgb(53, 47, 57);
}
node.purple {
  background-color: rgb(102, 32, 228);
  background-opacity: 1;
  color: rgb(255, 253, 253);
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
