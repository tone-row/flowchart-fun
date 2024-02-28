import cytoscape from "cytoscape";

const div = document.getElementById("cy");

const cy = cytoscape({
  container: div,
  elements: [
    { data: { id: "a" } },
    { data: { id: "b" } },
    { data: { id: "ab", source: "a", target: "b" } },
  ],
});

window.cy = cy;

declare global {
  interface Window {
    cy: cytoscape.Core;
  }
}
