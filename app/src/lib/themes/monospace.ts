import { Theme } from "./constants";

const brightColor = "#818bff";
const darker = "#626ffe";
const fontFamily = '"Fira Mono", monospace';
const lineHeight = 1.5;
const backgroundColor = "#141418";

const monospace: Theme = {
  bg: backgroundColor,
  value: "monospace",
  minHeight: 1,
  minWidth: 6,
  font: {
    fontFamily,
    filename: "FiraMono-Regular.ttf",
    lineHeight,
  },
  styles: [
    {
      selector: "node",
      style: {
        "font-family": fontFamily,
        "font-size": "10px",
        label: "data(label)",
        color: "black",
        "text-valign": "center",
        width: "data(width)",
        height: "data(height)",
        "text-halign": "center",
        padding: "5px",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "background-opacity": "1",
        backgroundColor: brightColor,
        "border-color": darker,
        "border-width": "2px",
        "border-opacity": 1,
        "line-height": lineHeight,
        "text-wrap": "wrap",
        "text-max-width": "data(width)",
        shape: "roundrectangle",
        "text-justification": "left",
      },
    },
    {
      selector: "edge",
      style: {
        "font-family": fontFamily,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "curve-style": "segments",
        "font-size": "10px",
        opacity: 1,
        width: "2px",
        label: "data(label)",
        color: brightColor,
        "target-arrow-shape": "triangle",
        "target-arrow-fill": "filled",
        "target-arrow-color": darker,
        "target-distance-from-node": 10,
        "arrow-scale": 1.5,
        "source-distance-from-node": 10,
        "text-background-shape": "roundrectangle",
        "text-background-color": backgroundColor,
        "text-background-opacity": 1,
        "text-background-padding": "4px",
        "line-style": "solid",
        "line-fill": "linear-gradient",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "line-gradient-stop-colors": `${brightColor} ${darker}`,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "line-gradient-stop-positions": "0% 100%",
      },
    },
  ],
};

export default monospace;
