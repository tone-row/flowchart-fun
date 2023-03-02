import { newDelimiters } from "./constants";
import { Doc } from "./useDoc";

/** Turns doc into the string we store in the database */

export function docToString(doc: Doc) {
  const { text, meta } = doc;
  return [
    text,
    newDelimiters,
    JSON.stringify(meta, null, 2),
    newDelimiters,
  ].join("\n");
}
