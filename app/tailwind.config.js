/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#fffcff",
        foreground: "#251d1d",
        neutral: {
          50: "#fcf9fc",
          100: "#fcf8fb",
          200: "#f3eef0",
          300: "#e5e0e1",
          400: "#b5aeb0",
          500: "#847d7e",
          600: "#645d5e",
          700: "#51494a",
          800: "#362e2e",
          900: "#251d1d",
        },
        blue: {
          50: "#f7faff",
          100: "#e9efff",
          200: "#cddbff",
          300: "#a8bdff",
          400: "#7f96ff",
          500: "#5c6fff",
          600: "#4750f3",
          700: "#3c41d8",
          800: "#3238b0",
          900: "#2f358d",
        },
        orange: {
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
        },
        green: {
          50: "#f5fff2",
          100: "#e3ffdc",
          200: "#c3ffb9",
          300: "#84ff82",
          400: "#50f468",
          500: "#09d956",
          600: "#00ad47",
          700: "#008434",
          800: "#016a26",
          900: "#065a21",
        },
        purple: {
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
        },
        zinc: {
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
        },
      },
      keyframes: {
        overlayShow: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        contentShow: {
          from: { opacity: 0, transform: "translate(-50%, -48%) scale(0.96)" },
          to: { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
        },
        slideUpAndFade: {
          from: { opacity: 0, transform: "translateY(2px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideUpFadeLarge: {
          from: { opacity: 0, transform: "translateY(10px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideRightAndFade: {
          from: { opacity: 0, transform: "translateX(-2px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        slideDownAndFade: {
          from: { opacity: 0, transform: "translateY(-2px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        slideLeftAndFade: {
          from: { opacity: 0, transform: "translateX(2px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
        pulseIn: {
          "0%, 100%": { opacity: 0 },
          "50%": { opacity: 0.5 },
        },
        hide: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        slideIn: {
          from: {
            transform: "translateX(calc(100% + var(--viewport-padding)))",
          },
          to: { transform: "translateX(0)" },
        },
        swipeOut: {
          from: { transform: "translateX(var(--radix-toast-swipe-end-x))" },
          to: { transform: "translateX(calc(100% + var(--viewport-padding)))" },
        },
      },
      animation: {
        overlayShow: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideUpAndFade: "slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideRightAndFade:
          "slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideDownAndFade:
          "slideDownAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideLeftAndFade:
          "slideLeftAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideUpFadeLarge:
          "slideUpFadeLarge 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        pulse: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        hide: "hide 100ms ease-in",
        slideIn: "slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        swipeOut: "swipeOut 100ms ease-out",
        pulseIn: "pulseIn 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      fontSize: {
        xs: ["14px", { lineHeight: "16px" }],
        sm: ["16px", { lineHeight: "18px" }],
        base: ["19px", { lineHeight: "22px" }],
        lg: ["23px", { lineHeight: "26px" }],
        xl: ["27px", { lineHeight: "31px" }],
        "2xl": ["33px", { lineHeight: "38px" }],
        "3xl": ["35px", { lineHeight: "40px" }],
        "4xl": ["40px", { lineHeight: "46px" }],
        "5xl": ["50px", { lineHeight: "58px" }], // <- not from designs, can change
      },
      screens: {
        md: "800px",
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
