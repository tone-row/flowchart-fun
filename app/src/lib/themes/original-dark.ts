// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Theme } from "./constants";

const fontFamily = "Porpora, sans-serif";
const fontSize = 10;
const backgroundColor = "#101010";
const color = "#fafaf3";
const arrowColor = color;
const lineHeight = 1.25;
const padding = "5px";

const borderWidth = 1.111;
const arrowWidth = borderWidth;
const originalDark: Theme = {
  value: "original-dark",
  bg: backgroundColor,
  minHeight: 4,
  minWidth: 4,
  font: {
    fontFamily,
    fontSize,
    lineHeight,
    files: [
      {
        name: fontFamily,
        url: "Porpora-Regular.woff2",
      },
    ],
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
        backgroundColor: backgroundColor,
        "border-color": arrowColor,
        color: color,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
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
        "font-size": fontSize,
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
  ],
};

export default originalDark;

export {};
