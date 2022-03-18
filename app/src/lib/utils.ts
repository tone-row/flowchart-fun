import strip from "@tone-row/strip-comments";
import cytoscape from "cytoscape";

export function stripComments(t: string) {
  return strip(t, { preserveNewlines: true });
}

export function isEdge(el: cytoscape.ElementDefinition) {
  return "target" in el.data || "source" in el.data;
}

// Temporary Encoder, will become a larger part
// when we have new whitespace editor
export function encode(s: string) {
  return encodeURIComponent(s).replace(/\(/g, "%28").replace(/\)/g, "%29");
}
export function decode(s: string) {
  return decodeURIComponent(s.replace(/%29/g, ")").replace(/%28/g, "("));
}
