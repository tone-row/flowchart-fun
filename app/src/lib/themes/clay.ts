import { StylesheetStyle } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const colors = {
  black: "#28152e",
  white: "#FFFFFF",
  green: "#abb17c",
  yellow: "#eec752",
  blue: "#81b4c0",
  orange: "#edae4e",
  purple: "#7256f0",
  red: "#B5817E",
  gray: "#664C4A",
};

const fontFamily = "Poor Story";
const backgroundColor = colors.gray;
const nodeBackgroundColor = backgroundColor;
const arrowColor = "#FCFAF1";
const nodeLabelColor = colors.white;
const arrowLabelColor = colors.red;
const lineHeight = 1;
const padding = "6px";
const arrowWidth = 2;
const edgeLabelBackgroundColor = backgroundColor;

const clay: Theme = {
  value: "clay",
  bg: backgroundColor,
  fg: nodeLabelColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "PoorStory-Regular.woff2" }],
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
        "control-point-distances": "-20",
        width: arrowWidth,
        "line-color": arrowColor,
        label: "data(label)",
        color: arrowLabelColor,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "target-arrow-shape": "triangle",
        "text-background-opacity": 1,
        "text-background-color": edgeLabelBackgroundColor,
        "text-background-padding": "3px",
        "text-border-opacity": 1,
        "text-background-shape": "roundrectangle",
        "text-rotation": "autorotate",
        // @ts-ignore
        "target-distance-from-node": "0px",
        // @ts-ignore
        "source-distance-from-node": "0px",
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
        color: ["yellow", "white", "green", "orange"].includes(color)
          ? colors.black
          : colors.white,
      },
    })),
  ],
};

export default clay;
