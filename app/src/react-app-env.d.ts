/// <reference types="react-scripts" />

declare module "cytoscape-klay";
declare module "cytoscape-dagre";
declare module "cytoscape-elk";
declare module "cytoscape-svg";
declare module "cytoscape-cose-bilkent";
declare module "cytoscape-grid-guide";
declare module "@tone-row/strip-comments";
declare module "svgo/dist/svgo.browser" {
  const optimize: (s: string, args: any) => { data: string };
  export = { optimize };
}

interface CSSStyleSheet {
  replaceSync(reset_style: any): void;
}
