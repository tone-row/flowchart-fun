import { getDefaultText } from "./getDefaultText";

// TODO: Should be shared with the back-end through a shared package
export function getMetaBase() {
  return `\n=====\n{"parser":"graph-selector"}\n=====`;
}

export function getDefaultChart() {
  return `${getDefaultText()}\n${getMetaBase()}`;
}
