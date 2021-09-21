import { Trans } from "@lingui/macro";
import React, { memo, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { directions, layouts } from "../lib/graphOptions";
import { Box, BoxProps, Type } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./GraphOptions.module.css";
import { GraphContext } from "./GraphProvider";

const GraphOptions = memo(() => {
  const { updateGraphOptionsText, graphOptions } = useContext(GraphContext);

  const {
    watch,
    register,
    formState: { isDirty },
  } = useForm();
  const values = watch();
  const valuesString = JSON.stringify(values);

  useEffect(() => {
    if (isDirty) {
      const options = JSON.parse(valuesString);
      window.plausible("Update Graph Options", {
        props: {
          layoutName: options.layout.name,
          rankDir: options.layout.rankDir,
        },
      });
      updateGraphOptionsText && updateGraphOptionsText(options);
    }
  }, [updateGraphOptionsText, isDirty, valuesString]);

  return (
    <Box content="start stretch" gap={4} as="form">
      <Type weight="700">
        <Trans>Graph Options</Trans>
      </Type>
      <Box gap={4}>
        <Type size={-1}>
          <Trans>Layout</Trans>
        </Type>
        <Select
          options={layouts}
          register={register}
          name="layout.name"
          value={graphOptions.layout?.name}
        />
        {(graphOptions.layout?.name === "dagre" ||
          typeof graphOptions.layout?.name === "undefined") && (
          <>
            <Type size={-1}>
              <Trans>Direction</Trans>
            </Type>
            <Select
              options={directions}
              register={register}
              name="layout.rankDir"
              value={graphOptions.layout?.rankDir}
            />
          </>
        )}
      </Box>
    </Box>
  );
});

GraphOptions.displayName = "GraphOptions";

export default GraphOptions;

function Select({
  register,
  options,
  name,
  value,
  ...props
}: {
  register: any;
  options: { value: string; label: () => string }[];
  name: string;
  value: string | undefined;
} & BoxProps) {
  const { theme } = useContext(AppContext);
  const { editable } = useContext(GraphContext);
  // Caret for select
  const backgroundImage = `url("data:image/svg+xml,%3Csvg stroke='${encodeURIComponent(
    editable ? theme.foreground : theme.uiAccent
  )}' fill='none' stroke-width='2' viewBox='0 0 24 24' stroke-linecap='round' stroke-linejoin='round' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;
  return (
    <Box
      p={3}
      as="select"
      className={[styles.Select, "slang-type size--1"].join(" ")}
      style={{ backgroundImage }}
      disabled={!editable}
      value={value}
      {...register(name)}
      {...props}
    >
      {options.map((option) => {
        return (
          <option key={option.value} value={option.value}>
            {option.label()}
          </option>
        );
      })}
    </Box>
  );
}
