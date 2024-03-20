import cytoscape from "cytoscape";
import type { Doc } from "./useDoc";
import type { Direction, FFTheme, LayoutDirection } from "shared";
import { fonts } from "./fonts";
import {
  childlessShapeClasses,
  createSmartChildlessBorderClasses,
  createSmartShapeClasses,
  edgeStyleClasses,
} from "./graphUtilityClasses";
import { theme as defaultTheme } from "./templates/default-template";

/**
 * Takes an FFTheme and returns cytoscape layout and style
 */
export function toTheme(theme: FFTheme) {
  const layout: cytoscape.LayoutOptions = {
    name: theme.layoutName,
  };

  /** Layout Name */
  // Handle Elk Layouts
  if (isElk(theme.layoutName)) {
    layout.name = "elk";
    // @ts-ignore
    layout.elk = {
      // Tree is actually called mr-tree
      algorithm: theme.layoutName,
    };
  } else if (theme.layoutName === "cose") {
    layout.name = "fcose";
  } else {
    layout.name = theme.layoutName;
  }

  if (layout.name === "dagre") {
    // @ts-ignore
    layout.rankDir = directionToDagreDirection(theme.direction);
  } else if (layout.name === "klay") {
    // @ts-ignore
    layout.klay = {
      direction: theme.direction,
    };
  } else if (theme.layoutName === "layered") {
    // @ts-ignore
    layout.elk["elk.direction"] = theme.direction;
  }

  // @ts-ignore
  layout.spacingFactor = theme.spacingFactor;

  if (theme.layoutName === "layered") {
    // @ts-ignore
    layout.elk["elk.layered.nodePlacement.bk.fixedAlignment"] = "BALANCED";
  }

  const width = theme.textMaxWidth + theme.padding * 2;

  const node = {
    shape: theme.shape,
    label: "data(label)",
    "text-valign": "center",
    "text-halign": "center",
    "text-wrap": "wrap",
    "text-max-width": theme.textMaxWidth + "px",
    width,
    height: "label",
    padding: theme.padding,
    "line-height": theme.lineHeight,
    "font-family": JSON.stringify(theme.fontFamily),
    backgroundColor: theme.nodeBackground,
    color: theme.nodeForeground,
    "border-width": theme.borderWidth,
    "border-color": theme.borderColor,
    textMarginY: theme.textMarginY,
    fontSize: 16,
  };

  if (theme.useFixedHeight) {
    // @ts-ignore
    node.height = theme.fixedHeight;
  }

  const edge = {
    "curve-style": theme.curveStyle,
    "source-arrow-shape": theme.sourceArrowShape,
    "target-arrow-shape": theme.targetArrowShape,
    "source-arrow-color": theme.edgeColor,
    "target-arrow-color": theme.edgeColor,
    "line-color": theme.edgeColor,
    "text-background-color": theme.background,
    "text-background-opacity": 1,
    "text-background-padding": theme.edgeWidth,
    color: theme.edgeColor,
    width: theme.edgeWidth,
    "font-size": theme.edgeTextSize * 16,
    label: "data(label)",
    lineHeight: theme.lineHeight,
    "font-family": JSON.stringify(theme.fontFamily),
    "source-distance-from-node": theme.sourceDistanceFromNode,
    "target-distance-from-node": theme.targetDistanceFromNode,
    "arrow-scale": theme.arrowScale,
    "text-rotation": theme.rotateEdgeLabel ? "autorotate" : "none",
  };

  const parent = {
    padding: 10,
    "border-style": "solid",
    "border-width": theme.edgeWidth,
    "border-color": theme.edgeColor,
    "background-color": theme.background,
    "text-valign": "top",
    "font-family": JSON.stringify(theme.fontFamily),
    label: "data(label)",
    color: theme.nodeForeground,
    "font-size": 24,
    "text-margin-y": -5,
  };

  // taxi-direction
  if (theme.curveStyle === "taxi") {
    if (isHierarchical(theme.layoutName)) {
      if (theme.layoutName === "mrtree") {
        // @ts-ignore
        edge["taxi-direction"] = "downward";
      } else if (theme.direction === "RIGHT" || theme.direction === "LEFT") {
        // @ts-ignore
        edge["taxi-direction"] = "horizontal";
      } else {
        // @ts-ignore
        edge["taxi-direction"] = "vertical";
      }
    }
  }

  const elementStyles: cytoscape.StylesheetCSS[] = [
    {
      selector: ":childless",
      css: node as any,
    },
    {
      selector: "edge",
      css: edge as any,
    },
    {
      selector: ":parent",
      css: parent as any,
    },
    {
      selector: ":active",
      css: {
        "overlay-color": "#000000",
        "overlay-opacity": 0,
      },
    },
    {
      selector: ":selected",
      css: {
        opacity: 0.5,
      },
    },
    {
      selector: "core",
      // @ts-ignore
      css: {
        "selection-box-color": theme.edgeColor,
        "selection-box-opacity": 0.25,
        "selection-box-border-width": 0,
        "active-bg-opacity": 0,
      },
    },
    ...edgeStyleClasses,
    ...childlessShapeClasses,
    ...createSmartChildlessBorderClasses(theme.borderWidth || theme.edgeWidth),
    ...createSmartShapeClasses(width),
  ];

  const variables = [
    `$width: ${width}px;\n${
      theme.fixedHeight ? "$height: " + theme.fixedHeight + "px;\n" : ""
    }`,
    `$background: ${theme.background};`,
  ].join("\n");

  const style = [variables, styleToString(elementStyles)];

  // Add font style
  let knownFont = fonts.find((f) => f.name === theme.fontFamily);
  if (knownFont) {
    style.unshift(knownFont.importSnippet);
  }

  return {
    layout,
    style: style.join("\n"),
  };
}

