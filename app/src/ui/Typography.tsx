import cx from "classnames";
import { ReactNode } from "react";

export const pageTitle =
  "font-display text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50";
export function PageTitle({
  children,
  className = "",
  ...props
}: { children: ReactNode } & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={`${pageTitle} ${className}`} {...props}>
      {children}
    </h1>
  );
}

export const sectionTitle =
  "text-lg font-semibold text-neutral-800 dark:text-neutral-200";
export function SectionTitle({
  children,
  className = "",
  isUnderline = true,
  ...props
}: {
  children: ReactNode;
  isUnderline?: boolean;
} & React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cx(`${sectionTitle} ${className}`, {
        "pb-2 border-b border-neutral-200 dark:border-neutral-800": isUnderline,
      })}
      {...props}
    >
      {children}
    </h2>
  );
}

type Size = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

/**
 * Static map, not `text-${size}`. Tailwind's scanner cannot extract an
 * interpolated class name — these only ever worked because every value
 * happened to appear as a literal somewhere else in src/. Removing the last
 * literal `text-5xl` or `text-4xl` would have silently broken this.
 */
const textSize: Record<Size, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
};

export const description = "text-neutral-600 dark:text-neutral-400";
export function Description({
  children,
  className = "",
  size = "sm",
  ...props
}: {
  children: ReactNode;
  size?: Size;
} & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`${description} ${textSize[size]} ${className}`} {...props}>
      {children}
    </p>
  );
}

export const label = "text-neutral-500 dark:text-neutral-400";
export function Label({
  children,
  className = "",
  size = "sm",
  ...props
}: {
  children: ReactNode;
  size?: Size;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={`${label} ${textSize[size]} ${className}`} {...props}>
      {children}
    </span>
  );
}
