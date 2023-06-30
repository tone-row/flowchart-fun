import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#36321F",
  white: "#ffffff",
  green: "#01d857",
  yellow: "#ffcf0d",
  blue: "#6172F9",
  orange: "#ff7044",
  purple: "#a492ff",
  red: "#fa2323",
  gray: "#aaaaaa",
};

const fontFamily = "Sporting Grotesque";
const backgroundColor = colors.white;
const nodeBackgroundColor = backgroundColor;
const arrowColor = colors.black;
const nodeLabelColor = arrowColor;
const arrowLabelColor = arrowColor;
const lineHeight = 1.33;
const padding = "5px";
const arrowWidth = 1.5;
const borderWidth = arrowWidth * 2;
const distanceFromNode = 3;
const borderColor = arrowColor;
const underlayColor = borderColor;

const museum: Theme = {
  value: "museum",
  bg: backgroundColor,
  fg: nodeLabelColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "Sporting_Grotesque-Regular_web.woff2" }],
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
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": borderWidth,
        // @ts-ignore
        "border-color": borderColor,
        // @ts-ignore
        "underlay-color": underlayColor,
        "underlay-padding": "4px",
        "underlay-opacity": 1,
        "underlay-shape": "ellipse",
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        // @ts-ignore
        "control-point-step-size": "60",
        width: arrowWidth,
        "line-color": arrowColor,
        label: "data(label)",
        color: arrowLabelColor,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "text-background-padding": "2px",
        "text-border-opacity": 1,
        "text-background-shape": "rectangle",
        "edge-text-rotation": "autorotate",
        "source-distance-from-node": distanceFromNode,
        "target-distance-from-node": 5,
        "target-arrow-shape": "triangle",
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "arrow-scale": 0.75,
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
        "underlay-color": `${value}`,
        ...(color === "white" ? { "border-color": `${value}` } : {}),
      },
    })),
  ],
};

export default museum;

export const background = backgroundColor;
export const cytoscapeStyle = `@import url("/fonts/SportingGrotesque.css");

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
  color: rgb(54, 50, 31);
}
edge {
  width: 1.5px;
  font-size: 10px;
  curve-style: bezier;
  control-point-step-size: 60px;
  line-color: rgb(54, 50, 31);
  label: data(label);
  color: rgb(54, 50, 31);
  text-valign: bottom;
  text-wrap: wrap;
  font-family: Sporting Grotesque;
  text-background-opacity: 1;
  text-background-color: rgb(255, 255, 255);
  text-background-padding: 2px;
  text-border-opacity: 1;
  text-background-shape: rectangle;
  text-rotation: autorotate;
  source-distance-from-node: 3px;
  target-distance-from-node: 5px;
  target-arrow-shape: triangle;
  target-arrow-color: rgb(54, 50, 31);
  source-arrow-color: rgb(54, 50, 31);
  arrow-scale: 0.75;
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
  font-family: Sporting Grotesque;
  background-color: rgb(255, 255, 255);
  border-color: rgb(54, 50, 31);
  color: rgb(54, 50, 31);
  text-justification: center;
  label: data(label);
  text-wrap: wrap;
  text-max-width: data(width);
  text-valign: center;
  shape: roundrectangle;
  padding: 5px;
  line-height: 1.33;
  border-style: solid;
  border-width: 3px;
  underlay-color: rgb(54, 50, 31);
  underlay-padding: 4px;
  underlay-opacity: 1;
  underlay-shape: ellipse;
}
node[label!=""] {
  width: data(shapeWidth);
  height: data(shapeHeight);
  text-margin-y: data(textMarginY);
  text-margin-x: data(textMarginX);
}
node.black {
  underlay-color: rgb(54, 50, 31);
}
node.white {
  underlay-color: rgb(255, 255, 255);
  border-color: rgb(255, 255, 255);
}
node.green {
  underlay-color: rgb(1, 216, 87);
}
node.yellow {
  underlay-color: rgb(255, 207, 13);
}
node.blue {
  underlay-color: rgb(97, 114, 249);
}
node.orange {
  underlay-color: rgb(255, 112, 68);
}
node.purple {
  underlay-color: rgb(164, 146, 255);
}
node.red {
  underlay-color: rgb(250, 35, 35);
}
node.gray {
  underlay-color: rgb(170, 170, 170);
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
