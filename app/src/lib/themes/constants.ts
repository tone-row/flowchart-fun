import { Stylesheet } from "cytoscape";

export type Theme = {
  font?: {
    files?: { name: string; url: string; unicodeRange?: string }[];
    fontFamily: string;
    lineHeight?: number;
    fontSize?: number;
  };
  textMaxWidth?: number;
  value: string;
  bg: string;
  minWidth?: number;
  minHeight?: number;
  styles: Stylesheet[];
};

export const defaultFontFamily =
  "Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol";
