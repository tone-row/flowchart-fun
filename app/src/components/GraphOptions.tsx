import { memo, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, Type } from "../slang";
import { AppContext } from "./AppContext";
import styles from "./GraphOptions.module.css";
import { WithGraphContext } from "./WithGraph";

const layouts = [
  { label: "Dagre (default)", value: "dagre" },
  { label: "Breadthfirst", value: "breadthfirst" },
  { label: "COSE", value: "cose" },
  { label: "Concentric", value: "concentric" },
  { label: "Circle", value: "circle" },
  { label: "Random", value: "random" },
  { label: "Grid", value: "grid" },
];

const GraphOptions = memo(() => {
  const { theme } = useContext(AppContext);
  const { editable, updateGraphOptionsText, graphOptions } = useContext(
    WithGraphContext
  );
  const backgroundImage = `url("data:image/svg+xml,%3Csvg stroke='${encodeURIComponent(
    editable ? theme.foreground : theme.uiAccent
  )}' fill='none' stroke-width='2' viewBox='0 0 24 24' stroke-linecap='round' stroke-linejoin='round' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

  const {
    watch,
    register,
    formState: { isDirty },
  } = useForm();
  const values = watch();
  const valuesString = JSON.stringify(values);

  useEffect(() => {
    if (isDirty) {
      updateGraphOptionsText(JSON.parse(valuesString));
    }
  }, [updateGraphOptionsText, isDirty, valuesString]);

  return (
    <Box content="start stretch" gap={4} as="form">
      <Type weight="700">Graph Options</Type>
      <Box gap={4}>
        <Box gap={1}>
          <Type size={-1}>Layout</Type>
          <Type size={-3}>
            Auto-layout strategy. Find out more about available sub-settings at
            <a
              href="https://js.cytoscape.org/#layouts"
              target="_blank"
              rel="noreferrer"
            >
              https://js.cytoscape.org/#layouts
            </a>
          </Type>
        </Box>
        <Box
          p={3}
          as="select"
          className={[styles.Select, "slang-type size--1"].join(" ")}
          style={{ backgroundImage }}
          disabled={!editable}
          value={graphOptions.layout?.name}
          {...register("layout.name")}
        >
          {layouts.map((layout) => (
            <option key={layout.value} value={layout.value}>
              {layout.label}
            </option>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

GraphOptions.displayName = "GraphOptions";

export default GraphOptions;
