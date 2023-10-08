import type { ReactNode } from "react";

/**
 * Controls are renderers for a specific type of data. For example, an input
 * for a string, a checkbox for a boolean, a select for an enum, etc.
 *
 * Use controls to render the atoms of your form. If you plan to wrap each
 * control in a label, you can use the `wrapEach` prop when you build your form.
 */
export type Control<Value, Options extends { id: string } = { id: string }> = (
  value: Value,
  onValueChange: (value: Value) => void,
  options: Options
) => JSX.Element;

type ControlsMap<Controls> = {
  [K in keyof Controls]: Controls[K] extends Control<infer Value, infer Options>
    ? { value: Value; options: Options }
    : never;
};

/**
 * Form-rendering framework tightly coupled to type and data. Creates a form
 * creator function with a known set of control types that can be used.
 */
export function createControls<
  Controls_ extends Record<string, Control<any, any>>
>(controls: Controls_) {
  // Strongly typed controls
  type Controls = ControlsMap<Controls_>;

  type Fields<Data> = {
    [K in keyof Controls]: {
      /**
       * What control to use.
       */
      control: K;
      /**
       * Given the data, return the value for this field.
       */
      value: (data: Data) => Controls[K]["value"];
      /**
       * Update the data with the new value.
       */
      onChange: (value: Controls[K]["value"]) => void;
      /**
       * If this field should be hidden.
       */
      hidden?: boolean | ((data: Data) => boolean);
    } & Controls[K]["options"];
  }[keyof Controls];

  /**
   * Sections are used to group fields together and optionally hide them.
   */
  type Section<Data> = {
    /**
     * If these fields should be hidden.
     */
    hidden?: boolean | ((data: Data) => boolean);
    /**
     * The elements in this section.  Can be fields or other sections.
     */
    elements: (Fields<Data> | Section<Data> | ReactNode)[];
    /**
     * Wraps all fields in this section.
     */
    wrapper?: ({
      children,
      data,
    }: {
      children: ReactNode;
      data: Data;
    }) => ReactNode;
    /**
     * Wraps each field in this section, and any sections contained by this section. It works recursively
     * so if you don't want it to wrap fields in a subsection, you can set `wrapEach` to `false` in
     * that subsection.
     */
    wrapEach?:
      | (({
          children,
          data,
          field,
        }: {
          children: ReactNode;
          data: Data;
          field: Fields<Data>;
        }) => ReactNode)
      | false;
  };

  return function createForm<Data>(
    elements: Section<Data> | Section<Data>["elements"]
  ) {
    function renderElementsRecursive(
      data: Data,
      elements: Section<Data>["elements"],
      parentWrapEach?: Section<Data>["wrapEach"]
    ): ReactNode {
      return elements.map((element) => {
        if (!element) return null;
        if (typeof element === "object" && "elements" in element) {
          // If it's a section, render it recursively.
          const {
            elements,
            hidden,
            wrapper,
            wrapEach = parentWrapEach,
          } = element;
          if (
            hidden &&
            (typeof hidden === "function" ? hidden(data) : hidden)
          ) {
            return null;
          }

          return wrapper
            ? wrapper({
                children: renderElementsRecursive(data, elements, wrapEach),
                data,
              })
            : renderElementsRecursive(data, elements, wrapEach);
        } else if (typeof element === "object" && "control" in element) {
          // If it's a field, render the control.
          const { control, value, onChange, hidden, ...options } = element;

          const controller = controls[element.control];
          if (!controller) {
            throw new Error(
              `Unknown control "${String(
                element.control
              )}". Available controls are: ${Object.keys(controls).join(", ")}`
            );
          }

          if (
            hidden &&
            (typeof hidden === "function" ? hidden(data) : hidden)
          ) {
            return null;
          }

          // Wrap the control if necessary.
          const wrapped = parentWrapEach
            ? parentWrapEach({
                children: controller(value(data), onChange, options),
                data,
                field: element,
              })
            : controller(value(data), onChange, options);

          // Wrap the control in a label if necessary.
          return wrapped;
        } else {
          // Otherwise, just render the element.
          return element;
        }
      });
    }

    return function Form({ data }: { data: Data }) {
      return (
        <>
          {renderElementsRecursive(
            data,
            Array.isArray(elements) ? elements : [elements],
            Array.isArray(elements) ? undefined : elements.wrapEach
          )}
        </>
      );
    };
  };
}
