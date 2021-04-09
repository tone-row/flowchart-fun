import { SlangConfig } from "@tone-row/slang";

const palette: SlangConfig["palette"] = {
  white: ["#ffffff", "#ededec", "#f0f0f0", "#aaaaaa", "##757575"],
  black: ["#000000"],
  purple: ["#5c6fff", "#929bff", "#D3CCF3"],
  green: ["#01d857", "#84ff82", "#00c722"],
  blue: ["#3947ff"],
  yellow: ["#ffcf0d", "#ffcf0d8c"],
  orange: ["#ff7044", "#ffa500"],
};

export const colors = {
  background: palette.white[0],
  foreground: palette.black[0],
  lineColor: palette.black[0],
  uiAccent: palette.white[2],
  nodeHover: palette.white[2],
  edgeHover: palette.white[3],
  lineNumbers: palette.white[4],
  buttonFocus: palette.purple[0],
  highlightColor: palette.purple[0],
};

export const darkTheme: typeof colors = {
  background: "#0f0f0f",
  foreground: "rgb(250, 250, 250)",
  edgeHover: "#2e2e2e",
  lineColor: "yellow",
  lineNumbers: "#737373",
  nodeHover: "#2e2e2e",
  uiAccent: "#2e2e2e",
  buttonFocus: palette.purple[0],
  highlightColor: palette.purple[0],
};

const config: Partial<SlangConfig> = {
  baseFontFamily:
    "nm, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  baseFontSizePx: 20,
  breakpoints: {
    small: 450,
    tablet: 800,
    desktop: 1024,
  },
  palette,
  colors,
};

export default config;
