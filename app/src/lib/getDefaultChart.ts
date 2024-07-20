import { getDefaultText } from "./getDefaultText";
import { getExpirationDate } from "./getExpirationDate";

const defaultMeta = {
  themeEditor: {
    layoutName: "dagre",
    direction: "RIGHT",
    spacingFactor: 1.35,
    background: "#ffffff",
    fontFamily: "IBM Plex Sans",
    shape: "roundrectangle",
    nodeBackground: "#e6e6e6",
    nodeForeground: "#000000",
    padding: 16,
    borderWidth: 0,
    borderColor: "#000000",
    textMaxWidth: 146,
    lineHeight: 1.3,
    textMarginY: 0,
    useFixedHeight: false,
    fixedHeight: 50,
    curveStyle: "bezier",
    edgeWidth: 2,
    edgeColor: "#606ef6",
    sourceArrowShape: "none",
    targetArrowShape: "triangle",
    sourceDistanceFromNode: 0,
    targetDistanceFromNode: 0,
    arrowScale: 1,
    edgeTextSize: 0.875,
    rotateEdgeLabel: true,
  },
  cytoscapeStyle:
    "$color: #000000;\n$red: #e63946;\n$orange: #f4a261;\n$yellow: #f1fa3b;\n$green: #2a9d8f;\n$blue: #606ef6;\n$purple: #6d4a7c;\n$grey: #f2eded;\n\n/** Start - uncomment to use\n:childless[in_degree < 1][out_degree > 0] {\n  border-width: 0;\n  shape: roundrectangle;\n  background-color: $green;\n  color: white;\n}\n*/\n\n/** Terminal - uncomment to use\n:childless[out_degree < 1][in_degree > 0] {\n  border-width: 0;\n  shape: roundrectangle;\n  background-color: $red;\n  color: white;\n}\n*/\n\n/** Branching - uncomment to use\n:childless[in_degree > 0][in_degree < 2][out_degree > 1] {\n  shape: diamond;\n  background-color: $blue;\n  color: white;\n  height: $width;\n  border-width: 0;\n  text-margin-y: 2;\n}\n*/\n\n/** Merging **/\n:childless[in_degree > 1][out_degree > 0][out_degree < 2] {\n}\n\n:childless.color_red {\n  background-color: $red;\n  color: white;\n}\n:childless.color_orange {\n  background-color: $orange;\n  color: white;\n}\n:childless.color_yellow {\n  background-color: $yellow;\n}\n:childless.color_green {\n  background-color: $green;\n  color: white;\n}\n:childless.color_blue {\n  background-color: $blue;\n  color: white;\n}\n:childless.color_purple {\n  background-color: $purple;\n  color: white;\n}\n:childless.color_grey {\n  background-color: $grey;\n}\n\n:parent.color_white {\n  background-color: white;\n}\n:parent.color_grey {\n  background-color: $grey;\n}",
};

// TODO: Should be shared with the back-end through a shared package
function getMetaBase() {
  return `\n=====\n${JSON.stringify(defaultMeta, null, 2)}\n=====`;
}

export function getDefaultChart() {
  return `${getDefaultText()}\n${getMetaBase()}`;
}

/**
 * Returns a chart where the meta has an expiry date in it
 */
export function getDefaultLocalChart() {
  const meta = {
    ...defaultMeta,
    expires: getExpirationDate(),
  };
  // No text, only layout
  return `\n=====\n${JSON.stringify(meta, null, 2)}\n=====`;
}
