import { defaultFontFamily, Theme } from "./constants";

const fontFamily = defaultFontFamily;
const fontSize = 10;
const backgroundColor = "#0f0f0f";
const arrowColor = "#ffffff";
const lineHeight = 1.25;
const padding = "11px";

const originalDark: Theme = {
  value: "original-dark",
  bg: backgroundColor,
  minHeight: 4,
  minWidth: 4,
  font: {
    fontFamily,
    fontSize,
    lineHeight,
  },
  styles: [
    {
      selector: "node[label!='']",
      style: {
        width: "data(width)",
        height: "data(height)",
      },
    },
    {
      selector: "node",
      style: {
        "font-family": fontFamily,
        "font-size": fontSize,
        backgroundColor: backgroundColor,
        "border-color": arrowColor,
        color: arrowColor,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        "text-halign": "center",
        "border-width": 1,
        shape: "rectangle",
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "loop-direction": "0deg",
        "loop-sweep": "20deg",
        width: 1,
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "line-color": arrowColor,
        "target-arrow-color": arrowColor,
        "target-arrow-shape": "triangle",
        "arrow-scale": 1,
        "curve-style": "bezier",
        label: "data(label)",
        color: arrowColor,
        "font-size": 10,
        "text-valign": "center",
        "text-wrap": "wrap",
        "font-family": defaultFontFamily,
        "text-halign": "center",
        "edge-text-rotation": "autorotate",
      },
    },
  ],
};

export default originalDark;

export {};
