import { defaultFontFamily, Theme } from "./constants";

const fontFamily = defaultFontFamily;
const fontSize = 10;
const backgroundColor = "#ffffff";
const arrowColor = "#000000";
const lineHeight = 1.25;
const padding = "11px";

const original: Theme = {
  value: "original",
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
        "border-width": 1,
        shape: "roundrectangle",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
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
      },
    },
  ],
};

export default original;
