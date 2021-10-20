import { parse, format, formatRelative as relative } from "date-fns";
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
