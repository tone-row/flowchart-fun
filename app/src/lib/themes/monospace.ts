import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  red: "#ff1457",
  orange: "#FC7427",
  blue: "#9CADFF",
  black: "#14141C",
  white: "#ffffff",
  green: "#58ac39",
  yellow: "#efe60b",
  gray: "#dfe7cf",
  purple: "#b87aff",
};

const darkBlue = "#9AADFD";
const fontFamily = '"Fira Mono", monospace';
const lineHeight = 1.1;
const padding = "5px";

const edgeWidth = 2;
const monospace: Theme = {
  value: "monospace",
  bg: colors.black,
  fg: colors.blue,
  minHeight: 0,
  minWidth: 0,
  font: {
    fontFamily,
    files: [{ url: "FiraMono-Regular.woff2", name: "Fira Mono" }],
    lineHeight,
    fontSize: defaultFontSize,
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
        label: "data(label)",
        color: colors.blue,
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "line-height": lineHeight,
        "text-justification": "center",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        backgroundColor: colors.black,
        "border-color": colors.blue,
        "border-width": edgeWidth,
        "border-opacity": 1,
        shape: "rectangle",
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        "curve-style": "segments",
        opacity: 1,
        width: edgeWidth,
        label: "data(label)",
        color: colors.blue,
        "target-arrow-shape": "triangle",
        "target-arrow-fill": "filled",
        "target-arrow-color": colors.blue,
        "target-distance-from-node": 5,
        "source-distance-from-node": 5,
        "arrow-scale": 1.25,
        "text-background-shape": "roundrectangle",
        "text-background-color": colors.black,
        "text-background-opacity": 1,
        "text-background-padding": "2px",
        "line-style": "solid",
        "line-fill": "linear-gradient",
        // @ts-ignore
        "line-gradient-stop-colors": `${darkBlue} ${colors.blue}`,
        // @ts-ignore
        "line-gradient-stop-positions": "0% 100%",
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
        "border-color": `${value}`,
        color: color === "black" ? colors.white : `${value}`,
      },
    })),
  ],
};

export default monospace;

export const background = colors.black;
export const cytoscapeStyle = `@import url("/fonts/FiraMono.css");

$background: ${background};

node {
  font-size: 10px;
  font-family: "Fira Mono", monospace;
  label: data(label);
  color: #9cadff;
  text-valign: center;
  text-halign: center;
  text-wrap: wrap;
  text-max-width: data(width);
  line-height: 1.1;
  text-justification: center;
  padding: 5px;
  background-color: #14141c;
  border-color: #9cadff;
  border-width: 2px;
  border-opacity: 1;
  shape: rectangle;
}
:parent {
  shape: rectangle;
  padding: 10px;
  border-width: 2px;
  text-valign: top;
  text-halign: center;
  text-margin-y: -5px;
  text-wrap: none;
  color: #9cadff;
}
edge {
  width: 2px;
  font-size: 10px;
  font-family: "Fira Mono", monospace;
  curve-style: segments;
  opacity: 1;
  label: data(label);
  color: #9cadff;
  target-arrow-shape: triangle;
  target-arrow-fill: filled;
  target-arrow-color: #9cadff;
  target-distance-from-node: 5px;
  source-distance-from-node: 5px;
  arrow-scale: 1.25;
  text-background-shape: roundrectangle;
  text-background-color: $background;
  text-background-opacity: 1;
  text-background-padding: 2px;
  line-style: solid;
  line-fill: linear-gradient;
  line-gradient-stop-colors: #9aadfd #9cadff;
  line-gradient-stop-positions: 0% 100%;
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
  background-color: #0169d9;
  line-color: #0169d9;
  source-arrow-color: #0169d9;
  mid-source-arrow-color: #0169d9;
  target-arrow-color: #0169d9;
  mid-target-arrow-color: #0169d9;
}
:parent:selected {
  background-color: #cce1f9;
  border-color: #aec8e5;
}
:active {
  overlay-padding: 10px;
  overlay-color: #000000;
  overlay-opacity: 0.25;
}
.nodeHovered,
.edgeHovered,
node:selected {
  underlay-opacity: 0.1;
  underlay-color: #000000;
  underlay-padding: 5px;
}
:childless[label!=""] {
  width: data(shapeWidth);
  height: data(shapeHeight);
  text-margin-y: data(textMarginY);
  text-margin-x: data(textMarginX);
}
.red {
  border-color: #ff1457;
  color: #ff1457;
}
.orange {
  border-color: #fc7427;
  color: #fc7427;
}
.blue {
  border-color: #9cadff;
  color: #9cadff;
}
.black {
  border-color: #14141c;
  color: #ffffff;
}
.white {
  border-color: #ffffff;
  color: #ffffff;
}
.green {
  border-color: #58ac39;
  color: #58ac39;
}
.yellow {
  border-color: #efe60b;
  color: #efe60b;
}
.gray {
  border-color: #dfe7cf;
  color: #dfe7cf;
}
.purple {
  border-color: #b87aff;
  color: #b87aff;
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
