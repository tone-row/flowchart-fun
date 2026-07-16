import {
  shapes,
  smartShapes,
  createSmartShapeClasses,
  childlessShapeClasses,
  createSmartChildlessBorderClasses,
  nodeBorderClasses,
  edgeStyleClasses,
  sourceArrowSuffixes,
  targetArrowSuffixes,
} from "./graphUtilityClasses";

/**
 * Characterization tests for graphUtilityClasses.
 *
 * These lock down the CURRENT generated "postStyle" Cytoscape utility
 * stylesheets so any drift is caught during a future framework migration.
 * They assert ACTUAL output, not ideal output.
 */

describe("graphUtilityClasses characterization", () => {
  describe("shapes (raw input array)", () => {
    it("is the exact ordered list of 20 shape names", () => {
      // CHARACTERIZATION: documents current behavior, may be a bug.
      // Note duplicate roundrectangle (idx 1) vs round-rectangle (idx 16),
      // and @ts-ignore'd "right-rhomboid". A dedupe would silently drop a
      // customer-facing class name.
      expect(shapes).toEqual([
        "rectangle",
        "roundrectangle",
        "ellipse",
        "triangle",
        "pentagon",
        "hexagon",
        "heptagon",
        "octagon",
        "star",
        "barrel",
        "diamond",
        "vee",
        "rhomboid",
        "right-rhomboid",
        "polygon",
        "tag",
        "round-rectangle",
        "cut-rectangle",
        "bottom-round-rectangle",
        "concave-hexagon",
      ]);
      expect(shapes).toHaveLength(20);
    });

    it("contains both roundrectangle and round-rectangle (no dedupe)", () => {
      expect(shapes).toContain("roundrectangle");
      expect(shapes).toContain("round-rectangle");
    });
  });

  describe("smartShapes (1:1 aspect-ratio mapping)", () => {
    it("maps 9 className->coreShape pairs with the rename of square/roundsquare/circle", () => {
      expect(smartShapes).toEqual([
        { coreShape: "rectangle", className: "square" },
        { coreShape: "roundrectangle", className: "roundsquare" },
        { coreShape: "ellipse", className: "circle" },
        { coreShape: "star", className: "star" },
        { coreShape: "diamond", className: "diamond" },
        { coreShape: "pentagon", className: "pentagon" },
        { coreShape: "hexagon", className: "hexagon" },
        { coreShape: "heptagon", className: "heptagon" },
        { coreShape: "octagon", className: "octagon" },
      ]);
      expect(smartShapes).toHaveLength(9);
    });
  });

  describe("childlessShapeClasses (module-load-time built array)", () => {
    it("snapshots the full 21-rule array including the appended iso-trapezoid", () => {
      // CHARACTERIZATION: the 21st entry (iso-trapezoid) is appended via
      // .push() mutation at import time. The double spaces in the
      // shape-polygon-points string are load-bearing for the snapshot.
      expect(childlessShapeClasses).toMatchSnapshot();
    });

    it("has exactly 21 rules (20 shapes + appended iso-trapezoid)", () => {
      expect(childlessShapeClasses).toHaveLength(21);
    });

    it("emits one ':childless.shape_<shape>' selector per shape, shape-only css", () => {
      // First 20 entries mirror `shapes`
      shapes.forEach((shape, i) => {
        expect(childlessShapeClasses[i]).toEqual({
          selector: `:childless.shape_${shape}`,
          css: { shape },
        });
      });
    });

    it("appends the iso-trapezoid polygon rule with exact double-spaced points", () => {
      // CHARACTERIZATION: exact string with double spaces is intentional to pin.
      expect(childlessShapeClasses[20]).toEqual({
        selector: ":childless.shape_iso-trapezoid",
        css: {
          shape: "polygon",
          "shape-polygon-points": "-1 1  1 1  0.5 -1  -0.5 -1",
        },
      });
    });
  });

  describe("createSmartShapeClasses(width)", () => {
    it("returns 9 rules with width === height === arg (1:1 aspect)", () => {
      const result = createSmartShapeClasses(30);
      expect(result).toHaveLength(9);
      result.forEach((rule) => {
        expect((rule.css as any).width).toBe(30);
        expect((rule.css as any).height).toBe(30);
      });
    });

    it("uses ':childless.shape_<className>' selectors mapped to coreShape", () => {
      const result = createSmartShapeClasses(42);
      expect(result.map((r) => r.selector)).toEqual([
        ":childless.shape_square",
        ":childless.shape_roundsquare",
        ":childless.shape_circle",
        ":childless.shape_star",
        ":childless.shape_diamond",
        ":childless.shape_pentagon",
        ":childless.shape_hexagon",
        ":childless.shape_heptagon",
        ":childless.shape_octagon",
      ]);
      // rename mapping: square->rectangle, roundsquare->roundrectangle, circle->ellipse
      expect((result[0].css as any).shape).toBe("rectangle");
      expect((result[1].css as any).shape).toBe("roundrectangle");
      expect((result[2].css as any).shape).toBe("ellipse");
    });

    it("passes width through as a raw number (not a px string)", () => {
      // CHARACTERIZATION: a migration to a unit-string stylesheet system
      // would silently break sizing if it expected "30px".
      const result = createSmartShapeClasses(30);
      expect(typeof (result[0].css as any).width).toBe("number");
    });

    it("snapshots full output for a representative width", () => {
      expect(createSmartShapeClasses(30)).toMatchSnapshot();
    });
  });

  describe("createSmartChildlessBorderClasses(width)", () => {
    it("returns 5 rules setting border-width=width for EVERY border including none", () => {
      // CHARACTERIZATION: LANDMINE — border_none gets border-width:<width>,
      // NOT 0. border-style is set to the literal border name ("none", etc).
      const result = createSmartChildlessBorderClasses(5);
      expect(result).toHaveLength(5);
      result.forEach((rule) => {
        expect((rule.css as any)["border-width"]).toBe(5);
      });
    });

    it("border_none sets border-style:'none' AND border-width:5 (not 0)", () => {
      const result = createSmartChildlessBorderClasses(5);
      const none = result.find((r) => r.selector === ":childless.border_none");
      expect(none).toEqual({
        selector: ":childless.border_none",
        css: {
          "border-width": 5,
          "border-style": "none",
        },
      });
    });

    it("emits border selectors in order none/solid/dashed/dotted/double", () => {
      const result = createSmartChildlessBorderClasses(5);
      expect(result.map((r) => r.selector)).toEqual([
        ":childless.border_none",
        ":childless.border_solid",
        ":childless.border_dashed",
        ":childless.border_dotted",
        ":childless.border_double",
      ]);
    });

    it("snapshots full output for a representative width", () => {
      expect(createSmartChildlessBorderClasses(5)).toMatchSnapshot();
    });
  });

  describe("nodeBorderClasses (dead export, conflicting semantics)", () => {
    it("snapshots the 5-rule array", () => {
      // CHARACTERIZATION: this export is imported nowhere in app code.
      expect(nodeBorderClasses).toMatchSnapshot();
    });

    it("sets border-width:0 for border_none (contradicts the active factory)", () => {
      // CHARACTERIZATION: LANDMINE — unused nodeBorderClasses sets width:0 for
      // none, while the wired-up createSmartChildlessBorderClasses sets width:<width>.
      const none = nodeBorderClasses.find(
        (r) => r.selector === ":childless.border_none"
      );
      expect(none).toEqual({
        selector: ":childless.border_none",
        css: { "border-width": 0 },
      });
    });

    it("has 5 rules: solid/dashed/dotted/double (border-style only) + none (border-width:0)", () => {
      expect(nodeBorderClasses).toHaveLength(5);
      expect(nodeBorderClasses.map((r) => r.selector)).toEqual([
        ":childless.border_solid",
        ":childless.border_dashed",
        ":childless.border_dotted",
        ":childless.border_double",
        ":childless.border_none",
      ]);
    });
  });

  describe("edgeStyleClasses", () => {
    it("maps 3 edge.border_* selectors to line-style", () => {
      expect(edgeStyleClasses).toEqual([
        { selector: "edge.border_dashed", css: { "line-style": "dashed" } },
        { selector: "edge.border_dotted", css: { "line-style": "dotted" } },
        { selector: "edge.border_solid", css: { "line-style": "solid" } },
      ]);
    });
  });

  describe("sourceArrowSuffixes / targetArrowSuffixes (dead exports)", () => {
    it("sourceArrowSuffixes is the 12 'source-' prefixed strings", () => {
      // CHARACTERIZATION: imported nowhere; pinned so a migration drops them intentionally.
      expect(sourceArrowSuffixes).toEqual([
        "source-triangle",
        "source-triangle-tee",
        "source-circle-triangle",
        "source-triangle-cross",
        "source-triangle-backcurve",
        "source-vee",
        "source-tee",
        "source-square",
        "source-circle",
        "source-diamond",
        "source-chevron",
        "source-none",
      ]);
      expect(sourceArrowSuffixes).toHaveLength(12);
    });

    it("targetArrowSuffixes is the 12 'target-' prefixed strings", () => {
      expect(targetArrowSuffixes).toEqual([
        "target-triangle",
        "target-triangle-tee",
        "target-circle-triangle",
        "target-triangle-cross",
        "target-triangle-backcurve",
        "target-vee",
        "target-tee",
        "target-square",
        "target-circle",
        "target-diamond",
        "target-chevron",
        "target-none",
      ]);
      expect(targetArrowSuffixes).toHaveLength(12);
    });
  });
});
