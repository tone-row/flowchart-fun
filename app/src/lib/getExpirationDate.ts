import { addDays } from "date-fns";

export function getExpirationDate() {
  return addDays(new Date(), 1).toISOString();
}
