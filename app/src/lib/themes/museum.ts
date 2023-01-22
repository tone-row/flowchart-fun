import { Stylesheet } from "cytoscape";

import { defaultFontSize, Theme } from "./constants";

const museumColors = {
  black: "#36321F",
  white: "#ffffff",
  green: "#01d857",
  yellow: "#ffcf0d",
  blue: "#6172F9",
  orange: "#ff7044",
  purple: "#a492ff",
  red: "#fa2323",
  gray: "#aaaaaa",
};

const fontFamily = "Sporting Grotesque";
const backgroundColor = museumColors.white;
const nodeBackgroundColor = backgroundColor;
const arrowColor = museumColors.black;
const nodeLabelColor = arrowColor;
const arrowLabelColor = arrowColor;
const lineHeight = 1.33;
const padding = "5px";
const arrowWidth = 1.5;
const borderWidth = arrowWidth * 2;
const distanceFromNode = 3;
const borderColor = arrowColor;
const underlayColor = borderColor;

const museum: Theme = {
  value: "museum",
  bg: backgroundColor,
  fg: nodeLabelColor,
  minWidth: 0,
  minHeight: 0,
  font: {
    fontFamily,
    fontSize: defaultFontSize,
    lineHeight,
    files: [{ name: fontFamily, url: "Sporting_Grotesque-Regular_web.woff2" }],
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
        backgroundColor: nodeBackgroundColor,
        "border-color": arrowColor,
        color: nodeLabelColor,
        "text-justification": "center",
        label: "data(label)",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        "text-valign": "center",
        shape: "roundrectangle",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        "line-height": lineHeight,
        "border-style": "solid",
        "border-width": borderWidth,
        // @ts-ignore
        "border-color": borderColor,
        // @ts-ignore
        "underlay-color": underlayColor,
        "underlay-padding": "4px",
        "underlay-opacity": 1,
        "underlay-shape": "ellipse",
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "bezier",
        // @ts-ignore
        "control-point-step-size": "60",
        width: arrowWidth,
        "line-color": arrowColor,
        label: "data(label)",
        color: arrowLabelColor,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": fontFamily,
        "text-background-opacity": 1,
        "text-background-color": backgroundColor,
        "text-background-padding": "2px",
        "text-border-opacity": 1,
        "text-background-shape": "rectangle",
        "edge-text-rotation": "autorotate",
        "source-distance-from-node": distanceFromNode,
        "target-distance-from-node": 5,
        "target-arrow-shape": "triangle",
        "target-arrow-color": arrowColor,
        "source-arrow-color": arrowColor,
        "arrow-scale": 0.75,
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
    ...Object.entries(museumColors).map<Stylesheet>(([color, value]) => ({
      selector: `node.${color}`,
      style: {
        "underlay-color": `${value}`,
        ...(color === "white" ? { "border-color": `${value}` } : {}),
      },
    })),
  ],
};

export default museum;
