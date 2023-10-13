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
  CustomCSSEditor,
} from "./ThemeTabComponents";
import { Trans } from "@lingui/macro";
import { useCanEdit } from "../../lib/hooks";

const createForm = createControls({
  select,
  range,
  text,
  color,
  checkbox,
  fontpicker,
});

const Form = createForm<FFTheme>({
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
            return data.background ?? defaultTheme.background;
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
            return data.fontFamily ?? defaultTheme.fontFamily;
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
            return data.layoutName;
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
            return !["dagre", "klay", "layered"].includes(data.layoutName);
          },
          value(data) {
            return data.direction ?? "UNDEFINED";
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
            return data.spacingFactor ?? defaultTheme.spacingFactor;
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
            return data.shape ?? defaultTheme.shape;
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
            return data.nodeBackground ?? defaultTheme.nodeBackground;
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
            return data.nodeForeground ?? defaultTheme.nodeForeground;
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
            return data.padding ?? defaultTheme.padding;
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
            return data.borderWidth ?? defaultTheme.borderWidth;
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
          hidden(data) {
            return data.borderWidth === 0;
          },
          value(data) {
            return data.borderColor ?? defaultTheme.borderColor;
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
            return data.textMaxWidth ?? defaultTheme.textMaxWidth;
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
            return data.lineHeight ?? defaultTheme.lineHeight;
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
            return data.textMarginY ?? defaultTheme.textMarginY;
          },
          onChange(value) {
            updateThemeEditor({ textMarginY: value });
          },
          min: -6,
          max: 6,
          step: 0.25,
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
            return data.curveStyle ?? defaultTheme.curveStyle;
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
            return data.edgeWidth ?? defaultTheme.edgeWidth;
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
            return data.edgeColor ?? defaultTheme.edgeColor;
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
                return data.sourceArrowShape ?? defaultTheme.sourceArrowShape;
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
                return data.targetArrowShape ?? defaultTheme.targetArrowShape;
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
                  data.sourceDistanceFromNode ??
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
                  data.targetDistanceFromNode ??
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
            return data.arrowScale ?? defaultTheme.arrowScale;
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
            return data.edgeTextSize ?? defaultTheme.edgeTextSize;
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
            return data.rotateEdgeLabel ?? defaultTheme.rotateEdgeLabel;
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
          <Section title="Custom" key="custom">
            {children}
          </Section>
        );
      },
      wrapEach: false,
      elements: [<CustomCSSEditor key="custom-code" />],
    },
  ],
});

export function ThemeTab() {
  const data = useThemeEditor();
  const canEdit = useCanEdit();
  return (
    <div className="h-full w-full p-4 overflow-auto">
      <p className="text-xs text-neutral-600 mb-6 bg-neutral-100 p-4">
        <Trans>
          Use these settings to adapt the look and behavior of your flowcharts
        </Trans>
      </p>
      <form className="grid gap-8 pb-10">
        <Form data={data} globals={{ canEdit }} />
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
