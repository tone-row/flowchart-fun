// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Theme } from "./constants";

const fontFamily = "Poor Story";
const fontSize = 13;
const backgroundColor = "#664C4A";
const nodeBackgroundColor = backgroundColor;
const arrowColor = "#FCFAF1";
const nodeLabelColor = "#FFFFFF";
const arrowLabelColor = "#B5817E";
const lineHeight = 1;
const padding = "4px";
const arrowWidth = 2;
const edgeLabelBackgroundColor = backgroundColor;

const clay: Theme = {
  value: "clay",
  bg: backgroundColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "PoorStory-Regular.woff2" }],
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
        "font-size": fontSize,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "target-arrow-color": arrowColor,
        "target-arrow-shape": "triangle",
        "text-background-opacity": 1,
        "text-background-color": edgeLabelBackgroundColor,
        "text-background-padding": "3px",
        "text-border-opacity": 1,
        "text-background-shape": "roundrectangle",
        "text-rotation": "autorotate",
        "target-distance-from-node": "0px",
        "source-distance-from-node": "0px",
      },
    },
  ],
};

export default clay;
