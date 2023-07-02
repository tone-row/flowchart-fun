import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#05080C",
  white: "#E6E6E6",
  green: "#1FAC30",
  yellow: "#E2FC43",
  blue: "#2B6CF0",
  orange: "#F2411A",
  purple: "#AD1342",
  red: "#D01614",
  gray: "#A5B4C8",
};

const colors2 = {
  black: "#303030",
  blue: "#52B6F6",
  red: "#E56B30",
  white: "#FEFEFE",
  green: "#25F55C",
  orange: "#E98423",
  yellow: "#D0F955",
  purple: "#F81581",
  gray: "#C5D4E8",
};

const fontFamily = "Space Mono";
const backgroundColor = colors2.white;
const arrowColor = colors.gray;
const lineHeight = 1.2;
const padding = "8px";
const borderWidth = 1;

const futuristic: Theme = {
  value: "futuristic",
  bg: backgroundColor,
  fg: colors.black,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "SpaceMono-Regular.woff2" }],
  },
  colors: colors2,
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
        // @ts-ignore
        "background-fill": "linear-gradient",
        "background-gradient-stop-colors": `${colors.blue} ${colors2.blue}`,
        "background-gradient-direction": "to-right",
        "font-family": fontFamily,
        "border-color": arrowColor,
        color: colors.black,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "rectangle",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": borderWidth,
        // @ts-ignore
        "border-color": colors.black,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "taxi",
        width: borderWidth * 1.75,
        "line-color": arrowColor,
        label: "data(label)",
        color: colors.black,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "text-background-padding": "1",
        "text-background-shape": "rectangle",
        "text-margin-y": -11,
        "source-distance-from-node": 0,
        "target-distance-from-node": 0,
        "target-arrow-shape": "triangle",
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        // @ts-ignore
        "target-underlay-color": "#000000",
        "target-underlay-padding": 3.5,
        "target-underlay-opacity": 1,
        "arrow-scale": 1.444,
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
    ...Object.entries(colors).map<StylesheetStyle>(([color, value]) => {
      const color1 = colors[color as keyof typeof colors];
      const color2 = colors2[color as keyof typeof colors2];
      return {
        selector: `node.${color}`,
        style: {
          "background-color": `${value}`,
          ...(Object.keys(colors2).includes(color)
            ? {
                "background-fill": "linear-gradient",
                "background-gradient-stop-colors": `${color1} ${color2}`,
                "background-gradient-direction": "to-right",
              }
            : {
                "background-color": color1,
              }),
          ...(["black"].includes(color)
            ? { color: colors2.white }
            : { color: colors.black }),
        },
      };
    }),
  ],
};

export default futuristic;

export const background = backgroundColor;
export const cytoscapeStyle = `@import url("/fonts/SpaceMono.css");

$background: ${backgroundColor};

node {
  font-size: 10px;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #2b6cf0 #52b6f6;
  background-gradient-direction: to-right;
  font-family: Space Mono;
  border-color: #05080c;
  color: #05080c;
  label: data(label);
  text-wrap: wrap;
  text-max-width: data(width);
  text-valign: center;
  shape: rectangle;
  padding: 8px;
  line-height: 1.2;
  border-style: solid;
  border-width: 1px;
}
:parent {
  shape: rectangle;
  padding: 10px;
  text-valign: top;
  text-halign: center;
  text-margin-y: -8px;
  text-wrap: none;
  background-color: $background;
}
edge {
  width: 1.75px;
  font-size: 10px;
  curve-style: taxi;
  line-color: #a5b4c8;
  label: data(label);
  color: #05080c;
  text-valign: bottom;
  text-wrap: wrap;
  font-family: Space Mono;
  text-background-opacity: 1;
  text-background-color: #fefefe;
  text-background-padding: 1px;
  text-background-shape: rectangle;
  text-margin-y: -11px;
  source-distance-from-node: 0px;
  target-distance-from-node: 0px;
  target-arrow-shape: triangle;
  target-arrow-color: #a5b4c8;
  source-arrow-color: #a5b4c8;
  arrow-scale: 1.444;
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
node.black {
  background-color: #05080c;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #05080c #303030;
  background-gradient-direction: to-right;
  color: #fefefe;
}
node.white {
  background-color: #e6e6e6;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #e6e6e6 #fefefe;
  background-gradient-direction: to-right;
  color: #05080c;
}
node.green {
  background-color: #1fac30;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #1fac30 #25f55c;
  background-gradient-direction: to-right;
  color: #05080c;
}
node.yellow {
  background-color: #e2fc43;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #e2fc43 #d0f955;
  background-gradient-direction: to-right;
  color: #05080c;
}
node.blue {
  background-color: #2b6cf0;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #2b6cf0 #52b6f6;
  background-gradient-direction: to-right;
  color: #05080c;
}
node.orange {
  background-color: #f2411a;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #f2411a #e98423;
  background-gradient-direction: to-right;
  color: #05080c;
}
node.purple {
  background-color: #ad1342;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #ad1342 #f81581;
  background-gradient-direction: to-right;
  color: #05080c;
}
node.red {
  background-color: #d01614;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #d01614 #e56b30;
  background-gradient-direction: to-right;
  color: #05080c;
}
node.gray {
  background-color: #a5b4c8;
  background-fill: linear-gradient;
  background-gradient-stop-colors: #a5b4c8 #c5d4e8;
  background-gradient-direction: to-right;
  color: #05080c;
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
