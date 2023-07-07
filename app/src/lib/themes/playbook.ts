import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#000000",
  white: "#ffffff",
  green: "#3cae5a",
  yellow: "#e3ca0b",
  blue: "#3634ba",
  orange: "#edae4e",
  purple: "#7256f0",
  red: "#ef4a33",
  gray: "#a3a69d",
};

const fontFamily = "Karla";
const backgroundColor = colors.white;
const nodeBackgroundColor = backgroundColor;
const edgeLabelBackgroundColor = "#EDECF9";
const arrowColor = colors.blue;
const nodeLabelColor = colors.black;
const arrowLabelColor = colors.black;
const lineHeight = 1.33;
const padding = "0px";
const arrowWidth = 1;
const distanceFromNode = 5;

const playbook: Theme = {
  value: "playbook",
  bg: backgroundColor,
  fg: nodeLabelColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "Karla-Regular.woff2" }],
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
        shape: "roundrectangle",
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
        "edge-distances": "intersection",
        "control-point-distances": "-45",
        width: arrowWidth,
        "line-color": arrowColor,
        label: "data(label)",
        color: arrowLabelColor,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 1,
        "text-background-color": edgeLabelBackgroundColor,
        "text-background-padding": "4.5px",
        "text-border-opacity": 1,
        "text-background-shape": "roundrectangle",
        // @ts-ignore
        "edge-text-rotation": "autorotate",
        "source-distance-from-node": distanceFromNode,
        "target-distance-from-node": distanceFromNode,
        "target-arrow-shape": "triangle",
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "arrow-scale": 0.45,
        ghost: "yes",
        "ghost-offset-x": 0.5,
        "ghost-offset-y": 1,
        "ghost-opacity": 0.1,
      },
    },
    {
      selector: ":parent",
      style: {
        "text-valign": "top",
        "text-halign": "center",
        // @ts-ignore
        "text-margin-y": `-6px`,
        "text-wrap": "none",
        padding: "6px",
      },
    },
    ...Object.entries(colors).map<StylesheetStyle>(([color, value]) => ({
      selector: `node.${color}`,
      style: {
        color: `${value}`,
        ...(color === "white"
          ? {
              "background-color": colors.blue,
            }
          : {}),
      },
    })),
  ],
};

export default playbook;

export const background = backgroundColor;
export const cytoscapeStyle = `@import url("/fonts/Karla.css");

$background: ${backgroundColor};

node {
  font-size: 10px;
  font-family: Karla;
  background-color: rgb(255, 255, 255);
  border-color: rgb(54, 52, 186);
  color: rgb(0, 0, 0);
  label: data(label);
  text-wrap: wrap;
  text-max-width: data(width);
  text-valign: center;
  shape: roundrectangle;
  padding: 0px;
  line-height: 1.33;
}
:parent {
  shape: rectangle;
  padding: 6px;
  border-color: rgb(54, 52, 186);
  text-valign: top;
  text-halign: center;
  text-margin-y: -6px;
  text-wrap: none;
}
edge {
  width: 1px;
  font-size: 10px;
  curve-style: bezier;
  edge-distances: intersection;
  control-point-distances: -45px;
  line-color: rgb(54, 52, 186);
  label: data(label);
  color: rgb(0, 0, 0);
  text-valign: bottom;
  text-wrap: wrap;
  font-family: Karla;
  text-background-opacity: 1;
  text-background-color: rgb(255, 255, 255);
  text-background-padding: 4.5px;
  text-border-opacity: 1;
  text-background-shape: roundrectangle;
  text-rotation: autorotate;
  source-distance-from-node: 5px;
  target-distance-from-node: 5px;
  target-arrow-shape: triangle;
  target-arrow-color: rgb(54, 52, 186);
  source-arrow-color: rgb(54, 52, 186);
  arrow-scale: 0.45;
  ghost: yes;
  ghost-offset-x: 0.5px;
  ghost-offset-y: 1px;
  ghost-opacity: 0.1;
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
  color: rgb(0, 0, 0);
}
node.white {
  color: rgb(255, 255, 255);
  background-color: rgb(54, 52, 186);
}
node.green {
  color: rgb(60, 174, 90);
}
node.yellow {
  color: rgb(227, 202, 11);
}
node.blue {
  color: rgb(54, 52, 186);
}
node.orange {
  color: rgb(237, 174, 78);
}
node.purple {
  color: rgb(114, 86, 240);
}
node.red {
  color: rgb(239, 74, 51);
}
node.gray {
  color: rgb(163, 166, 157);
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
