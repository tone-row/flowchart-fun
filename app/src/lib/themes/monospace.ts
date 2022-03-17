import { Theme } from "./constants";

const textBlue = "#abb2ff";
const brightBlue = "#818bff";
const darkBlue = "#626ffe";
const fontFamily = '"Fira Mono", monospace';
const lineHeight = 1.4;
const backgroundColor = "#141418";
const darkerBackgroundColor = "#060608";
const textMaxWidth = 128;
const fontSize = 10;
const padding = "10px";

const edgeWidth = 1;
const monospace: Theme = {
  value: "monospace",
  bg: backgroundColor,
  minHeight: 0,
  minWidth: 0,
  textMaxWidth,
  font: {
    fontFamily,
    files: [{ url: "FiraMono-Regular.woff2", name: "Fira Mono" }],
    lineHeight,
    fontSize,
  },
  styles: [
    {
      selector: "node",
      style: {
        "font-family": fontFamily,
        "font-size": fontSize,
        label: "data(label)",
        color: textBlue,
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        "line-height": lineHeight,
        "text-justification": "left",
        width: "data(width)",
        height: "data(height)",
        "padding-left": padding,
        "padding-right": padding,
        "padding-top": padding,
        "padding-bottom": padding,
        backgroundColor: darkerBackgroundColor,
        "border-color": brightBlue,
        "border-width": edgeWidth,
        "border-opacity": 1,
        shape: "roundrectangle",
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        "curve-style": "segments",
        "font-size": fontSize,
        opacity: 1,
        width: edgeWidth,
        label: "data(label)",
        color: textBlue,
        "target-arrow-shape": "triangle",
        "target-arrow-fill": "filled",
        "target-arrow-color": darkBlue,
        "target-distance-from-node": 10,
        "arrow-scale": 1.25,
        "source-distance-from-node": 10,
        "text-background-shape": "roundrectangle",
        "text-background-color": backgroundColor,
        "text-background-opacity": 1,
        "text-background-padding": "4px",
        "line-style": "solid",
        "line-fill": "linear-gradient",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        "line-gradient-stop-colors": `${brightBlue} ${darkBlue}`,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        "line-gradient-stop-positions": "0% 100%",
      },
    },
  ],
};

export default monospace;
