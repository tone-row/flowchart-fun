import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  red: "#f05935",
  orange: "#ecbb40",
  blue: "#425cde",
  black: "#352f39",
  white: "#fffdfd",
  green: "#5ba662",
  yellow: "#fffa96",
  gray: "#e3ded7",
  purple: "#6620e4  ",
};

const fontFamily = '"Gaegu"';
const backgroundColor = colors.yellow;
const arrowColor = colors.black;
const lineHeight = 1;
const padding = "14px";
const borderWidth = 1.5;

const eggs: Theme = {
  value: "eggs",
  bg: backgroundColor,
  fg: arrowColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: "Gaegu", url: "Gaegu-Regular.woff2" }],
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
        backgroundColor: colors.white,
        "border-color": arrowColor,
        color: arrowColor,
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "ellipse",
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
        "curve-style": "unbundled-bezier",
        "loop-direction": "10deg",
        "loop-sweep": "20deg",
        width: borderWidth,
        "line-color": arrowColor,
        label: "data(label)",
        color: arrowColor,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "target-arrow-color": arrowColor,
        "target-arrow-shape": "triangle",
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "text-background-padding": "3px",
        "text-background-shape": "roundrectangle",
        "text-border-style": "solid",
        // @ts-ignore
        "edge-text-rotation": "autorotate",
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
        color: ["purple", "blue", "red", "green", "black"].includes(color)
          ? colors.white
          : colors.black,
      },
    })),
  ],
};

export default eggs;
