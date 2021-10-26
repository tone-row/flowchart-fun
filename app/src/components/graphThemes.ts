import { t } from "@lingui/macro";
import { Stylesheet } from "cytoscape";

export type GraphThemes = "original" | "original-dark" | "eggs";
export const allGraphThemes: GraphThemes[] = [
  "original",
  "original-dark",
  "eggs",
];
export const themes: {
  label: () => string;
  value: GraphThemes;
}[] = [
  { label: () => t`Light`, value: "original" },
  { label: () => t`Dark`, value: "original-dark" },
  { label: () => t`Eggs`, value: "eggs" },
];
export const defaultGraphTheme: GraphThemes = "original";

export const graphThemes: Record<
  GraphThemes,
  { bg: string; minWidth?: number; minHeight?: number; styles: Stylesheet[] }
> = {
  original: {
    bg: "#ffffff",
    styles: [
      {
        selector: "node",
        style: {
          backgroundColor: "#ffffff",
          "border-color": "#000000",
          color: "#000000",
          label: "data(label)",
          "font-size": 10,
          "text-wrap": "wrap",
          "text-max-width": "80",
          "text-valign": "center",
          "text-halign": "center",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          "line-height": 1.25,
          "border-width": 1,
          shape: "rectangle",
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
          width: "data(width)",
          height: "data(height)",
          "transition-duration": 0,
        },
      },
      {
        selector: "edge",
        style: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          "loop-direction": "0deg",
          "loop-sweep": "20deg",
          width: 1,
          "text-background-opacity": 1,
          "text-background-color": "#ffffff",
          "line-color": "#000000",
          "target-arrow-color": "#000000",
          "target-arrow-shape": "vee",
          "arrow-scale": 1,
          "curve-style": "bezier",
          label: "data(label)",
          color: "#000000",
          "font-size": 10,
          "text-valign": "center",
          "text-wrap": "wrap",
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
          "text-halign": "center",
          "edge-text-rotation": "autorotate",
        },
      },
      {
        selector: ".edgeHovered",
        style: {
          "line-color": "#aaaaaa",
          "target-arrow-color": "#aaaaaa",
          color: "#aaaaaa",
        },
      },
      {
        selector: ".nodeHovered",
        style: {
          backgroundColor: "#f0f0f0",
        },
      },
    ],
  },
  "original-dark": {
    bg: "#0f0f0f",
    styles: [
      {
        selector: "node",
        style: {
          backgroundColor: "#0f0f0f",
          "border-color": "#ffffff",
          color: "#ffffff",
          label: "data(label)",
          "font-size": 10,
          "text-wrap": "wrap",
          "text-max-width": "80",
          "text-valign": "center",
          "text-halign": "center",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          "line-height": 1.25,
          "border-width": 1,
          shape: "rectangle",
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
          width: "data(width)",
          height: "data(height)",
        },
      },
      {
        selector: "edge",
        style: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          "loop-direction": "0deg",
          "loop-sweep": "20deg",
          width: 1,
          "text-background-opacity": 1,
          "text-background-color": "#0f0f0f",
          "line-color": "#ffffff",
          "target-arrow-color": "#ffffff",
          "target-arrow-shape": "vee",
          "arrow-scale": 1,
          "curve-style": "bezier",
          label: "data(label)",
          color: "#ffffff",
          "font-size": 10,
          "text-valign": "center",
          "text-wrap": "wrap",
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
          "text-halign": "center",
          "edge-text-rotation": "autorotate",
        },
      },
      {
        selector: ".edgeHovered",
        style: {
          "line-color": "#464646",
          "target-arrow-color": "#464646",
          color: "#464646",
        },
      },
      {
        selector: ".nodeHovered",
        style: {
          backgroundColor: "#2e2e2e",
        },
      },
    ],
  },
  eggs: {
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
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
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
          "font-family":
            "-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          "edge-text-rotation": "none",
          "text-background-opacity": 1,
          "text-background-color": "#FFF14B",
          "text-background-padding": "3px",
        },
      },
    ],
  },
};
