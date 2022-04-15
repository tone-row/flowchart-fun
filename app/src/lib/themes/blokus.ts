// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { Theme } from "./constants";

const textColor = "#FFFFFF";
const fontFamily = '"Space Mono", monospace';
const lineHeight = 1.4;
const backgroundColor = "#2A294D";
const darkerBackgroundColor = "#060608";
const fontSize = 9;
const padding = "6px";

const edgeWidth = 1.5;
const blokus: Theme = {
  value: "blokus",
  bg: backgroundColor,
  minHeight: 0,
  minWidth: 0,
  font: {
    fontFamily,
    // files: [{ url: "FiraMono-Regular.woff2", name: "Fira Mono" }],
    lineHeight,
    fontSize,
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
    /*
    background-image: linear-gradient(
  180deg,
  hsl(240deg 9% 9%) 0%,
  hsl(234deg 42% 18%) 50%,
  hsl(234deg 54% 28%) 100%


  hsl(240deg 9% 9%) hsl(234deg 42% 18%) hsl(234deg 54% 28%)
);
    */
    {
      selector: "node",
      style: {
        "font-family": fontFamily,
        "font-size": fontSize,
        label: "data(label)",
        color: textColor,
        "background-fill": "linear-gradient",
        "background-gradient-stop-colors": "#026F4A #019467 #03B181",
        "background-gradient-direction": "to-top-right",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        "line-height": lineHeight,
        "text-justification": "left",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        backgroundColor: darkerBackgroundColor,
        // "border-color": brightBlue,
        // "border-width": edgeWidth,
        // "border-opacity": 1,
        shape: "roundrectangle",
        "underlay-color": "#1d1d38",
        "underlay-opacity": 0.3,
        "underlay-padding": 5,
        "underlay-shape": "roundrectangle",
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        "curve-style": "unbundled-bezier",
        "font-size": fontSize,
        opacity: 1,
        width: edgeWidth,
        label: "data(label)",
        color: textColor,
        "arrow-scale": 1,
        "target-arrow-shape": "triangle",
        "target-arrow-fill": "filled",
        "target-arrow-color": "#EEFCFC",
        "target-distance-from-node": 5,
        "source-distance-from-node": 5,
        "text-background-shape": "roundrectangle",
        "text-background-color": backgroundColor,
        "text-background-opacity": 1,
        "text-background-padding": "4px",
        "text-rotation": "autorotate",
        "line-style": "solid",
        "line-fill": "linear-gradient",
        "line-gradient-stop-colors": `#F4F4F5 #EEFCFC`,
        "line-gradient-stop-positions": "0% 100%",
      },
    },
  ],
};

export default blokus;
