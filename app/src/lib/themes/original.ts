import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

export const colors = {
  black: "#000000",
  white: "#ffffff",
  green: "#01d857",
  yellow: "#ffcf0d",
  blue: "#6172F9",
  orange: "#ff7044",
  purple: "#a492ff",
  red: "#fa2323",
  gray: "#aaaaaa",
};

const fontFamily = "Karla";
const backgroundColor = colors.white;
const arrowColor = colors.black;
const lineHeight = 1.25;
const padding = "6px";
const foregroundColor = colors.black;

const arrowWidth = 0.75;
const original: Theme = {
  value: "original",
  bg: backgroundColor,
  fg: foregroundColor,
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
        backgroundColor,
        "border-color": arrowColor,
        color: arrowColor,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": `data(width)`,
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        "text-valign": "center",
        "text-halign": "center",
        "border-width": arrowWidth,
        shape: "rectangle",
        "line-height": lineHeight,
      },
    },
    {
      selector: "edge",
      style: {
        "loop-direction": "0deg",
        "loop-sweep": "20deg",
        width: arrowWidth,
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "text-background-padding": "3px",
        "line-color": arrowColor,
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "target-arrow-shape": "triangle",
        "arrow-scale": 1,
        "curve-style": "bezier",
        label: "data(label)",
        color: arrowColor,
        "text-valign": "center",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-halign": "center",
        // @ts-ignore
        "edge-text-rotation": "autorotate",
        "target-distance-from-node": 1,
        "source-distance-from-node": 0,
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
        "border-color": color === "white" ? `${value}` : colors.black,
        color: ["blue", "black"].includes(color) ? colors.white : colors.black,
      },
    })),
  ],
};

export default original;

export const background = backgroundColor;
export const cytoscapeStyle = `
/** You can now customize themes using a variant of CSS! 
*** We've added comments to this code to help you 
*** understand how to customize your theme. */

/** Load external fonts */
@import url("/fonts/Karla.css");

/** Use scss-style variables to share colors and other values */
$fontFamily: Karla;
$background: #ffffff;
$borderWidth: 0.75px;
$borderColor: #000000;
$nodeBackground: #ffffff;
$defaultShape: rectangle;

/** Style all nodes and containers */
node {
  font-size: 10px;
  font-family: $fontFamily;
  background-color: $nodeBackground;
  border-color: $borderColor;
  color: rgb(0, 0, 0);
  label: data(label);
  text-wrap: wrap;
  text-max-width: data(width);
  padding: 6px;
  text-valign: center;
  text-halign: center;
  border-width: $borderWidth;
  shape: $defaultShape;
  line-height: 1.25;
}

/** Style containers */
:parent {
  shape: rectangle;
  padding: 5px;
  border-width: $borderWidth;
  text-valign: top;
  text-halign: center;
  text-margin-y: -6px;
  text-wrap: none;
}

/** Style edges */
edge {
  width: $borderWidth;
  font-size: 10px;
  loop-direction: 0deg;
  loop-sweep: 20deg;
  text-background-opacity: 1;
  text-background-color: $background;
  text-background-padding: 3px;
  line-color: $borderColor;
  target-arrow-color: $borderColor;
  source-arrow-color: $borderColor;
  target-arrow-shape: triangle;
  arrow-scale: 1;
  curve-style: bezier;
  label: data(label);
  color: $borderColor;
  text-valign: center;
  text-wrap: wrap;
  font-family: $fontFamily;
  text-halign: center;
  text-rotation: autorotate;
  target-distance-from-node: 1px;
  source-distance-from-node: 0px;
}

/** Style nodes */
:childless[label!=""] {
  width: data(shapeWidth);
  height: data(shapeHeight);
}
:childless[textMarginY] {
  text-margin-y: data(textMarginY);
}
:childless[textMarginX] {
  text-margin-x: data(textMarginX);
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

node.black {
  background-color: rgb(0, 0, 0);
  background-opacity: 1;
  border-color: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
}
node.white {
  background-color: rgb(255, 255, 255);
  background-opacity: 1;
  border-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
}
node.green {
  background-color: rgb(1, 216, 87);
  background-opacity: 1;
  border-color: rgb(0, 0, 0);
  color: rgb(0, 0, 0);
}
node.yellow {
  background-color: rgb(255, 207, 13);
  background-opacity: 1;
  border-color: rgb(0, 0, 0);
  color: rgb(0, 0, 0);
}
node.blue {
  background-color: rgb(97, 114, 249);
  background-opacity: 1;
  border-color: rgb(0, 0, 0);
  color: rgb(255, 255, 255);
}
node.orange {
  background-color: rgb(255, 112, 68);
  background-opacity: 1;
  border-color: rgb(0, 0, 0);
  color: rgb(0, 0, 0);
}
node.purple {
  background-color: rgb(164, 146, 255);
  background-opacity: 1;
  border-color: rgb(0, 0, 0);
  color: rgb(0, 0, 0);
}
node.red {
  background-color: rgb(250, 35, 35);
  background-opacity: 1;
  border-color: rgb(0, 0, 0);
  color: rgb(0, 0, 0);
}
node.gray {
  background-color: rgb(170, 170, 170);
  background-opacity: 1;
  border-color: rgb(0, 0, 0);
  color: rgb(0, 0, 0);
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
