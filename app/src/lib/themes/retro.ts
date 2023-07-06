import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#1D1D1B",
  white: "#F6F7F8",
  green: "#6BA07A",
  yellow: "#F0D356",
  blue: "#9DB9C4",
  orange: "#DB8962",
  purple: "#D95076",
  red: "#D7292B",
  gray: "#C5D4E8",
};

const fontFamily = "Josefin Sans";
const backgroundColor = "#F0DDB1";
const nodeBackgroundColor = colors.white;
const arrowColor = colors.black;
const nodeLabelColor = arrowColor;
const lineHeight = 1.2;
const padding = "8px";
const borderWidth = 3;
const borderColor = arrowColor;

const retro: Theme = {
  value: "retro",
  bg: backgroundColor,
  fg: nodeLabelColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "JosefinSans-Regular.woff2" }],
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
        "text-justification": "center",
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "roundrectangle",
        // @ts-ignore
        padding: padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": borderWidth,
        // @ts-ignore
        "border-color": borderColor,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "taxi",
        width: borderWidth * 1.25,
        "line-color": arrowColor,
        label: "data(label)",
        color: colors.white,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 1,
        "text-background-color": colors.black, // "#D09A5B",
        "text-background-padding": "6",
        "text-background-shape": "roundrectangle",
        // @ts-ignore
        "edge-text-rotation": "autorotate",
        "source-distance-from-node": 4,
        "target-distance-from-node": 0,
        "target-arrow-shape": "triangle",
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "arrow-scale": 0.6,
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
        ...(["red", "black"].includes(color) ? { color: colors.white } : {}),
      },
    })),
  ],
};

export default retro;

export const background = backgroundColor;
export const cytoscapeStyle = `@import url("/fonts/JosefinSans.css");

$background: ${backgroundColor};
$fontFamily: ${fontFamily};

node {
  font-size: 10px;
  font-family: $fontFamily;
  background-color: rgb(246, 247, 248);
  border-color: rgb(29, 29, 27);
  color: rgb(29, 29, 27);
  text-justification: center;
  label: data(label);
  text-wrap: wrap;
  text-max-width: data(width);
  text-valign: center;
  shape: roundrectangle;
  padding: 8px;
  line-height: 1.2;
  border-style: solid;
  border-width: 3px;
}
:parent {
  shape: roundrectangle;
  padding: 10px;
  border-width: 3px;
  text-valign: top;
  text-halign: center;
  text-margin-y: -8px;
  text-wrap: none;
  color: rgb(29, 29, 27);
}
edge {
  width: 3.75px;
  font-size: 10px;
  curve-style: taxi;
  line-color: rgb(29, 29, 27);
  label: data(label);
  color: rgb(246, 247, 248);
  text-valign: bottom;
  text-wrap: wrap;
  font-family: $fontFamily;
  text-background-opacity: 1;
  text-background-color: rgb(0, 0, 0);
  text-background-padding: 6px;
  text-background-shape: roundrectangle;
  text-rotation: autorotate;
  source-distance-from-node: 4px;
  target-distance-from-node: 0px;
  target-arrow-shape: triangle;
  target-arrow-color: rgb(29, 29, 27);
  source-arrow-color: rgb(29, 29, 27);
  arrow-scale: 0.6;
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
  background-color: rgb(29, 29, 27);
  color: rgb(246, 247, 248);
}
node.white {
  background-color: rgb(246, 247, 248);
}
node.green {
  background-color: rgb(107, 160, 122);
}
node.yellow {
  background-color: rgb(240, 211, 86);
}
node.blue {
  background-color: rgb(157, 185, 196);
}
node.orange {
  background-color: rgb(219, 137, 98);
}
node.purple {
  background-color: rgb(217, 80, 118);
}
node.red {
  background-color: rgb(215, 41, 43);
  color: rgb(246, 247, 248);
}
node.gray {
  background-color: rgb(197, 212, 232);
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
