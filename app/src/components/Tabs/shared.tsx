import * as Select from "@radix-ui/react-select";
import * as Slider from "@radix-ui/react-slider";
import { CaretDown } from "phosphor-react";
import { memo, ReactNode } from "react";
import { Link } from "react-router-dom";

import { SelectOption } from "../../lib/graphOptions";
import { useIsValidSponsor } from "../../lib/hooks";
import { Label } from "../../ui/Typography";
import styles from "./shared.module.css";

export function CustomSelect({
  niceName,
  options,
  ...props
}: { niceName: string; options: SelectOption[] } & Select.SelectProps) {
  const isValidSponsor = useIsValidSponsor();
  return (
    <Select.Root {...props}>
      <Select.Trigger className={styles.selectTrigger}>
        <Select.Value>
          <span className="text font-bold">{niceName}</span>
        </Select.Value>
        <Select.Icon asChild>
          <CaretDown size={16} weight="thin" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Content className={styles.selectContent}>
        {options
          .filter((l) => {
            if (!isValidSponsor && l.sponsorOnly) return false;
            return true;
          })
          .map((layout) => (
            <Select.Item key={layout.value} value={layout.value}>
              {layout.label()}
            </Select.Item>
          ))}
      </Select.Content>
    </Select.Root>
  );
}

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

export function WithLowerChild({ children }: { children: ReactNode }) {
  return <div className={styles.withLowerChild}>{children}</div>;
}

export function LargeLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link to={href} className={styles.largeLink}>
      {children}
    </Link>
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
