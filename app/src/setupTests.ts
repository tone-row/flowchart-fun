// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "jest-canvas-mock";

import { LocalStorage } from "node-localstorage";

export const mockLocalStorage = new LocalStorage("./scratch");

global.localStorage = mockLocalStorage;
