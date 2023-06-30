import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const blokusColors = {
  red: ["#ba1700", "#d13721", "#fc5b42"],
  orange: ["#bf5900", "#e6954e", "#ff9c45"],
  blue: ["#001194", "#3043d1", "#6172F9"],
  black: ["#171817", "#202a2d", "#242b2e"],
  white: ["#cdc5c5", "#fdfbfb", "#ffffff"],
  green: ["#026F4A", "#019467", "#03B181"],
  yellow: ["#ba9500", "#d4ae17", "#fad545"],
  gray: ["#75736d", "#878378", "#9c9687"],
  purple: ["#4d1db5", "#714bdb", "#9563ff"],
};

const colors = Object.entries(blokusColors).reduce(
  (acc, [color, shades]) => ({
    ...acc,
    [color]: shades[0],
  }),
  {}
);

const textColor = "#FFFFFF";
const fontFamily = '"Space Mono"';
const lineHeight = 1.2;
const backgroundColor = "#1b1b20";
const darkerBackgroundColor = "#060608";
const padding = "6px";

const edgeWidth = 1.5;
const blokus: Theme = {
  value: "blokus",
  bg: backgroundColor,
  fg: textColor,
  minHeight: 0,
  minWidth: 0,
  font: {
    fontFamily,
    lineHeight,
    fontSize: defaultFontSize,
    files: [{ name: fontFamily, url: "SpaceMono-Regular.woff2" }],
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
        color: blokusColors.black[0],
        // @ts-ignore
        "background-fill": "linear-gradient",
        "background-gradient-stop-colors": blokusColors.white.join(" "),
        "background-gradient-direction": "to-top-right",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "line-height": lineHeight,
        "text-justification": "center",
        padding,
        backgroundColor: darkerBackgroundColor,
        shape: "roundrectangle",
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        "curve-style": "unbundled-bezier",
        opacity: 1,
        width: edgeWidth,
        label: "data(label)",
        color: textColor,
        "arrow-scale": 1,
        "target-arrow-shape": "triangle",
        "target-arrow-fill": "filled",
        "target-arrow-color": "#EEFCFC",
        "target-distance-from-node": 5,
        "source-distance-from-node": 5,
        "text-background-shape": "roundrectangle",
        "text-background-color": backgroundColor,
        "text-background-opacity": 1,
        "text-background-padding": "4px",
        "text-rotation": "autorotate",
        "line-style": "solid",
        "line-fill": "linear-gradient",
        // @ts-ignore
        "line-gradient-stop-colors": `#F4F4F5 #EEFCFC`,
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
    ...Object.entries(blokusColors).map<StylesheetStyle>(([color, value]) => ({
      selector: `.${color}`,
      style: {
        "background-gradient-stop-colors": `${value[0]} ${value[1]} ${value[2]}`,
        color: color === "white" ? blokusColors.black[0] : textColor,
      },
    })),
  ],
};

export default blokus;
export const background = "#1b1b20";
export const cytoscapeStyle = `@import url("/fonts/SpaceMono.css");

:parent {
  shape: rectangle;
  background-color: #eeeeee;
  padding: 10px;
  border-color: #cccccc;
  border-width: 1px;
  text-valign: top;
  text-halign: center;
  text-margin-y: -6px;
  text-wrap: none;
  color: #ffffff;
}
edge {
  width: 1.5px;
  font-size: 10px;
  font-family: "Space Mono";
  curve-style: unbundled-bezier;
  opacity: 1;
  label: data(label);
  color: #ffffff;
  arrow-scale: 1;
  target-arrow-shape: triangle;
  target-arrow-fill: filled;
  target-arrow-color: #eefcfc;
  target-distance-from-node: 5px;
  source-distance-from-node: 5px;
  text-background-shape: roundrectangle;
  text-background-color: #1b1b20;
  text-background-opacity: 1;
  text-background-padding: 4px;
  text-rotation: autorotate;
  line-style: solid;
  line-fill: linear-gradient;
  line-gradient-stop-colors: #f4f4f5 #eefcfc;
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
node {
  font-size: 10px;
  font-family: "Space Mono";
  label: data(label);
  color: #171817;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #cdc5c5 #fdfbfb #ffffff;
  background-gradient-direction: to-top-right;
  text-valign: center;
  text-halign: center;
  text-wrap: wrap;
  text-max-width: data(width);
  line-height: 1.2;
  text-justification: center;
  padding: 6px;
  background-color: #060608;
  shape: roundrectangle;
}
node[label!=""] {
  width: data(shapeWidth);
  height: data(shapeHeight);
  text-margin-y: data(textMarginY);
  text-margin-x: data(textMarginX);
}
.red {
  background-gradient-stop-colors: #ba1700 #d13721 #fc5b42;
  color: #ffffff;
}
.orange {
  background-gradient-stop-colors: #bf5900 #e6954e #ff9c45;
  color: #ffffff;
}
.blue {
  background-gradient-stop-colors: #001194 #3043d1 #6172f9;
  color: #ffffff;
}
.black {
  background-gradient-stop-colors: #171817 #202a2d #242b2e;
  color: #ffffff;
}
.white {
  background-gradient-stop-colors: #cdc5c5 #fdfbfb #ffffff;
  color: #171817;
}
.green {
  background-gradient-stop-colors: #026f4a #019467 #03b181;
  color: #ffffff;
}
.yellow {
  background-gradient-stop-colors: #ba9500 #d4ae17 #fad545;
  color: #ffffff;
}
.gray {
  background-gradient-stop-colors: #75736d #878378 #9c9687;
  color: #ffffff;
}
.purple {
  background-gradient-stop-colors: #4d1db5 #714bdb #9563ff;
  color: #ffffff;
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
