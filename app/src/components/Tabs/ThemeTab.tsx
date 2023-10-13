import { createControls } from "formulaic";
import { updateThemeEditor, useThemeEditor } from "../../lib/toTheme";
import {
  FFTheme,
  Shape,
  CurveStyle,
  ArrowShape,
  Direction,
  LayoutName,
} from "../../lib/FFTheme";
import { ReactNode } from "react";

import classNames from "classnames";
import { theme as defaultTheme } from "../../lib/templates/default-template";
import {
  checkbox,
  color,
  range,
  select,
  text,
  fontpicker,
  customCss,
} from "./ThemeTabComponents";
import { useCanEdit } from "../../lib/hooks";
import { useDoc } from "../../lib/useDoc";

const createForm = createControls({
  select,
  range,
  text,
  color,
  checkbox,
  fontpicker,
  customCss,
});

const Form = createForm<{
  theme: FFTheme;
  customCssOnly: boolean;
}>({
  wrapEach({ children, field, data }) {
    return (
      <div
        key={field.id}
        className={classNames("grid", {
          "gap-1": field.control === "range",
          "gap-2": field.control !== "range",
        })}
      >
        <div className="flex justify-between items-end">
          <label htmlFor={field.id} className="text-xs text-neutral-500">
            {field.title}
          </label>
          {field.control === "range" && (
            <span className="font-mono text-neutral-500/50 text-[12px]">
              {field.value(data)}
            </span>
          )}
        </div>
        {children}
      </div>
    );
  },
  elements: [
    {
      wrapper({ children }) {
        return (
          <Section title="General" key="general">
            {children}
          </Section>
        );
      },
      elements: [
        {
          title: "Background",
          id: "background",
          control: "color",
          value(data) {
            return data.theme.background ?? defaultTheme.background;
          },
          onChange(value) {
            updateThemeEditor({ background: value });
          },
        },
        {
          title: "Font",
          id: "fontFamily",
          control: "fontpicker",
          value(data) {
            return data.theme.fontFamily ?? defaultTheme.fontFamily;
          },
          onChange(value) {
            updateThemeEditor({ fontFamily: value });
          },
        },
      ],
    },
    {
      wrapper({ children }) {
        return (
          <Section title="Layout" key="layout">
            {children}
          </Section>
        );
      },
      elements: [
        {
          id: "layoutName",
          title: "Algorithm",
          control: "select",
          value(data) {
            return data.theme.layoutName;
          },
          onChange(value) {
            updateThemeEditor({ layoutName: value as LayoutName });
          },
          options: [
            { value: "dagre", label: "Dagre" },
            { value: "klay", label: "Klay" },
            { value: "layered", label: "Layered" },
            { value: "mrtree", label: "Tree" },
            { value: "stress", label: "Stress" },
            { value: "radial", label: "Radial" },
            { value: "cose", label: "Cose" },
            { value: "breadthfirst", label: "Breadthfirst" },
            { value: "concentric", label: "Concentric" },
            { value: "circle", label: "Circle" },
          ],
        },
        {
          title: "Direction",
          id: "klayDirection",
          control: "select",
          hidden(data) {
            return !["dagre", "klay", "layered"].includes(
              data.theme.layoutName
            );
          },
          value(data) {
            return data.theme.direction ?? "UNDEFINED";
          },
          onChange(value) {
            updateThemeEditor({ direction: value as Direction });
          },
          options: [
            { label: "Right", value: "RIGHT" },
            { label: "Left", value: "LEFT" },
            { label: "Down", value: "DOWN" },
            { label: "Up", value: "UP" },
          ],
        },
        {
          title: "Spacing",
          id: "spacingFactor",
          control: "range",
          value(data) {
            return data.theme.spacingFactor ?? defaultTheme.spacingFactor;
          },
          onChange(value) {
            updateThemeEditor({ spacingFactor: value });
          },
          min: 0,
          max: 10,
          step: 0.05,
        },
      ],
    },
    {
      wrapper({ children }) {
        return (
          <Section title="Nodes" key="nodes">
            {children}
          </Section>
        );
      },
      elements: [
        {
          title: "Shape",
          id: "shape",
          control: "select",
          value(data) {
            return data.theme.shape ?? defaultTheme.shape;
          },
          onChange(value) {
            updateThemeEditor({ shape: value as Shape });
          },
          options: [
            { label: "Rectangle", value: "rectangle" },
            { label: "Round Rectangle", value: "roundrectangle" },
            { label: "Ellipse", value: "ellipse" },
          ],
        },
        {
          title: "Background",
          id: "nodeBackground",
          control: "color",
          value(data) {
            return data.theme.nodeBackground ?? defaultTheme.nodeBackground;
          },
          onChange(value) {
            updateThemeEditor({ nodeBackground: value });
          },
        },
        {
          title: "Text Color",
          id: "nodeForeground",
          control: "color",
          value(data) {
            return data.theme.nodeForeground ?? defaultTheme.nodeForeground;
          },
          onChange(value) {
            updateThemeEditor({ nodeForeground: value });
          },
        },
        {
          title: "Padding",
          id: "padding",
          control: "range",
          value(data) {
            return data.theme.padding ?? defaultTheme.padding;
          },
          onChange(value) {
            updateThemeEditor({ padding: value });
          },
          min: 0,
          max: 100,
          step: 1,
        },
        {
          title: "Border Width",
          id: "borderWidth",
          control: "range",
          value(data) {
            return data.theme.borderWidth ?? defaultTheme.borderWidth;
          },
          onChange(value) {
            updateThemeEditor({ borderWidth: value });
          },
          min: 0,
          max: 10,
          step: 1,
        },
        {
          title: "Border Color",
          id: "borderColor",
          control: "color",
          value(data) {
            return data.theme.borderColor ?? defaultTheme.borderColor;
          },
          onChange(value) {
            updateThemeEditor({ borderColor: value });
          },
        },
        {
          title: "Text Max Width",
          id: "textMaxWidth",
          control: "range",
          value(data) {
            return data.theme.textMaxWidth ?? defaultTheme.textMaxWidth;
          },
          onChange(value) {
            updateThemeEditor({ textMaxWidth: value });
          },
          min: 0,
          max: 1000,
          step: 1,
        },
        {
          title: "Line Height",
          id: "lineHeight",
          control: "range",
          value(data) {
            return data.theme.lineHeight ?? defaultTheme.lineHeight;
          },
          onChange(value) {
            updateThemeEditor({ lineHeight: value });
          },
          min: 0.8,
          max: 3,
          step: 0.1,
        },
        {
          title: "Text Margin Y",
          id: "textMarginY",
          control: "range",
          value(data) {
            return data.theme.textMarginY ?? defaultTheme.textMarginY;
          },
          onChange(value) {
            updateThemeEditor({ textMarginY: value });
          },
          min: -6,
          max: 6,
          step: 0.25,
        },
        {
          title: "Fix Height",
          id: "useFixedHeight",
          control: "checkbox",
          value(data) {
            return data.theme.useFixedHeight ?? defaultTheme.useFixedHeight;
          },
          onChange(value) {
            updateThemeEditor({ useFixedHeight: value });
          },
        },
        {
          title: "Height",
          id: "fixedHeight",
          control: "range",
          hidden(data) {
            return !data.theme.useFixedHeight;
          },
          value(data) {
            return data.theme.fixedHeight ?? defaultTheme.fixedHeight;
          },
          onChange(value) {
            updateThemeEditor({ fixedHeight: value });
          },
          min: 50,
          max: 200,
          step: 1,
        },
      ],
    },
    {
      wrapper({ children }) {
        return (
          <Section title="Edges" key="edges">
            {children}
          </Section>
        );
      },
      elements: [
        {
          title: "Curve Style",
          id: "curveStyle",
          control: "select",
          value(data) {
            return data.theme.curveStyle ?? defaultTheme.curveStyle;
          },
          onChange(value) {
            updateThemeEditor({ curveStyle: value as CurveStyle });
          },
          options: [
            { label: "Bezier", value: "bezier" },
            { label: "Taxi", value: "taxi" },
          ],
        },
        {
          title: "Edge Width",
          id: "edgeWidth",
          control: "range",
          value(data) {
            return data.theme.edgeWidth ?? defaultTheme.edgeWidth;
          },
          onChange(value) {
            updateThemeEditor({ edgeWidth: value });
          },
          min: 1,
          max: 10,
          step: 1,
        },
        {
          title: "Color",
          id: "edgeColor",
          control: "color",
          value(data) {
            return data.theme.edgeColor ?? defaultTheme.edgeColor;
          },
          onChange(value) {
            updateThemeEditor({ edgeColor: value });
          },
        },
        {
          wrapper({ children }) {
            return (
              <div className="grid grid-cols-2 gap-3" key="arrow">
                {children}
              </div>
            );
          },
          elements: [
            {
              title: "Source Arrow Shape",
              id: "sourceArrowShape",
              control: "select",
              value(data) {
                return (
                  data.theme.sourceArrowShape ?? defaultTheme.sourceArrowShape
                );
              },
              onChange(value) {
                updateThemeEditor({ sourceArrowShape: value as ArrowShape });
              },
              options: [
                { value: "none", label: "None" },
                { value: "triangle", label: "Triangle" },
                { value: "vee", label: "Vee" },
                { value: "triangle-backcurve", label: "Triangle-backcurve" },
                { value: "circle", label: "Circle" },
              ],
            },
            {
              title: "Target Arrow Shape",
              id: "targetArrowShape",
              control: "select",
              value(data) {
                return (
                  data.theme.targetArrowShape ?? defaultTheme.targetArrowShape
                );
              },
              onChange(value) {
                updateThemeEditor({ targetArrowShape: value as ArrowShape });
              },
              options: [
                { value: "none", label: "None" },
                { value: "triangle", label: "Triangle" },
                { value: "vee", label: "Vee" },
                { value: "triangle-backcurve", label: "Triangle-backcurve" },
                { value: "circle", label: "Circle" },
              ],
            },
            {
              title: "Source Distance From Node",
              id: "sourceDistanceFromNode",
              control: "range",
              value(data) {
                return (
                  data.theme.sourceDistanceFromNode ??
                  defaultTheme.sourceDistanceFromNode
                );
              },
              onChange(value) {
                updateThemeEditor({ sourceDistanceFromNode: value });
              },
              min: 0,
              max: 15,
              step: 1,
            },
            {
              title: "Target Distance From Node",
              id: "targetDistanceFromNode",
              control: "range",
              value(data) {
                return (
                  data.theme.targetDistanceFromNode ??
                  defaultTheme.targetDistanceFromNode
                );
              },
              onChange(value) {
                updateThemeEditor({ targetDistanceFromNode: value });
              },
              min: 0,
              max: 15,
              step: 1,
            },
          ],
        },
        {
          title: "Arrow Scale",
          id: "arrowScale",
          control: "range",
          value(data) {
            return data.theme.arrowScale ?? defaultTheme.arrowScale;
          },
          onChange(value) {
            updateThemeEditor({ arrowScale: value });
          },
          min: 0,
          max: 3,
          step: 0.025,
        },
        {
          title: "Edge Text Size",
          id: "edgeTextSize",
          control: "range",
          value(data) {
            return data.theme.edgeTextSize ?? defaultTheme.edgeTextSize;
          },
          onChange(value) {
            updateThemeEditor({ edgeTextSize: value });
          },
          min: 0.5,
          max: 1,
          step: 0.01,
        },
        {
          title: "Rotate Label",
          id: "rotateEdgeLabel",
          control: "checkbox",
          value(data) {
            return data.theme.rotateEdgeLabel ?? defaultTheme.rotateEdgeLabel;
          },
          onChange(value) {
            updateThemeEditor({ rotateEdgeLabel: value });
          },
        },
      ],
    },
    {
      wrapper({ children }) {
        return (
          <Section title="Advanced" key="custom">
            {children}
          </Section>
        );
      },
      // wrapEach: false,
      elements: [
        {
          title: "Custom CSS",
          id: "customCss",
          control: "customCss",
          value(data) {
            return data.theme.custom ?? "";
          },
          onChange(value) {
            updateThemeEditor({ custom: value });
          },
        },
        {
          title: "Use Custom CSS Only",
          id: "customCssOnly",
          control: "checkbox",
          value(data) {
            return data.customCssOnly;
          },
          onChange(value) {
            useDoc.setState((state) => ({
              meta: {
                ...state.meta,
                customCssOnly: value,
              },
            }));
          },
        },
      ],
    },
  ],
});

export function ThemeTab() {
  const theme = useThemeEditor();
  const canEdit = useCanEdit();
  const customCssOnly = useDoc(
    (state) => (state.meta?.customCssOnly as boolean) ?? false
  );
  return (
    <div className="h-full w-full p-4 overflow-auto">
      <p className="text-xs text-neutral-600 mb-6 bg-neutral-100 p-4">
        Use these settings to adapt the look and behavior of your flowcharts
      </p>
      <form className="grid gap-8 pb-10">
        <Form data={{ theme, customCssOnly }} globals={{ canEdit }} />
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h2 className="font-bold text-blue-600 text-base -mb-8 ml-3">{title}</h2>
      <div className="border border-blue-100 rounded-xl relative w-full overflow-hidden">
        <div className="grid gap-4 p-4 content-start">{children}</div>
      </div>
    </>
  );
}
