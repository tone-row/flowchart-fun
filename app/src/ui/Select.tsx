import * as Select from "@radix-ui/react-select";
import classnames from "classnames";
import { CaretDown, CaretUp, Check } from "phosphor-react";
import { forwardRef } from "react";

export const BasicSelect = ({
  placeholder = "...",
  options,
  ...props
}: {
  placeholder?: string;
  options: {
    label: string;
    value: string;
  }[];
} & Select.SelectProps) => {
  return (
    <Select.Root {...props}>
      <Select.Trigger className="inline-flex items-center justify-center rounded px-3 text-xs leading-none h-[35px] gap-2 focus:show-md outline-none bg-background text-neutral-800 hover:bg-neutral-200 data-[placeholder]:text-neutral-500 dark:bg-[var(--color-background)] dark:data-[placeholder]:text-neutral-500 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-neutral-100">
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="text-neutral-600 dark:text-neutral-500">
          <CaretDown />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="z-100 overflow-hidden bg-background rounded-md shadow-lg border dark:border-neutral-700 dark:bg-[var(--color-background)]">
          <Select.ScrollUpButton className="flex items-center justify-center h-[25px] cursor-default bg-background text-neutral-800 dark:bg-[var(--color-background)] dark:text-neutral-500">
            <CaretUp />
          </Select.ScrollUpButton>
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex items-center justify-center h-[25px] cursor-default bg-background text-neutral-800 dark:bg-[var(--color-background)] dark:text-neutral-500">
            <CaretDown />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};

const SelectItem = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Select.Item>
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <Select.Item
      className={classnames(
        "text-xs leading-none flex rounded-xs flex items-center py-2 pl-3 pr-[25px] relative select-none data-[disabled]:pointer-events-none data-[highlighted]:outline-none",
        "data-[highlighted]:bg-neutral-200 data-[highlighted]:text-neutral-900 text-foreground data-[disabled]:text-neutral-400 dark:text-neutral-300 dark:data-[disabled]:text-neutral-500 dark:data-[highlighted]:bg-neutral-800 dark:data-[highlighted]:text-neutral-100",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <Select.ItemText>{children}</Select.ItemText>
      <Select.ItemIndicator className="absolute right-0 w-[25px] inline-flex items-center justify-center">
        <Check />
      </Select.ItemIndicator>
    </Select.Item>
  );
});

SelectItem.displayName = "SelectItem";
