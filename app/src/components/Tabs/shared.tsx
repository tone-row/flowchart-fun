import * as Select from "@radix-ui/react-select";
import { memo, ReactNode } from "react";
import { Link } from "react-router-dom";

import { SelectOption } from "../../lib/graphOptions";
import { useIsValidSponsor } from "../../lib/hooks";
import styles from "./shared.module.css";

export function CustomSelect({
  niceName,
  options,
  ...props
}: { niceName: string; options: SelectOption[] } & Select.SelectProps) {
  const isValidSponsor = useIsValidSponsor();
  return (
    <Select.Root {...props}>
      <Select.Trigger>
        <Select.Value>{niceName}</Select.Value>
      </Select.Trigger>
      <Select.Content
        style={{
          width: 200,
          maxHeight: 200,
          overflow: "auto",
          backgroundColor: "var(--color-background)",
        }}
      >
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
      style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}
    >
      <div style={{ flex: 1 }}>{children}</div>
      <div style={{ flex: 0, marginLeft: 10, fontSize: 12, color: "gray" }}>
        {label}
      </div>
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