export function getThemeEditor(doc: Doc) {
  return (doc.meta?.themeEditor as FFTheme) || defaultTheme;
}

function isHierarchical(layoutName: string) {
  return ["dagre", "klay", "layered", "mrtree"].includes(layoutName);
}

function isElk(layoutName: string) {
  return ["layered", "mrtree", "stress", "radial"].includes(layoutName);
}

function directionToDagreDirection(dir: Direction): LayoutDirection {
  switch (dir) {
    case "RIGHT":
      return "LR";
    case "LEFT":
      return "RL";
    case "DOWN":
      return "TB";
    case "UP":
      return "BT";
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// https://github.com/gion/is-dark-color/blob/master/src/isDarkColor.js
function _isDarkColor(
  hexColor: string,
  options?: { override?: { [key: string]: boolean } }
) {
  if (options && options.override) {
    const overridedColor = Object.keys(options.override).find(
      (k) => k.toLowerCase() === hexColor.toLowerCase()
    );
    if (overridedColor !== undefined) {
      return options.override[overridedColor];
    }
  }

  const { r, g, b } = hexToRgb(hexColor);

  let colorArray = [r / 255, g / 255, b / 255].map((v) => {
    if (v <= 0.03928) {
      return v / 12.92;
    }

    return Math.pow((v + 0.055) / 1.055, 2.4);
  });

  const luminance =
    0.2126 * colorArray[0] + 0.7152 * colorArray[1] + 0.0722 * colorArray[2];

  return luminance <= 0.179;
}

/**
 * Converts an array of cytoscape styleshseets to a string
 */
export function styleToString(style: cytoscape.StylesheetCSS[]) {
  return style
    .map((s) => {
      return `${s.selector} { ${Object.entries(s.css)
        .map(([key, value]) => {
          return `${camelToKebab(key)}: ${value};`;
        })
        .join(" ")} }`;
    })
    .join("\n");
}

/**
 * Converts Camel Case to Kebab Case
 */
function camelToKebab(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}
