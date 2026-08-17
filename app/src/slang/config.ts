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

/**
 * These are written to :root as --color-* custom properties at runtime by
 * components/ColorMode.tsx — that, not the baked values in slang.css, is what
 * actually paints the app. Keep the *Hsl entries in sync by hand: nothing
 * derives them from the hexes, and backgroundHsl had already drifted.
 * The neutral values here mirror the `neutral` ramp in lib/designTokens.js.
 */
export const colors = {
  background: "#FAFAFA",
  backgroundHsl: "0, 0%, 98%",
  foreground: "#18181B",
  foregroundHsl: "240, 6%, 10%",
  lineColor: "#F4F4F5",
  uiAccent: "#D4D4D8",
  nodeHover: "#F4F4F5",
  edgeHover: "#A1A1AA",
  lineNumbers: "#A1A1AA",
  buttonFocus: "#2267dd",
  highlightColor: palette.purple[0],
  overlayColor: "0, 50%, 0%",
  input: "#FFFFFF",
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
  foreground: "#FAFAFA",
  foregroundHsl: "0, 0%, 98%",
  edgeHover: "#52525B",
  lineColor: "#27272A",
  lineNumbers: "#71717A",
  nodeHover: "#27272A",
  uiAccent: "#3F3F46",
  buttonFocus: "#2267dd",
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
  // Keep in sync with --base-font-family in index.css (which overrides the
  // generated slang.css) and fontFamily.sans in lib/designTokens.js.
  baseFontFamily:
    'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
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
