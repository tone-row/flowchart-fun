// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Theme } from "./constants";

const fontFamily = '"Virgil"';
const fontSize = 10;
const backgroundColor = "#ffffff";
const arrowColor = "#cccccc";
const lineHeight = 1.3;
const padding = "0px";

const excalidraw: Theme = {
  font: {
    fontFamily,
    fontSize,
    files: [{ url: "Virgil.woff2", name: "Virgil" }],
    lineHeight: lineHeight,
  },
  value: "excalidraw",
  bg: backgroundColor,
  safeBg: backgroundColor,
  minWidth: 0,
  minHeight: 0,
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
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        color: "#000000",
        "font-size": fontSize,
        shape: "rectangle",
        backgroundColor: backgroundColor,
        "background-opacity": 0,
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
        "curve-style": "bezier",
        "segment-distances": "60",
        "edge-distances": "intersection",
        width: 1.3,
        "line-color": arrowColor,
        "line-style": "dashed",
        label: "data(label)",
        color: "#000000",
        "font-size": fontSize,
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "source-distance-from-node": 4,
        "target-distance-from-node": 4,
        "text-rotation": "-15deg",
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": arrowColor,
        "arrow-scale": 1,
      },
    },
  ],
};

export default excalidraw;
