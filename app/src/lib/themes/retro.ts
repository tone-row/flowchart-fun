import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#1D1D1B",
  white: "#F6F7F8",
  green: "#6BA07A",
  yellow: "#F0D356",
  blue: "#9DB9C4",
  orange: "#DB8962",
  purple: "#D95076",
  red: "#D7292B",
  gray: "#C5D4E8",
};

const fontFamily = "Josefin Sans";
const backgroundColor = "#F0DDB1";
const nodeBackgroundColor = colors.white;
const arrowColor = colors.black;
const nodeLabelColor = arrowColor;
const lineHeight = 1.2;
const padding = "8px";
const borderWidth = 3;
const borderColor = arrowColor;

const retro: Theme = {
  value: "retro",
  bg: backgroundColor,
  fg: nodeLabelColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "JosefinSans-Regular.woff2" }],
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
        backgroundColor: nodeBackgroundColor,
        "border-color": arrowColor,
        color: nodeLabelColor,
        "text-justification": "center",
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "roundrectangle",
        // @ts-ignore
        padding: padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": borderWidth,
        // @ts-ignore
        "border-color": borderColor,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "taxi",
        width: borderWidth * 1.25,
        "line-color": arrowColor,
        label: "data(label)",
        color: colors.white,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 1,
        "text-background-color": colors.black, // "#D09A5B",
        "text-background-padding": "6",
        "text-background-shape": "roundrectangle",
        // @ts-ignore
        "edge-text-rotation": "autorotate",
        "source-distance-from-node": 4,
        "target-distance-from-node": 0,
        "target-arrow-shape": "triangle",
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "arrow-scale": 0.6,
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
        ...(["red", "black"].includes(color) ? { color: colors.white } : {}),
      },
    })),
  ],
};

export default retro;
