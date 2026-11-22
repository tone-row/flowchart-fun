/**
 * STYLE CLASS CONTRACT (docs/adr/0001-dsl-style-classes-are-a-public-api.md)
 *
 * Every class in the catalog (`styleClasses` in shared) is rendered under every
 * template through the app's own style pipeline, and must produce the computed
 * style it promises. Every class the Learn Syntax dialog teaches must be in the
 * catalog. If a template change fails this, the template dropped or overrode a
 * class users already have in their charts.
 */
import cytoscape from "cytoscape";
import {
  BuiltinStyleClass,
  colorClasses,
  styleClasses,
  StyleClassElement,
  templates,
} from "shared";
import { syntaxExamples } from "../components/learnSyntaxExamples";
import { FFTheme } from "./FFTheme";
import { getElements } from "./getElements";
import { getStyleStringFromMeta, preprocessStyle } from "./preprocessStyle";

type TemplateModule = { theme: FFTheme; cytoscapeStyle: string };

const SUBJECT = "subject";
const SUBJECT_EDGE = "subjectEdge";

/**
 * The subject node and edge have the same degrees and labels as the plain
 * ones, so a template's degree or label selectors treat both alike.
 */
function render(name: string, classes: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {
    theme,
    cytoscapeStyle,
  }: TemplateModule = require(`./templates/${name}-template`);
  const { style } = preprocessStyle(
    getStyleStringFromMeta({ themeEditor: theme, cytoscapeStyle })
  );
  const node = (id: string, extra: object = {}) => ({
    data: { id, label: "Step", in_degree: 1, out_degree: 1, ...extra },
  });
  return cytoscape({
    headless: true,
    styleEnabled: true,
    style: style as any,
    elements: [
      node("root", { in_degree: 0 }),
      node("term", { out_degree: 0 }),
      node("plain"),
      node(SUBJECT),
      { data: { id: "e1", source: "root", target: "plain", label: "" } },
      { data: { id: "e2", source: "root", target: SUBJECT, label: "" } },
      { data: { id: "plainEdge", source: "plain", target: "term", label: "" } },
      {
        data: { id: SUBJECT_EDGE, source: SUBJECT, target: "term", label: "" },
      },
    ],
  });
}

function computed(cy: cytoscape.Core, id: string, props: string[]) {
  const el = cy.getElementById(id);
  return props.map((prop) => `${prop}=${el.style(prop)}`).join("; ");
}

const builtins = styleClasses.filter(
  (c): c is BuiltinStyleClass => c.owner === "builtin"
);

const COLOR_PROPS = [
  "background-color",
  "background-gradient-stop-colors",
  "underlay-color",
  "border-color",
  "color",
];

describe.each(templates)("style class contract: %s", (template) => {
  test.each(builtins)("$element .$name", ({ name, element, style }) => {
    const props = Object.keys(style);
    const cy = render(template, []);
    const id = element === "node" ? SUBJECT : SUBJECT_EDGE;
    cy.getElementById(id).addClass(name);
    try {
      expect(computed(cy, id, props)).toBe(
        props.map((prop) => `${prop}=${style[prop]}`).join("; ")
      );
    } finally {
      cy.destroy();
    }
  });

  test("each color class looks different from a plain node and from the other colors", () => {
    const looks: Record<string, string> = {};
    for (const name of colorClasses) {
      const cy = render(template, []);
      looks.plain ??= computed(cy, "plain", COLOR_PROPS);
      cy.getElementById(SUBJECT).addClass(name);
      looks[name] = computed(cy, SUBJECT, COLOR_PROPS);
      cy.destroy();
    }
    const owners = new Map<string, string[]>();
    for (const [name, look] of Object.entries(looks)) {
      owners.set(look, [...(owners.get(look) ?? []), name]);
    }
    const collisions = Array.from(owners.values()).filter((n) => n.length > 1);
    expect(collisions).toEqual([]);
  });
});

/** Classes that Learn Syntax examples define themselves to demonstrate selectors. */
const USER_DEFINED_EXAMPLE_CLASSES = ["animals"];

describe.each(Object.entries(syntaxExamples))(
  "Learn Syntax example %s",
  (_key, code) => {
    const text = code.replace(/<\/?span[^>]*>/g, "");

    test("parses", () => {
      expect(() => getElements(text)).not.toThrow();
    });

    test("uses only catalog classes, on the element type they style", () => {
      const used = getElements(text).flatMap((el) => {
        const element: StyleClassElement =
          "source" in el.data ? "edge" : "node";
        const classes = (el.classes as string | undefined) ?? "";
        return classes
          .split(/[\s.]+/)
          .filter(Boolean)
          .map((name) => `${element} .${name}`);
      });
      const known = new Set([
        ...styleClasses.map((c) => `${c.element} .${c.name}`),
        ...USER_DEFINED_EXAMPLE_CLASSES.flatMap((n) => [
          `node .${n}`,
          `edge .${n}`,
        ]),
      ]);
      expect(used.filter((u) => !known.has(u))).toEqual([]);
    });
  }
);
