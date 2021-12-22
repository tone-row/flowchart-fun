import { Theme } from "./constants";

const fontFamily = "Gaegu";
const fontSize = 13;
const textMaxWidth = 80;
const backgroundColor = "#FFF14B";
const arrowColor = "#000000";
const lineHeight = 1;
const padding = "14px";
const borderWidth = 1.5;

const eggs: Theme = {
  value: "eggs",
  bg: backgroundColor,
  textMaxWidth,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize,
    lineHeight,
    files: [{ name: "Gaegu", url: "Gaegu-Regular.woff2" }],
  },
  styles: [
    {
      selector: "node",
      style: {
        "font-family": fontFamily,
        "font-size": fontSize,
        backgroundColor: "white",
        "border-color": arrowColor,
        color: arrowColor,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": `${textMaxWidth}px`,
        "text-valign": "center",
        // "border-width": borderWidth,
        shape: "ellipse",
        width: "data(width)",
        height: "data(width)",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "line-height": lineHeight,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "unbundled-bezier",
        "segment-distances": "60",
        "edge-distances": "intersection",
        width: borderWidth,
        "line-dash-pattern": [6, 3],
        "line-color": arrowColor,
        "line-style": "dashed",
        label: "data(label)",
        color: arrowColor,
        "font-size": fontSize,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 1,
        "text-background-color": "#FFF14B",
        "text-background-padding": "6px",
        "text-border-color": arrowColor,
        "text-border-width": borderWidth,
        "text-border-opacity": 1,
        "text-background-shape": "roundrectangle",
        "text-border-style": "solid",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "edge-text-rotation": "none",
      },
    },
  ],
};

export default eggs;
