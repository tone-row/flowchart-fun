import * as Slider from "@radix-ui/react-slider";
import { Control } from "formulaic";

type BaseProps = {
  id: string;
  title: string;
};

export const select: Control<
  string,
  BaseProps & { options: { value: string; label: string }[] }
> = (value, onValueChange, { id, options }) => {
  return (
    <select
      key={id}
      id={id}
      value={value}
      onChange={(e) => {
        onValueChange(e.target.value);
      }}
      className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export const range: Control<
  number,
  BaseProps & { min: number; max: number; step: number }
> = (value, onValueChange, { id, min, max, step, title }) => {
  return (
    <Slider.Root
      key={id}
      id={id}
      name={id}
      className="relative flex items-center select-none touch-none w-full h-6"
      value={[value]}
      max={max}
      min={min}
      step={step}
      onValueChange={([value]) => {
        onValueChange(value);
      }}
    >
      <Slider.Track className="w-full h-1 bg-gray-200 rounded-full relative grow">
        <Slider.Range className="absolute h-full bg-blue-500 rounded-full" />
      </Slider.Track>
      <Slider.Thumb
        className="block w-4 h-4 bg-blue-500 rounded-full shadow-md"
        aria-label={title}
      />
    </Slider.Root>
  );
};

export const text: Control<string, BaseProps> = (
  value,
  onValueChange,
  { id }
) => {
  return (
    <input
      key={id}
      type="text"
      id={id}
      value={value}
      onChange={(e) => {
        onValueChange(e.target.value);
      }}
      className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  );
};

export const color: Control<string, BaseProps> = (
  value,
  onValueChange,
  { id }
) => {
  return (
    <div className="flex items-center gap-2">
      <input
        key={id}
        type="color"
        id={id}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
        }}
        className="h-6 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      <span className="font-mono text-neutral-500">{value}</span>
    </div>
  );
};

export const checkbox: Control<boolean, BaseProps> = (
  value,
  onValueChange,
  { id }
) => {
  return (
    <input
      key={id}
      type="checkbox"
      id={id}
      checked={value}
      onChange={(e) => {
        onValueChange(e.target.checked);
      }}
      className="h-6 w-6 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  );
};
