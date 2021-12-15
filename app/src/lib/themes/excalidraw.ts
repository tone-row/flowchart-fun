import { Theme } from "./constants";

const excalidraw: Theme = {
  font: {
    fontFamily: "Virgil",
    filename: "Virgil.woff2",
  },
  value: "excalidraw",
  bg: "#ffffff",
  minWidth: 0,
  minHeight: 0,
  styles: [
    {
      selector: "node",
      style: {
        "font-family": "Virgil",
        label: "data(label)",
        "text-valign": "center",
        "text-halign": "center",
        "text-wrap": "wrap",
        "text-max-width": "80",
        "font-size": 10,
        shape: "ellipse",
        width: "data(width)", // width and height need to be taken from current font
        height: "data(height)",
        backgroundColor: "#ffffff",
        "background-opacity": 0,
      },
    },
    {
      selector: "edge",
      style: {
        "curve-style": "unbundled-bezier",
        "segment-distances": "60",
        "edge-distances": "intersection",
        width: 1,
        "line-color": "#cccccc",
        "line-style": "solid",
        label: "data(label)",
        color: "#000000",
        "font-size": 8,
        "text-wrap": "wrap",
        "font-family": "Virgil",
        "text-margin-y": -5,
        "text-margin-x": 5,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        "text-rotation": "autorotate",
        "target-arrow-shape": "triangle-backcurve",
        "target-arrow-color": "#cccccc",
      },
    },
  ],
};

export default excalidraw;
