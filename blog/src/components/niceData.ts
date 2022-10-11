import { format, parse, parseISO } from "date-fns";

export function niceDate(d: string) {
  return format(parse(d, "ddLLy", new Date()), "LLLL d, yyyy");
}

export function dateString(d: string) {
  return format(parse(d, "ddLLy", new Date()), "yyyy-MM-dd");
}

export function niceDateIso(d: string) {
  return format(parseISO(d), "LLLL d, yyyy");
}
