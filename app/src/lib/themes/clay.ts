import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#28152e",
  white: "#FFFFFF",
  green: "#abb17c",
  yellow: "#eec752",
  blue: "#81b4c0",
  orange: "#edae4e",
  purple: "#7256f0",
  red: "#B5817E",
  gray: "#664C4A",
};

const fontFamily = "Poor Story";
const backgroundColor = colors.gray;
const nodeBackgroundColor = backgroundColor;
const arrowColor = "#FCFAF1";
const nodeLabelColor = colors.white;
const arrowLabelColor = colors.red;
const lineHeight = 1;
const padding = "6px";
const arrowWidth = 2;
const edgeLabelBackgroundColor = backgroundColor;

const clay: Theme = {
  value: "clay",
  bg: backgroundColor,
  fg: nodeLabelColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "PoorStory-Regular.woff2" }],
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
        backgroundColor: nodeBackgroundColor,
        "border-color": arrowColor,
        color: nodeLabelColor,
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
        "control-point-distances": "-20",
        width: arrowWidth,
        "line-color": arrowColor,
        label: "data(label)",
        color: arrowLabelColor,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "target-arrow-shape": "triangle",
        "text-background-opacity": 1,
        "text-background-color": edgeLabelBackgroundColor,
        "text-background-padding": "3px",
        "text-border-opacity": 1,
        "text-background-shape": "roundrectangle",
        "text-rotation": "autorotate",
        // @ts-ignore
        "target-distance-from-node": "0px",
        // @ts-ignore
        "source-distance-from-node": "0px",
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
        color: ["yellow", "white", "green", "orange"].includes(color)
          ? colors.black
          : colors.white,
      },
    })),
  ],
};

export default clay;

export const background = "#664C4A";
export const cytoscapeStyle = `@import url("/fonts/PoorStory.css");

$background: #664C4A;

node {
  font-size: 10px;
  font-family: Poor Story;
  background-color: rgb(102, 76, 74);
  border-color: rgb(252, 250, 241);
  color: rgb(255, 255, 255);
  label: data(label);
  text-wrap: wrap;
  text-max-width: data(width);
  text-valign: center;
  shape: ellipse;
  padding: 6px;
  line-height: 1;
}
:parent {
  shape: rectangle;
  padding: 10px;
  border-width: 1px;
  text-valign: top;
  text-halign: center;
  text-margin-y: -6px;
  text-wrap: none;
  color: rgb(255, 255, 255);
}
edge {
  width: 2px;
  font-size: 10px;
  curve-style: unbundled-bezier;
  control-point-distances: -20px;
  line-color: rgb(252, 250, 241);
  label: data(label);
  color: rgb(181, 129, 126);
  text-valign: bottom;
  text-wrap: wrap;
  font-family: Poor Story;
  target-arrow-color: rgb(252, 250, 241);
  source-arrow-color: rgb(252, 250, 241);
  target-arrow-shape: triangle;
  text-background-opacity: 1;
  text-background-color: rgb(102, 76, 74);
  text-background-padding: 3px;
  text-border-opacity: 1;
  text-background-shape: roundrectangle;
  text-rotation: autorotate;
  target-distance-from-node: 0px;
  source-distance-from-node: 0px;
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
  background-color: rgb(40, 21, 46);
  background-opacity: 1;
  color: rgb(255, 255, 255);
}
node.white {
  background-color: rgb(255, 255, 255);
  background-opacity: 1;
  color: rgb(40, 21, 46);
}
node.green {
  background-color: rgb(171, 177, 124);
  background-opacity: 1;
  color: rgb(40, 21, 46);
}
node.yellow {
  background-color: rgb(238, 199, 82);
  background-opacity: 1;
  color: rgb(40, 21, 46);
}
node.blue {
  background-color: rgb(129, 180, 192);
  background-opacity: 1;
  color: rgb(255, 255, 255);
}
node.orange {
  background-color: rgb(237, 174, 78);
  background-opacity: 1;
  color: rgb(40, 21, 46);
}
node.purple {
  background-color: rgb(114, 86, 240);
  background-opacity: 1;
  color: rgb(255, 255, 255);
}
node.red {
  background-color: rgb(181, 129, 126);
  background-opacity: 1;
  color: rgb(255, 255, 255);
}
node.gray {
  background-color: rgb(102, 76, 74);
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
