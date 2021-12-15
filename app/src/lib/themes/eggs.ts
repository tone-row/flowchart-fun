import { defaultFontFamily, Theme } from "./constants";

const eggs: Theme = {
  value: "eggs",
  bg: "#FFF14B",
  minWidth: 0,
  minHeight: 0,
  styles: [
    {
      selector: "node",
      style: {
        "border-color": "#000000",
        "text-border-width": 10,
        color: "#000000",
        backgroundColor: "white",
        label: "data(label)",
        "font-size": 10,
        "text-wrap": "wrap",
        "text-max-width": "80",
        "text-valign": "center",
        "border-width": 0.5,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "line-height": 1.25,
        shape: "ellipse",
        "font-family": defaultFontFamily,
        width: "data(width)",
        height: "data(height)",
        "padding-left": "10px",
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "unbundled-bezier",
        "segment-distances": "60",
        "edge-distances": "intersection",
        width: 0.5,
        "line-dash-pattern": [3, 1],
        "line-color": "#000000",
        "line-style": "dashed",
        label: "data(label)",
        color: "#000000",
        "font-size": 10,
        "text-valign": "bottom",
        "text-wrap": "wrap",
        "font-family": defaultFontFamily,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "edge-text-rotation": "none",
        "text-background-opacity": 1,
        "text-background-color": "#FFF14B",
        "text-background-padding": "3px",
      },
    },
  ],
};

export default eggs;
