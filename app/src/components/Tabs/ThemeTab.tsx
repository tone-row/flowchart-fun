import { createControls, Control } from "formulaic";
import { FFTheme, LayoutDirection, LayoutName } from "../../lib/toTheme";
import { useTmpThemeState } from "./useTmpThemeState";

const select: Control<
  string,
  { id: string; options: { value: string; label: string }[] }
> = (value, onValueChange, { id, options }) => {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => {
        onValueChange(e.target.value);
      }}
      className="p-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      {options.map((option) => (
        <option value={option.value}>{option.label}</option>
      ))}
    </select>
  );
};

const createForm = createControls({
  select,
});

const Form = createForm<FFTheme>({
  elements: [
    {
      id: "layoutName",
      control: "select",
      value(data) {
        return data.layoutName;
      },
      onChange(value) {
        useTmpThemeState.setState({ layoutName: value as LayoutName });
      },
      options: [
        { value: "dagre", label: "Dagre" },
        { value: "klay", label: "Klay" },
        { value: "breadthfirst", label: "Breadthfirst" },
        { value: "cose", label: "Cose" },
        { value: "concentric", label: "Concentric" },
        { value: "circle", label: "Circle" },
        { value: "layered", label: "Layered" },
        { value: "tree", label: "Tree" },
        { value: "stress", label: "Stress" },
        { value: "radial", label: "Radial" },
      ],
    },
    {
      id: "layoutDirection",
      control: "select",
      value(data) {
        return data.layoutDirection;
      },
      onChange(value) {
        useTmpThemeState.setState({
          layoutDirection: value as LayoutDirection,
        });
      },
      options: [
        { label: `Top to Bottom`, value: "TB" },
        { label: `Left to Right`, value: "LR" },
        { label: `Right to Left`, value: "RL" },
        { label: `Bottom to Top`, value: "BT" },
      ],
    },
  ],
});

export function ThemeTab() {
  const data = useTmpThemeState();
  return (
    <div className="h-full w-full p-4">
      <form className="grid gap-1">
        <Form data={data} />
      </form>
    </div>
  );
}
