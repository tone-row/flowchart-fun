import { SlangConfig } from "@tone-row/slang";

export const palette = {
  white: [
    "#ffffff",
    "#d4d4d3",
    "#f0f0f0",
    "#aaaaaa",
    "#757575",
    "#fafafa",
    "#ededec",
  ],
  black: ["#000000", "#202020", "#464646", "#3f3f3f"],
  purple: ["#5c6fff", "#929bff", "#D3CCF3", "#EFF0FF", "#001EFF", "#4a5de8"],
  green: ["#01d857", "#84ff82", "#00c722"],
  blue: ["#3947ff"],
  yellow: ["#ffcf0d", "#ffcf0d8c", "#FFE590"],
  orange: ["#ff7044", "#ffa500"],
};

export const colors = {
  background: palette.white[0],
  backgroundHsl: "0, 0%, 100%",
  foreground: palette.black[1],
  foregroundHsl: "0, 0%, 13%",
  lineColor: palette.white[6],
  uiAccent: palette.white[1],
  nodeHover: palette.white[2],
  edgeHover: palette.white[3],
  lineNumbers: palette.white[4],
  buttonFocus: palette.purple[0],
  highlightColor: palette.purple[0],
  overlayColor: "0, 50%, 0%",
  input: palette.white[5],
  brandHsl: "233, 100%, 68%",
  darkHighlight: palette.purple[4],
  headerBtnHover: palette.purple[3],
  greenHsl: "102, 99%, 43%",
  darkGrey: palette.black[2],
  yellowHsl: "46, 100%, 78%",
};

export const darkTheme: typeof colors = {
  background: "#0f0f0f",
  backgroundHsl: "0, 0%, 6%",
  foreground: "rgb(250, 250, 250)",
  foregroundHsl: "0, 0%, 100%",
  edgeHover: palette.black[2],
  lineColor: "#2e2e2e",
  lineNumbers: "#737373",
  nodeHover: "#2e2e2e",
  uiAccent: palette.black[3],
  buttonFocus: palette.purple[0],
  highlightColor: palette.purple[0],
  overlayColor: "0, 50%, 100%",
  input: palette.black[1],
  brandHsl: "233, 100%, 68%",
  darkHighlight: palette.purple[2],
  headerBtnHover: palette.purple[3],
  greenHsl: "102, 99%, 43%",
  darkGrey: palette.white[1],
  yellowHsl: "46, 100%, 78%",
};

const config: Partial<SlangConfig> = {
  baseFontFamily: "IBM Plex Sans, sans-serif",
  baseFontSizePx: 16,
  typeScaleBase: 1.2,
  baseFontLineHeight: 1.5,
  baseFontLineHeightMobile: 1.4,
  inverseTypeScaleLineHeight: 0.95,
  breakpoints: {
    small: 450,
    tablet: 800,
    desktop: 1024,
  },
  palette,
  colors,
};

export default config;
