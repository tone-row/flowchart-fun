import cx from "classnames";
import { ReactNode } from "react";

export const pageTitle = "text-2xl md:text-3xl font-bold tracking-tight";
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
  "text-lg font-semibold text-neutral-700 dark:text-neutral-300";
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
        "pb-1 border-b dark:border-b-neutral-800": isUnderline,
      })}
      {...props}
    >
      {children}
    </h2>
  );
}

type Size = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

export const description =
  "text-neutral-600 dark:text-neutral-400 leading-normal";
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
    <p className={`${description} text-${size} ${className}`} {...props}>
      {children}
    </p>
  );
}

export const label = "text-neutral-400 dark:text-neutral-500";
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
    <span className={`${label} text-${size} ${className}`} {...props}>
      {children}
    </span>
  );
}
