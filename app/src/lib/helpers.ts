import { format, formatRelative as relative, parse } from "date-fns";
export function formatDate(date: string) {
  return format(parse(date, "t", new Date()), "MMMM do, yyyy");
}

export function formatRelative(date: string) {
  return relative(parse(date, "t", new Date()), new Date());
}

export function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function isError(x: unknown): x is Error {
  return Boolean(typeof x === "object" && x && "message" in x);
}

export function titleToLocalStorageKey(chartTitle: string) {
  return `flowcharts.fun${chartTitle === "/" ? "" : `:${chartTitle}`}`;
}

export const slugify = (value: string) =>
  value.replace(/[^a-z0-9]/gi, "-").toLocaleLowerCase();

/** Returns a chart name not being used in local storage */
const getName = () => (Math.random() + 1).toString(36).substring(7);
export function randomChartName() {
  let name = getName();
  while (localStorage.getItem(titleToLocalStorageKey(name))) {
    name = getName();
  }
  return name;
}

export type HiddenGraphOptions = {
  nodePositions?: { [key: string]: { x: number; y: number } };
};
