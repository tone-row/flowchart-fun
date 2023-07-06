// @ts-nocheck
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "jest-canvas-mock";

jest.spyOn(Storage.prototype, "setItem");

global.CSSStyleSheet = class {
  constructor() {
    this.cssRules = [];
  }

  replaceSync(cssText) {
    this.cssRules = cssText;
  }
};
