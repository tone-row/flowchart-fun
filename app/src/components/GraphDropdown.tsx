import * as Select from "@radix-ui/react-select";
import { CaretDown } from "phosphor-react";
import { memo } from "react";

import { Box, Type } from "../slang";
import styles from "./GraphDropdown.module.css";

export const GraphDropdown = memo(function GraphDropdown<K extends string>({
  value,
  options,
  handleValueChange,
  children,
}: {
  value: K;
  options: { label: () => string; value: K }[];
  handleValueChange: (value: K) => void;
  children?: React.ReactNode;
}) {
  const selected = options.find((o) => o.value === value);
  return (
    <Select.Root value={value} onValueChange={handleValueChange}>
      <Select.Trigger aria-label="Layout" asChild>
        <Box
          as="button"
          flow="column"
          content="center"
          items="center"
          px={2}
          rad={1}
          className={styles.GraphDropdown}
        >
          {children}
          <Select.Value>
            <Box p={2}>
              <Type size={-1} as="span">
                {selected?.label()}
              </Type>
            </Box>
          </Select.Value>
          <Select.Icon asChild>
            <CaretDown />
          </Select.Icon>
        </Box>
      </Select.Trigger>
      <Select.Content style={{ background: "white" }}>
        <Select.ScrollUpButton />
        <Select.Viewport asChild>
          <Box p={1} className={styles.GraphDropdown__dropdown}>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={styles.GraphDropdown__item}
              >
                <Select.ItemText asChild>
                  <Box px={2} py={1}>
                    <Type size={-1}>{option.label()}</Type>
                  </Box>
                </Select.ItemText>
              </Select.Item>
            ))}
          </Box>
        </Select.Viewport>
        <Select.ScrollDownButton />
      </Select.Content>
    </Select.Root>
  );
});
