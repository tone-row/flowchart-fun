import { Stylesheet } from "cytoscape";

export type Theme = {
  font?: { filename?: string; fontFamily: string; lineHeight?: number };
  value: string;
  bg: string;
  minWidth?: number;
  minHeight?: number;
  styles: Stylesheet[];
};

export const defaultFontFamily =
  "Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol";
