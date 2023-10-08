import { Control, createControls } from "../form";
import { ReactNode, useMemo, useState } from "react";

type BaseProps = {
  id: string;
  title: string;
  description: ReactNode;
};

const select: Control<string, BaseProps & { options: string[] }> = (
  value,
  onValueChange,
  { options, id }
) => (
  <select
    id={id}
    name={id}
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
  >
    {options.map((option) => (
      <option value={option}>{option}</option>
    ))}
  </select>
);

const input: Control<string, BaseProps> = (value, onValueChange, { id }) => (
  <input
    id={id}
    name={id}
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
    className="border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
  />
);

const createForm = createControls({
  select,
  input,
});

const myObj = {
  str1: "hello",
  str2: "world",
};

export function Minimal() {
  const [data, setData] = useState(myObj);
  const Form = useMemo(
    () =>
      createForm<typeof myObj>({
        wrapper({ children, data }) {
          const isDisabled = data.str1 === "disable";
          return (
            <form className="grid gap-2">
              {children}
              <button
                disabled={isDisabled}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </form>
          );
        },
        wrapEach({ children, field }) {
          return (
            <div style={{ display: "grid", gap: 5 }}>
              <label htmlFor={field.id} className="flex items-center gap-1">
                <span>⭐️</span>
                <strong>{field.title}</strong>
              </label>
              <p className="text-xs text-neutral-400">{field.description}</p>
              {children}
            </div>
          );
        },
        elements: [
          {
            id: "str1",
            title: "String 1",
            control: "input",
            description: "Try typing 'hide' or 'disable'",
            onChange(value) {
              setData((data) => ({ ...data, str1: value }));
            },
            value(data) {
              return data.str1;
            },
          },
          {
            hidden(data) {
              return data.str1 === "hide";
            },
            elements: [
              <hr
                style={{
                  width: "100%",
                  height: 0,
                  border: "none",
                  borderTop: "dashed 1px #ccc",
                }}
              />,
              {
                id: "str2",
                title: "String 2",
                description: "This is a <select>",
                control: "select",
                onChange(value) {
                  setData((data) => ({ ...data, str2: value }));
                },
                value(data) {
                  return data.str2;
                },
                options: ["hello", "world"],
              },
            ],
          },
        ],
      }),
    []
  );
  return <Form data={data} />;
}
