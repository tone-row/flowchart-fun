import {
  ArrowUpRight,
  CirclesThree,
  IconProps,
  CaretDown,
} from "phosphor-react";
import { memo, ReactNode, useContext, useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import Select, {
  StylesConfig,
  SingleValueProps,
  components,
} from "react-select";
import { directions, layouts } from "../lib/graphOptions";
import { Box, Type } from "../slang";
import styles from "./GraphOptionsBar.module.css";
import { GraphContext } from "./GraphProvider";
import { smallBtnTypeSize, smallIconSize } from "./Shared";

const GraphOptionsBar = memo(() => {
  const { updateGraphOptionsText, graphOptions } = useContext(GraphContext);
  const {
    watch,
    control,
    formState: { isDirty },
    reset,
  } = useForm();

  const values = watch();
  const valuesString = JSON.stringify(values);

  // Update graph options text if different that useForm
  useEffect(() => {
    if (!isDirty) return;

    // Check if different than current values
    const options = JSON.parse(valuesString);
    if (!isEqual(options, graphOptions)) {
      window.plausible("Update Graph Options", {
        props: {
          layoutName: options.layout.name,
          rankDir: options.layout.rankDir,
        },
      });
      updateGraphOptionsText && updateGraphOptionsText(options);
    }
  }, [updateGraphOptionsText, isDirty, valuesString, graphOptions]);

  const ctxGraphOptions = JSON.stringify(graphOptions);

  // Reset useForm to match whats in context
  useEffect(() => {
    const inContext = JSON.parse(ctxGraphOptions);
    reset({ layout: inContext.layout });
  }, [ctxGraphOptions, reset]);

  const currentLayout = useMemo(
    () =>
      layouts.find(({ value }) => value === graphOptions.layout?.name) ??
      layouts[0],
    [graphOptions.layout?.name]
  );

  const currentDirection = useMemo(
    () =>
      directions.find(({ value }) => value === graphOptions.layout?.rankDir) ??
      directions[0],
    [graphOptions.layout]
  );

  return (
    <Box
      className={styles.GraphOptionsBar}
      p={1}
      px={2}
      flow="column"
      gap={2}
      content="normal start"
      items="center stretch"
      as="form"
      at={{ tablet: { p: 2, px: 4, gap: 4 } }}
    >
      <OptionWithIcon icon={CirclesThree}>
        <Controller
          control={control}
          name="layout.name"
          render={({ field: { onChange } }) => {
            return (
              <MySelect
                options={layouts}
                onChange={(layout: typeof layouts[0]) =>
                  layout && onChange(layout.value)
                }
                value={currentLayout}
              />
            );
          }}
        />
      </OptionWithIcon>
      {currentLayout?.value === "dagre" && (
        <OptionWithIcon icon={ArrowUpRight}>
          <Controller
            control={control}
            name="layout.rankDir"
            render={({ field: { onChange } }) => {
              return (
                <MySelect
                  options={directions}
                  onChange={(dir: typeof directions[0]) =>
                    dir && onChange(dir.value)
                  }
                  value={currentDirection}
                />
              );
            }}
          />
        </OptionWithIcon>
      )}
    </Box>
  );
});

GraphOptionsBar.displayName = "GraphOptionsBar";
export default GraphOptionsBar;

type Icon = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

function OptionWithIcon({
  icon: Icon,
  children,
}: {
  icon: Icon;
  children: ReactNode;
}) {
  return (
    <Box flow="column" gap={1} items="center normal">
      <Icon size={smallIconSize} />
      {children}
    </Box>
  );
}

const selectStyles: StylesConfig<any, false> = {
  control: (p, { isFocused }) => {
    return {
      ...p,
      border: "none",
      backgroundColor: isFocused
        ? "var(--color-nodeHover)"
        : "var(--color-input)",
      boxShadow: "none",
      transition: "none",
      cursor: "pointer",
      minHeight: 0,
      "&:hover": {
        borderColor: "var(--color-edgeHover)",
        backgroundColor: "var(--color-nodeHover)",
        "& [class*='indicatorContainer'] svg polyline": {
          stroke: "var(--color-edgeHover)",
        },
      },
    };
  },
  placeholder: (provided) => ({
    ...provided,
    position: "static",
    transform: "none",
  }),
  singleValue: (provided) => ({
    ...provided,
    position: "static",
    transform: "none",
    marginLeft: 0,
    marginRight: 0,
    maxWidth: "100%",
    color: "var(--color-foreground)",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: 0,
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
  }),
  dropdownIndicator: (provided, { isFocused }) => ({
    ...provided,
    padding: 0,
    paddingRight: "calc(var(--spacer-px) * 2)",
    transition: "none",
    polyline: {
      stroke: isFocused ? "var(--color-edgeHover)" : "var(--color-uiAccent)",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--color-background)",
    border: "solid 1px var(--color-uiAccent)",
    boxShadow: "none",
    width: 150,
  }),
  menuList: (provided) => ({
    ...provided,
    paddingTop: 0,
    paddingBottom: 0,
  }),
};

function MySelect(props: any) {
  return (
    <Select
      {...props}
      isSearchable={false}
      getOptionLabel={({ label }) => (label as unknown as () => string)()}
      styles={selectStyles}
      components={{
        IndicatorSeparator: () => null,
        SingleValue,
        Option,
        DropdownIndicator: DIndicator,
      }}
    />
  );
}

const SingleValue = ({ children }: SingleValueProps<any>) => (
  <Box p={1} at={{ tablet: { p: 2 } }}>
    <Type size={smallBtnTypeSize}>{children}</Type>
  </Box>
);
const Option = ({
  children,
  innerProps,
  innerRef,
  isSelected,
  isFocused,
}: any) => {
  return (
    <Box
      className={styles.Option}
      ref={innerRef}
      p={1}
      at={{ tablet: { p: 2 } }}
      {...innerProps}
      aria-selected={isSelected}
      data-focused={isFocused}
    >
      <Type size={smallBtnTypeSize}>{children}</Type>
    </Box>
  );
};

const DIndicator = (props: any) => {
  return (
    <components.DropdownIndicator {...props}>
      <CaretDown />
    </components.DropdownIndicator>
  );
};

type R = string | number | null | undefined | boolean | any;
interface Z {
  [key: string]: R | Z;
}
type O = R | Z;
// Are values equal for known keys in a, BUT ignores unknown keys
function isEqual(a: O, b: O): boolean {
  if (typeof a !== "object") return a === b;
  if (typeof b !== "object") return false;
  if (!b) return false;

  let result = true;
  for (const key in a) {
    if (!isEqual(a[key], b[key])) {
      result = false;
      break;
    }
  }
  return result;
}
