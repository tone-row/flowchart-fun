/**
 * Single source of truth for the design tokens.
 *
 * `tailwind.config.js` requires this file, and the design system page at `/d`
 * imports it, so the page always renders the values Tailwind is actually
 * emitting rather than a hand-copied list that rots.
 *
 * Plain CommonJS on purpose: tailwind.config.js is CJS and runs outside the
 * TypeScript program. See designTokens.d.ts for the types the app sees.
 */

/**
 * A true-neutral gray ramp. The pre-2026 ramp was warm/mauve — every stop had
 * red as the dominant channel (#fcf8fb, #f3eef0, #362e2e), which is what made
 * neutral surfaces read pink and the whole app read dated.
 * Bonus: neutral-500 on white is now 4.68:1 (WCAG AA) instead of 3.9:1.
 */
const neutral = {
  50: "#FAFAFA",
  100: "#F4F4F5",
  200: "#E4E4E7",
  300: "#D4D4D8",
  400: "#A1A1AA",
  500: "#71717A",
  600: "#52525B",
  700: "#3F3F46",
  800: "#27272A",
  900: "#18181B",
};

/** Page background. Deliberately off-white, not pure white: several pages
 * render `bg-white` cards on it and a white page would erase them. */
const background = "#FAFAFA";
const foreground = neutral[900];

/** The Pro / pricing identity. Not touched by the 2026 visual pass. */
const purple = {
  50: "#ebe9f4",
  100: "#e3dff3",
  200: "#d3ccf3",
  300: "#baabf2",
  400: "#9e81ef",
  500: "#8252eb",
  600: "#742de1",
  700: "#6518ce",
  800: "#5312ab",
  900: "#44108a",
};

/** Primary accent. Left as-is in the 2026 pass — the difference against
 * Tailwind's blue is imperceptible and it reaches the frozen pricing page. */
const blue = {
  DEFAULT: "#3f84e5",
  50: "#eff6ff",
  100: "#daeafd",
  200: "#bedafa",
  300: "#93c4f6",
  400: "#63a5ee",
  500: "#3f84e5",
  600: "#2267dd",
  700: "#1352cf",
  800: "#1643ab",
  900: "#183b8a",
};

const orange = {
  50: "#fefbf0",
  100: "#fef3cc",
  200: "#ffe590",
  300: "#fed257",
  400: "#fdbe36",
  500: "#f59e29",
  600: "#d87723",
  700: "#b3541e",
  800: "#90411c",
  900: "#76361a",
};

/** Rewritten Feb 2026. Not touched. */
const green = {
  DEFAULT: "#a2ce8a",
  50: "#f3fcf1",
  100: "#e6fae2",
  200: "#d3f1cb",
  300: "#b9e4aa",
  400: "#a2ce8a",
  500: "#88b664",
  600: "#6c9847",
  700: "#517832",
  800: "#3d6025",
  900: "#2e501b",
};

const zinc = {
  50: "#fff4f7",
  100: "#eff0ff",
  200: "#dfe0f1",
  300: "#cfd0e2",
  400: "#9c9db3",
  500: "#6c6e82",
  600: "#4d4f63",
  700: "#3b3c4e",
  800: "#232431",
  900: "#151521",
};

/** The colour of the global focus-visible ring. Kept in one place because it
 * previously shipped as three different values in three spellings. */
const focusRing = blue[600];

const fontFamily = {
  sans: [
    "Inter",
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "Noto Sans",
    "sans-serif",
    "Apple Color Emoji",
    "Segoe UI Emoji",
  ],
  display: ["IBM Plex Sans", "Inter", "system-ui", "sans-serif"],
};

/**
 * The pre-2026 scale ran one full step large with 1.16 body leading
 * (base was 19px/22px). This is a standard modern scale with real body
 * leading; display steps carry optical tracking, which Inter wants.
 */
const fontSize = {
  xs: ["12px", { lineHeight: "16px" }],
  sm: ["14px", { lineHeight: "20px" }],
  base: ["16px", { lineHeight: "24px" }],
  lg: ["18px", { lineHeight: "26px" }],
  xl: ["20px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
  "2xl": ["24px", { lineHeight: "30px", letterSpacing: "-0.015em" }],
  "3xl": ["30px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
  "4xl": ["36px", { lineHeight: "42px", letterSpacing: "-0.02em" }],
  "5xl": ["48px", { lineHeight: "52px", letterSpacing: "-0.025em" }],
};

/** 2xl / 3xl / full are left at Tailwind defaults on purpose: rounded-3xl is
 * the pricing plan-card and CTA shape and must not move. */
const borderRadius = {
  sm: "4px",
  DEFAULT: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
};

const boxShadow = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
  md: "0 2px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
  lg: "0 8px 24px -4px rgb(0 0 0 / 0.10), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
  xl: "0 16px 40px -8px rgb(0 0 0 / 0.12), 0 6px 12px -6px rgb(0 0 0 / 0.07)",
};

/** drop-shadow-* reads theme.dropShadow, NOT theme.boxShadow — kept in step so
 * the pricing hero video doesn't fall out of family with everything else. */
const dropShadow = {
  sm: "0 1px 1px rgb(0 0 0 / 0.04)",
  DEFAULT: ["0 1px 2px rgb(0 0 0 / 0.08)", "0 1px 1px rgb(0 0 0 / 0.05)"],
  md: ["0 3px 3px rgb(0 0 0 / 0.08)", "0 1px 2px rgb(0 0 0 / 0.05)"],
  lg: ["0 8px 8px rgb(0 0 0 / 0.08)", "0 3px 3px rgb(0 0 0 / 0.05)"],
  xl: ["0 14px 14px rgb(0 0 0 / 0.10)", "0 5px 5px rgb(0 0 0 / 0.06)"],
};

// eslint-disable-next-line no-undef
module.exports = {
  colors: {
    background,
    foreground,
    neutral,
    blue,
    orange,
    green,
    purple,
    zinc,
  },
  focusRing,
  fontFamily,
  fontSize,
  borderRadius,
  boxShadow,
  dropShadow,
};
