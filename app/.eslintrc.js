module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
    "plugin:jsx-a11y/strict",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: "module",
  },
  plugins: ["react", "jsx-a11y", "@typescript-eslint"],
  rules: {
    "react-hooks/exhaustive-deps": "error",
    "no-var": "error",
    "brace-style": "error",
    "prefer-template": "error",
    radix: "error",
    "space-before-blocks": "error",
    "import/prefer-default-export": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "warn",
  },
  overrides: [
    {
      files: [
        "**/*.test.js",
        "**/*.test.jsx",
        "**/*.test.tsx",
        "**/*.spec.js",
        "**/*.spec.jsx",
        "**/*.spec.tsx",
      ],
      env: {
        jest: true,
      },
    },
  ],
};
