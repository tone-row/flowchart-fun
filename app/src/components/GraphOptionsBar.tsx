import { t } from "@lingui/macro";
import VisuallyHidden from "@reach/visually-hidden";
import {
  ArrowsInSimple,
  ArrowsOutSimple,
  ArrowUpRight,
  CaretDown,
  CirclesThree,
  IconProps,
  PaintBrush,
} from "phosphor-react";
import {
  ForwardRefExoticComponent,
  memo,
  ReactNode,
  RefAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { Controller, useForm } from "react-hook-form";
import Select, {
  components,
  SingleValueProps,
  StylesConfig,
} from "react-select";

import { gaChangeGraphOption } from "../lib/analytics";
import { defaultSpacingFactor } from "../lib/constants";
import { directions, layouts } from "../lib/graphOptions";
import { themes, useGraphTheme } from "../lib/graphThemes";
import { useStoreGraph } from "../lib/store.graph";
import { Box, BoxProps, Type } from "../slang";
import { AutoLayoutSwitch } from "./AutoLayoutSwitch";
import styles from "./GraphOptionsBar.module.css";
import { GraphContext } from "./GraphProvider";
import {
  smallBtnTypeSize,
  smallIconSize,
  Tooltip,
  tooltipSize,
} from "./Shared";

const GraphOptionsBar = memo(() => {
  const { updateGraphOptionsText, graphOptions = {} } =
    useContext(GraphContext);
  const {
    watch,
    control,
    formState: { isDirty },
    reset,
  } = useForm();

  const currentTheme = useGraphTheme();
  const values = watch();
  const layout = watch("layout.name");
  const theme = watch("theme");
  const valuesString = JSON.stringify(values);
  const runLayout = useStoreGraph((store) => store.runLayout);

  useEffect(() => {
    if (layout) gaChangeGraphOption({ action: "layout", label: layout });
  }, [layout]);

  useEffect(() => {
    if (theme) gaChangeGraphOption({ action: "theme", label: theme });
  }, [theme]);

  // Update graph options text if different that useForm
  useEffect(() => {
    if (!isDirty) return;

    // Check if different than current values
    const options = JSON.parse(valuesString);
    if (!isEqual(options, graphOptions)) {
      if (isEmpty(options.layout)) delete options.layout;
      updateGraphOptionsText && updateGraphOptionsText(options);
    }
  }, [updateGraphOptionsText, isDirty, valuesString, graphOptions]);

  const ctxGraphOptions = JSON.stringify(graphOptions);

  // Reset useForm to match whats in context
  useEffect(() => {
    const inContext = JSON.parse(ctxGraphOptions);
    // All Top-Level Keys must be present here!
    reset({ layout: inContext.layout, theme: inContext.theme });
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

  const expand = useCallback(
    () =>
      updateGraphOptionsText &&
      updateGraphOptionsText({
        layout: {
          spacingFactor:
            (graphOptions.layout?.spacingFactor ?? defaultSpacingFactor) + 0.25,
        },
      }),
    [graphOptions.layout?.spacingFactor, updateGraphOptionsText]
  );

  const contract = useCallback(
    () =>
      updateGraphOptionsText &&
      updateGraphOptionsText({
        layout: {
          spacingFactor: Math.max(
            (graphOptions.layout?.spacingFactor ?? defaultSpacingFactor) - 0.25,
            0
          ),
        },
      }),
    [graphOptions.layout?.spacingFactor, updateGraphOptionsText]
  );

  return (
    <Box className={styles.GraphOptionsBar} as="form">
      <AutoLayoutSwitch />
      {runLayout ? (
        <>
          <OptionWithIcon
            icon={CirclesThree}
            label={t`Layout`}
            labelFor="layout"
          >
            <Controller
              control={control}
              name="layout.name"
              render={({ field: { onChange } }) => {
                return (
                  <Select
                    inputId="layout"
                    options={layouts}
                    onChange={(layout: typeof layouts[number]) =>
                      layout && onChange(layout.value)
                    }
                    value={currentLayout}
                    {...selectProps}
                  />
                );
              }}
            />
          </OptionWithIcon>
          {currentLayout?.value === "dagre" && (
            <OptionWithIcon
              icon={ArrowUpRight}
              label={t`Direction`}
              labelFor="direction"
            >
              <Controller
                control={control}
                name="layout.rankDir"
                render={({ field: { onChange } }) => {
                  return (
                    <Select
                      inputId="direction"
                      options={directions}
                      onChange={(dir: typeof directions[0]) =>
                        dir && onChange(dir.value)
                      }
                      value={currentDirection}
                      {...selectProps}
                    />
                  );
                }}
              />
            </OptionWithIcon>
          )}
          <Box flow="column" className={styles.BarSection}>
            <IconButton
              icon={ArrowsInSimple}
              onClick={contract}
              label={t`Contract`}
              disabled={
                graphOptions.layout?.spacingFactor &&
                graphOptions.layout?.spacingFactor <= 0.25
              }
            />
            <IconButton
              icon={ArrowsOutSimple}
              onClick={expand}
              label={t`Expand`}
            />
          </Box>
        </>
      ) : null}
      <OptionWithIcon icon={PaintBrush} label={t`Theme`} labelFor="theme">
        <Controller
          control={control}
          name="theme"
          render={({ field: { onChange } }) => {
            return (
              <Select
                inputId="theme"
                options={themes}
                onChange={(theme: typeof themes[0]) =>
                  theme && onChange(theme.value)
                }
                value={themes.find(
                  (theme) => theme.value === currentTheme.value
                )}
                {...selectProps}
              />
            );
          }}
        />
      </OptionWithIcon>
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
  label,
  labelFor,
}: {
  icon: Icon;
  children: ReactNode;
  label: string;
  labelFor: string;
}) {
  return (
    <>
      <VisuallyHidden as="label" htmlFor={labelFor}>
        {label}
      </VisuallyHidden>
      <Tooltip
        label={label}
        aria-label={label}
        className={`slang-type size-${tooltipSize}`}
      >
        <Box
          flow="column"
          gap={1}
          items="center normal"
          content="normal start"
          className={styles.BarSection}
        >
          <Box className={styles.BarSectionSvgWrapper} pl={2}>
            <Icon size={smallIconSize} />
          </Box>
          {children}
        </Box>
      </Tooltip>
    </>
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
    flexWrap: "nowrap",
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
    width: 180,
    zIndex: 2,
  }),
  menuList: (provided) => ({
    ...provided,
    paddingTop: 0,
    paddingBottom: 0,
  }),
  menuPortal: (provided) => ({
    ...provided,
  }),
};

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

const selectProps = {
  isSearchable: false,
  getOptionLabel: ({ label }: any) => (label as unknown as () => string)(),
  styles: selectStyles,
  components: {
    IndicatorSeparator: () => null,
    SingleValue,
    Option,
    DropdownIndicator: DIndicator,
  },
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

function IconButton({
  icon: Icon,
  onClick,
  label,
  ...props
}: {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  onClick: () => void;
  label: string;
} & BoxProps) {
  return (
    <Tooltip
      label={label}
      aria-label={label}
      className={`slang-type size-${tooltipSize}`}
    >
      <Box
        as="button"
        onClick={onClick}
        type="button"
        p={2}
        rad={1}
        className={styles.IconButton}
        {...props}
      >
        <Icon size={smallIconSize + 2} />
        <VisuallyHidden>{label}</VisuallyHidden>
      </Box>
    </Tooltip>
  );
}

function isEmpty(obj: object) {
  return (
    obj &&
    Object.keys(obj).length === 0 &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
}
