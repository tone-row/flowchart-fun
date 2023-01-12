// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Theme } from "./constants";

const excalidrawColors = {
  red: "#F84A4B",
  orange: "#FC7427",
  blue: "#4363ED",
  black: "#000000",
  white: "#ffffff",
  green: "#3BB755",
  yellow: "#f9dc46",
  gray: "#C7CED4",
  purple: "#6D47EA",
};

const fontFamily = '"Virgil"';
const fontSize = 10;
const backgroundColor = excalidrawColors.white;
const arrowColor = excalidrawColors.gray;
const lineHeight = 1.3;
const padding = "2px";

const excalidraw: Theme = {
  font: {
    fontFamily,
    fontSize,
    files: [{ url: "Virgil.woff2", name: "Virgil" }],
    lineHeight: lineHeight,
  },
  value: "excalidraw",
  bg: backgroundColor,
  fg: excalidrawColors.black,
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
        color: excalidrawColors.black,
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
        "line-style": "solid",
        label: "data(label)",
        color: excalidrawColors.black,
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
    {
      selector: ":parent",
      style: {
        "text-valign": "top",
        "text-halign": "center",
        "text-margin-y": `-${padding}`,
        "text-wrap": "none",
      },
    },
    ...Object.entries(excalidrawColors).map<Stylesheet>(([color, value]) => ({
      selector: `.${color}`,
      style: {
        "background-color": `${value}`,
        "background-opacity": 1,
        color: ["purple", "blue", "red", "green", "black", "orange"].includes(
          color
        )
          ? excalidrawColors.white
          : excalidrawColors.black,
      },
    })),
  ],
};

export default excalidraw;
