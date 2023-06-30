import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#05080C",
  white: "#FEFEFE",
  green: "#CAD553",
  yellow: "#F6D883",
  blue: "#1f75ff",
  orange: "#EC7957",
  purple: "#946ded",
  red: "#e33645",
  gray: "#cacaca",
};

const fontFamily = "Permanent Marker";
const backgroundColor = colors.white;
const arrowColor = "rgb(163, 184, 186)";
const lineHeight = 1.2;
const padding = 5;
const borderWidth = 1.88;

const comicBook: Theme = {
  value: "comic-book",
  bg: backgroundColor,
  fg: colors.black,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "PermanentMarker-Regular.woff2" }],
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
        "background-color": colors.yellow,
        "font-family": fontFamily,
        color: colors.black,
        "text-margin-y": -1,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "rectangle",
        // @ts-ignore
        padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": borderWidth,
        "border-color": colors.black,
      },
    },
    {
      selector: "edge",
      style: {
        // @ts-ignore
        "curve-style": "straight-triangle",
        width: borderWidth * 9,
        "line-color": arrowColor,
        label: "data(label)",
        color: colors.black,
        "line-opacity": 0.5,
        "source-endpoint": "inside-to-node",
        "text-valign": "center",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 0,
        "edge-text-rotation": "autorotate",
        "source-distance-from-node": 0,
        "target-distance-from-node": 0,
        "edge-distances": "intersection",
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
        ...(["black", "purple", "blue"].includes(color)
          ? { color: colors.white }
          : { color: colors.black }),
      },
    })),
  ],
};

export default comicBook;

export const background = "#FEFEFE";
export const cytoscapeStyle = `@import url("/fonts/PermanentMarker.css");

:parent {
  shape: rectangle;
  background-color: rgb(238, 238, 238);
  padding: 10px;
  border-color: rgb(204, 204, 204);
  border-width: 1px;
  text-valign: top;
  text-halign: center;
  text-margin-y: -5px;
  text-wrap: none;
  color: rgb(5, 8, 12);
}
edge {
  width: 16.919999999999998px;
  font-size: 10px;
  curve-style: straight-triangle;
  line-color: rgb(163, 184, 186);
  label: data(label);
  color: rgb(5, 8, 12);
  line-opacity: 0.5;
  source-endpoint: inside-to-node;
  text-valign: center;
  text-wrap: wrap;
  font-family: Permanent Marker;
  text-background-opacity: 0;
  text-rotation: autorotate;
  source-distance-from-node: 0px;
  target-distance-from-node: 0px;
  edge-distances: intersection;
  text-background-color: rgb(254, 254, 254);
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
  background-color: rgb(246, 216, 131);
  font-family: Permanent Marker;
  color: rgb(5, 8, 12);
  text-margin-y: -1px;
  label: data(label);
  text-wrap: wrap;
  text-max-width: data(width);
  text-valign: center;
  shape: rectangle;
  padding: 5px;
  line-height: 1.2;
  border-style: solid;
  border-width: 1.88px;
  border-color: rgb(5, 8, 12);
}
node[label!=""] {
  width: data(shapeWidth);
  height: data(shapeHeight);
  text-margin-y: data(textMarginY);
  text-margin-x: data(textMarginX);
}
node.black {
  background-color: rgb(5, 8, 12);
  color: rgb(254, 254, 254);
}
node.white {
  background-color: rgb(254, 254, 254);
  color: rgb(5, 8, 12);
}
node.green {
  background-color: rgb(202, 213, 83);
  color: rgb(5, 8, 12);
}
node.yellow {
  background-color: rgb(246, 216, 131);
  color: rgb(5, 8, 12);
}
node.blue {
  background-color: rgb(31, 117, 255);
  color: rgb(254, 254, 254);
}
node.orange {
  background-color: rgb(236, 121, 87);
  color: rgb(5, 8, 12);
}
node.purple {
  background-color: rgb(148, 109, 237);
  color: rgb(254, 254, 254);
}
node.red {
  background-color: rgb(227, 54, 69);
  color: rgb(5, 8, 12);
}
node.gray {
  background-color: rgb(202, 202, 202);
  color: rgb(5, 8, 12);
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
