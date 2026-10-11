import { addDays } from "date-fns";

import type { Doc } from "./useDoc";

export function getExpirationDate() {
  return addDays(new Date(), 1).toISOString();
}

export function withFreshExpiry(doc: Doc): Doc {
  return { ...doc, meta: { ...doc.meta, expires: getExpirationDate() } };
}
