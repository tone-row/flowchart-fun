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
const padding = "12px";
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
        width: "label",
        height: "label",
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
