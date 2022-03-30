import { t } from "@lingui/macro";
import VisuallyHidden from "@reach/visually-hidden";
import {
  ArrowsInSimple,
  ArrowsOutSimple,
  ArrowUpRight,
  IconProps,
  LineSegments,
  PaintBrush,
} from "phosphor-react";
import {
  ForwardRefExoticComponent,
  memo,
  RefAttributes,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { Controller, useForm } from "react-hook-form";

import { gaChangeGraphOption } from "../lib/analytics";
import { defaultSpacingFactor } from "../lib/constants";
import { directions, layouts } from "../lib/graphOptions";
import { themes, useGraphTheme } from "../lib/graphThemes";
import { useStoreGraph } from "../lib/store.graph";
import { Box, BoxProps } from "../slang";
import { AutoLayoutSwitch } from "./AutoLayoutSwitch";
import { GraphDropdown } from "./GraphDropdown";
import styles from "./GraphOptionsBar.module.css";
import { GraphContext } from "./GraphProvider";
import { smallIconSize, Tooltip, tooltipSize } from "./Shared";

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

  const currentLayout = graphOptions.layout?.name ?? layouts[0].value;
  const currentDirection = graphOptions.layout?.rankDir ?? directions[0].value;

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
          <Tooltip
            label={t`Layout`}
            aria-label={t`Layout`}
            className={`slang-type size-${tooltipSize}`}
          >
            <div className={styles.BarSection}>
              <Controller
                control={control}
                name="layout.name"
                render={({ field: { onChange } }) => {
                  return (
                    <GraphDropdown
                      value={currentLayout}
                      options={layouts}
                      handleValueChange={(layout) => {
                        onChange(layout);
                      }}
                    >
                      <LineSegments size={smallIconSize} />
                    </GraphDropdown>
                  );
                }}
              />
            </div>
          </Tooltip>
          {currentLayout === "dagre" && (
            <Tooltip
              label={t`Direction`}
              aria-label={t`Direction`}
              className={`slang-type size-${tooltipSize}`}
            >
              <div className={styles.BarSection}>
                <Controller
                  control={control}
                  name="layout.rankDir"
                  render={({ field: { onChange } }) => {
                    return (
                      <GraphDropdown
                        value={currentDirection}
                        options={directions}
                        handleValueChange={(direction) => {
                          onChange(direction);
                        }}
                      >
                        <ArrowUpRight size={smallIconSize} />
                      </GraphDropdown>
                    );
                  }}
                />
              </div>
            </Tooltip>
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
      <Tooltip
        label={t`Theme`}
        aria-label={t`Theme`}
        className={`slang-type size-${tooltipSize}`}
      >
        <div className={styles.BarSection}>
          <Controller
            control={control}
            name="theme"
            render={({ field: { onChange } }) => {
              return (
                <GraphDropdown
                  value={currentTheme.value}
                  options={themes}
                  handleValueChange={(theme) => {
                    onChange(theme);
                  }}
                >
                  <PaintBrush size={smallIconSize} />
                </GraphDropdown>
              );
            }}
          />
        </div>
      </Tooltip>
    </Box>
  );
});

GraphOptionsBar.displayName = "GraphOptionsBar";
export default GraphOptionsBar;

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
