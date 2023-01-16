import { Stylesheet } from "cytoscape";

export type Theme = {
  font: {
    files?: { name: string; url: string; unicodeRange?: string }[];
    fontFamily: string;
    lineHeight: number;
    fontSize: number;
  };
  value: string;
  bg: string;
  /** Used to override container titles */
  fg: string;
  /** Used if regular bg can't be rendered to SVG */
  safeBg?: string;
  minWidth?: number;
  minHeight?: number;
  styles: Stylesheet[];
};

export const defaultFontFamily =
  "Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol";
