import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#101010",
  white: "#fafaf3",
  green: "#01d857",
  yellow: "#ffcf0d",
  blue: "#6172F9",
  orange: "#ff7044",
  purple: "#a492ff",
  red: "#fa2323",
  gray: "#aaaaaa",
};

const fontFamily = "Porpora";
const backgroundColor = colors.black;
const color = colors.white;
const arrowColor = color;
const lineHeight = 1.25;
const padding = "12px";

const borderWidth = 1.111;
const arrowWidth = borderWidth;
const originalDark: Theme = {
  value: "original-dark",
  bg: backgroundColor,
  fg: color,
  minHeight: 4,
  minWidth: 4,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [
      {
        name: fontFamily,
        url: "Porpora-Regular.woff2",
      },
    ],
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
        backgroundColor: backgroundColor,
        "border-color": arrowColor,
        color: color,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        width: "label",
        height: "label",
        "text-valign": "center",
        "text-halign": "center",
        "border-width": borderWidth,
        shape: "rectangle",
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
        "font-family": fontFamily,
        "loop-direction": "0deg",
        "loop-sweep": "20deg",
        width: arrowWidth,
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "text-background-shape": "rectangle",
        "text-background-padding": "4px",
        "line-color": arrowColor,
        color: arrowColor,
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        label: "data(label)",
        "text-valign": "center",
        "arrow-scale": 1,
        "text-wrap": "wrap",
        "text-halign": "center",
        "text-rotation": "autorotate",
        "target-distance-from-node": 2,
        "source-distance-from-node": 2,
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
        "border-color": `${value}`,
        color: ["blue", "black"].includes(color) ? colors.white : colors.black,
      },
    })),
  ],
};

export default originalDark;

export {};
