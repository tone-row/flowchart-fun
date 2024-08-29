import { format, parse, parseISO } from "date-fns";

export function niceDate(d: Date) {
  return format(d, "LLLL d, yyyy");
}

export function dateString(d: string) {
  return format(parse(d, "yyyy-MM-dd", new Date()), "yyyy-MM-dd");
}
export function dateAsNumber(d: string) {
  return parseInt(format(parse(d, "yyyy-MM-dd", new Date()), "yyyyMMdd"), 10);
}

export function niceDateIso(d: string) {
  return format(parseISO(d), "LLLL d, yyyy");
}
