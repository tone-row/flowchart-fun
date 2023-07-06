import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  red: "#F84A4B",
  orange: "#FC7427",
  blue: "#4363ED",
  black: "#000000",
  white: "#ffffff",
  green: "#3BB755",
  yellow: "#f9dc46",
  gray: "#C7CED4",
  purple: "#6D47EA",
};

const fontFamily = '"Virgil3YOFF"';
const backgroundColor = colors.white;
const arrowColor = colors.gray;
const lineHeight = 1.3;
const padding = "2px";

const excalidraw: Theme = {
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    files: [{ url: "Virgil3YOFF.woff2", name: "Virgil3YOFF" }],
    lineHeight: lineHeight,
  },
  value: "excalidraw",
  bg: backgroundColor,
  fg: colors.black,
  safeBg: backgroundColor,
  minWidth: 0,
  minHeight: 0,
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
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        color: colors.black,
        shape: "rectangle",
        backgroundColor: backgroundColor,
        "background-opacity": 0,
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
        "curve-style": "bezier",
        "segment-distances": "60",
        "edge-distances": "intersection",
        width: 1.3,
        "line-color": arrowColor,
        "line-style": "solid",
        label: "data(label)",
        color: colors.black,
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "source-distance-from-node": 4,
        "target-distance-from-node": 4,
        // @ts-ignore
        "text-rotation": "-15deg",
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "arrow-scale": 1,
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
      selector: `.${color}`,
      style: {
        "background-color": `${value}`,
        "background-opacity": 1,
        color: ["purple", "blue", "red", "green", "black", "orange"].includes(
          color
        )
          ? colors.white
          : colors.black,
      },
    })),
  ],
};

export default excalidraw;

export const background = "#ffffff";
export const cytoscapeStyle = `@import url("/fonts/Virgil3YOFF.css");

$background: #ffffff;

node {
  font-size: 10px;
  font-family: "Virgil3YOFF";
  label: data(label);
  text-valign: center;
  text-halign: center;
  text-wrap: wrap;
  text-max-width: data(width);
  color: rgb(0, 0, 0);
  shape: rectangle;
  background-color: rgb(255, 255, 255);
  background-opacity: 0;
  padding: 2px;
  line-height: 1.3;
}
:parent {
  shape: rectangle;
  padding: 10px;
  border-width: 1px;
  text-valign: top;
  text-halign: center;
  text-margin-y: -2px;
  text-wrap: none;
  color: rgb(0, 0, 0);
}
edge {
  width: 1.3px;
  font-size: 10px;
  curve-style: bezier;
  segment-distances: 60px;
  edge-distances: intersection;
  line-color: rgb(199, 206, 212);
  line-style: solid;
  label: data(label);
  color: rgb(0, 0, 0);
  text-wrap: wrap;
  font-family: "Virgil3YOFF";
  source-distance-from-node: 4px;
  target-distance-from-node: 4px;
  text-rotation: -15deg;
  target-arrow-shape: triangle-backcurve;
  target-arrow-color: rgb(199, 206, 212);
  source-arrow-color: rgb(199, 206, 212);
  arrow-scale: 1;
  text-background-color: $background;
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
.red {
  background-color: rgb(248, 74, 75);
  background-opacity: 1;
  color: rgb(255, 255, 255);
}
.orange {
  background-color: rgb(252, 116, 39);
  background-opacity: 1;
  color: rgb(255, 255, 255);
}
.blue {
  background-color: rgb(67, 99, 237);
  background-opacity: 1;
  color: rgb(255, 255, 255);
}
.black {
  background-color: rgb(0, 0, 0);
  background-opacity: 1;
  color: rgb(255, 255, 255);
}
.white {
  background-color: rgb(255, 255, 255);
  background-opacity: 1;
  color: rgb(0, 0, 0);
}
.green {
  background-color: rgb(42, 75, 49);
  background-opacity: 1;
  color: rgb(255, 255, 255);
}
.yellow {
  background-color: rgb(249, 220, 70);
  background-opacity: 1;
  color: rgb(0, 0, 0);
}
.gray {
  background-color: rgb(199, 206, 212);
  background-opacity: 1;
  color: rgb(0, 0, 0);
}
.purple {
  background-color: rgb(109, 71, 234);
  background-opacity: 1;
  color: rgb(255, 255, 255);
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
