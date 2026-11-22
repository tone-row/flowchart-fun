# DSL style classes are a public API

Status: accepted (2026-11-20)

Users style nodes and edges by typing classes into their chart text, such as `.color_blue`, `.shape_diamond`, `.border_dashed` and `.target-chevron`. Those names are saved inside customer charts, and the Learn Syntax dialog and the AI system prompts teach them. We treat the set of names as a public API with one owner, the catalog in `shared/src/styleClasses.ts`.

## Rules

- Every class that the Learn Syntax dialog or an AI prompt mentions is in the catalog, on the element type the example uses it on. Tests enforce this.
- Every Learn Syntax example parses.
- A built-in class declares the computed style it promises. The app emits built-in rules after template and custom CSS, so they apply under every template. `app/src/lib/styleClassContract.test.ts` renders each class under each template and checks the promise.
- A template-owned class (the `color_*` set) has no fixed value. Every template implements each one, and each must look different from a plain node and from the other colors.
- One name per effect. Edges use `border_solid`, `border_dashed` and `border_dotted`, the same names nodes use. `line_*` is not part of the API.
- A class in the catalog is never removed. Changing how it looks is allowed. Removing one needs a new ADR.

## Why

#756 (November 2024) deleted the per-theme CSS files. Those files held the only rules for the arrow classes and `.line_*`. The Learn Syntax dialog kept teaching them for two years and nothing failed. The characterization tests had pinned the arrow list as "dead exports" and `.border_none` as a landmine, because they compare rule objects rather than what a user sees.

## Considered options

- **Each template owns every class.** Rejected. A template overhaul then drops features silently, which is what happened in #756.
- **Keep `.line_*` as an alias of the edge `border_*` classes.** Rejected. Two names for one effect is one more thing to document and test. `.line_*` has had no effect outside the org-chart template since #756, and `edge.border_*` (added in #618) is the newer, global mechanism.

## Consequences

- A template cannot restyle a built-in class by rule order. It styles elements through its own classes or narrower selectors instead.
- The org-chart template moves from `.line_dotted` to `.border_dotted`.
- The text-size classes (`text-sm`, `text-lg`, `text-xl`) work through node sizing in `getSize.ts`, not the stylesheet, so they are not in the catalog yet.
