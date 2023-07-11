import * as Slider from "@radix-ui/react-slider";
import { memo, ReactNode } from "react";

import { Label } from "../../ui/Typography";
import styles from "./shared.module.css";

export function OptionWithLabel({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        minHeight: 50,
      }}
    >
      <Label className="flex-[100px] min-w-[100px] max-w-[100px]" size="xs">
        {label}
      </Label>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export const TabOptionsGrid = memo(function TabOptionsGrid({
  children,
}: {
  children: ReactNode;
}) {
  return <div className={styles.tabOptionsGrid}>{children}</div>;
});

export function WithLowerChild({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`${styles.withLowerChild} ${className}`}>{children}</div>
  );
}

export function Range(props: Slider.SliderProps) {
  return (
    <Slider.Root {...props} className={styles.rangeRoot}>
      <Slider.Track>
        <Slider.Range className={styles.rangeRange} />
      </Slider.Track>
      <Slider.Thumb className={styles.rangeThumb} />
    </Slider.Root>
  );
}
