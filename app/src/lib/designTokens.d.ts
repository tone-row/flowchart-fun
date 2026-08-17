/**
 * Types for designTokens.js. Hand-written — keep honest with the .js file,
 * which is the source of truth (tailwind.config.js requires it directly).
 */
type Ramp = Record<string, string>;

export declare const colors: {
  background: string;
  foreground: string;
  neutral: Ramp;
  blue: Ramp;
  orange: Ramp;
  green: Ramp;
  purple: Ramp;
  zinc: Ramp;
};
export declare const focusRing: string;
export declare const fontFamily: { sans: string[]; display: string[] };
export declare const fontSize: Record<
  string,
  [string, { lineHeight: string; letterSpacing?: string }]
>;
export declare const borderRadius: Record<string, string>;
export declare const boxShadow: Record<string, string>;
export declare const dropShadow: Record<string, string | string[]>;
