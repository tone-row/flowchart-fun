// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { defaultFontFamily, Theme } from "./constants";

export const originalColors = {
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

const fontFamily = defaultFontFamily;
const fontSize = 10;
const backgroundColor = originalColors.white;
const arrowColor = originalColors.black;
const lineHeight = 1.25;
const padding = "6px";

const arrowWidth = 1;
const original: Theme = {
  value: "original",
  bg: backgroundColor,
  font: {
    fontFamily,
    fontSize,
    lineHeight,
  },
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
        "font-size": fontSize,
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
        "target-arrow-shape": "triangle",
        "arrow-scale": 1,
        "curve-style": "bezier",
        label: "data(label)",
        color: arrowColor,
        fontSize,
        "text-valign": "center",
        "text-wrap": "wrap",
        fontFamily,
        "text-halign": "center",
        "edge-text-rotation": "autorotate",
        "target-distance-from-node": 1,
        "source-distance-from-node": 0,
      },
    },
    ...Object.entries(originalColors).map<Stylesheet>(([color, value]) => ({
      selector: `node.${color}`,
      style: {
        "background-color": `${value}`,
        "background-opacity": 1,
        "border-color": color === "white" ? `${value}` : originalColors.black,
        color: ["blue", "black"].includes(color)
          ? originalColors.white
          : originalColors.black,
      },
    })),
  ],
};

export default original;
