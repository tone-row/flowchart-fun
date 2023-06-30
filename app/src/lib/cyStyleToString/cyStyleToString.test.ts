import { cyStyleToString } from "./cyStyleToString";
import fixture from "./fixture.json";
import theme from "./fixture-theme.json";

describe("cyStyleToString", () => {
  test("returns a string", () => {
    expect(typeof cyStyleToString(fixture as any)).toBe("string");
  });

  test("returns a style string", () => {
    expect(cyStyleToString(fixture as any))
      .toBe(`:parent { shape: rectangle; background-color: rgb(238,238,238); padding: 10px; border-color: rgb(204,204,204); border-width: 1px; text-valign: top; text-halign: center; text-margin-y: -6px; text-wrap: none; color: rgb(0,0,0); }
edge { width: 0.75px; font-size: 10px; loop-direction: 0deg; loop-sweep: 20deg; text-background-opacity: 1; text-background-color: rgb(255,255,255); text-background-padding: 3px; line-color: rgb(0,0,0); target-arrow-color: rgb(0,0,0); source-arrow-color: rgb(0,0,0); target-arrow-shape: triangle; arrow-scale: 1; curve-style: bezier; label: data(label); color: rgb(0,0,0); text-valign: center; text-wrap: wrap; font-family: Karla; text-halign: center; text-rotation: autorotate; target-distance-from-node: 1px; source-distance-from-node: 0px; }
:loop { curve-style: bezier; }
edge:compound { curve-style: bezier; source-endpoint: outside-to-line; target-endpoint: outside-to-line; }
:selected { background-color: rgb(1,105,217); line-color: rgb(1,105,217); source-arrow-color: rgb(1,105,217); mid-source-arrow-color: rgb(1,105,217); target-arrow-color: rgb(1,105,217); mid-target-arrow-color: rgb(1,105,217); }
:parent:selected { background-color: rgb(204,225,249); border-color: rgb(174,200,229); }
:active { overlay-padding: 10px; overlay-color: rgb(0,0,0); overlay-opacity: 0.25; }
.nodeHovered, .edgeHovered, node:selected { underlay-opacity: 0.1; underlay-color: rgb(0,0,0); underlay-padding: 5px; }
node { font-size: 10px; font-family: Karla; background-color: rgb(255,255,255); border-color: rgb(0,0,0); color: rgb(0,0,0); label: data(label); text-wrap: wrap; text-max-width: data(width); padding: 6px; text-valign: center; text-halign: center; border-width: 0.75px; shape: rectangle; line-height: 1.25; }
node[label!=''] { width: data(shapeWidth); height: data(shapeHeight); text-margin-y: data(textMarginY); text-margin-x: data(textMarginX); }
node.black { background-color: rgb(0,0,0); background-opacity: 1; border-color: rgb(0,0,0); color: rgb(255,255,255); }
node.white { background-color: rgb(255,255,255); background-opacity: 1; border-color: rgb(255,255,255); color: rgb(0,0,0); }
node.green { background-color: rgb(1,216,87); background-opacity: 1; border-color: rgb(0,0,0); color: rgb(0,0,0); }
node.yellow { background-color: rgb(255,207,13); background-opacity: 1; border-color: rgb(0,0,0); color: rgb(0,0,0); }
node.blue { background-color: rgb(97,114,249); background-opacity: 1; border-color: rgb(0,0,0); color: rgb(255,255,255); }
node.orange { background-color: rgb(255,112,68); background-opacity: 1; border-color: rgb(0,0,0); color: rgb(0,0,0); }
node.purple { background-color: rgb(164,146,255); background-opacity: 1; border-color: rgb(0,0,0); color: rgb(0,0,0); }
node.red { background-color: rgb(250,35,35); background-opacity: 1; border-color: rgb(0,0,0); color: rgb(0,0,0); }
node.gray { background-color: rgb(170,170,170); background-opacity: 1; border-color: rgb(0,0,0); color: rgb(0,0,0); }
.rectangle { shape: rectangle; }
.roundrectangle { shape: roundrectangle; }
.ellipse { shape: ellipse; }
.triangle { shape: triangle; }
.pentagon { shape: pentagon; }
.hexagon { shape: hexagon; }
.heptagon { shape: heptagon; }
.octagon { shape: octagon; }
.star { shape: star; }
.barrel { shape: barrel; }
.diamond { shape: diamond; }
.vee { shape: vee; }
.rhomboid { shape: rhomboid; }
.right-rhomboid { shape: right-rhomboid; }
.polygon { shape: polygon; }
.tag { shape: tag; }
.round-rectangle { shape: round-rectangle; }
.cut-rectangle { shape: cut-rectangle; }
.bottom-round-rectangle { shape: bottom-round-rectangle; }
.concave-hexagon { shape: concave-hexagon; }
.circle { shape: ellipse; height: data(width); }
edge.dashed { line-style: dashed; }
edge.dotted { line-style: dotted; }
edge.solid { line-style: solid; }
edge.source-triangle { source-arrow-shape: triangle; }
edge.target-triangle { target-arrow-shape: triangle; }
edge.source-triangle-tee { source-arrow-shape: triangle-tee; }
edge.target-triangle-tee { target-arrow-shape: triangle-tee; }
edge.source-circle-triangle { source-arrow-shape: circle-triangle; }
edge.target-circle-triangle { target-arrow-shape: circle-triangle; }
edge.source-triangle-cross { source-arrow-shape: triangle-cross; }
edge.target-triangle-cross { target-arrow-shape: triangle-cross; }
edge.source-triangle-backcurve { source-arrow-shape: triangle-backcurve; }
edge.target-triangle-backcurve { target-arrow-shape: triangle-backcurve; }
edge.source-vee { source-arrow-shape: vee; }
edge.target-vee { target-arrow-shape: vee; }
edge.source-tee { source-arrow-shape: tee; }
edge.target-tee { target-arrow-shape: tee; }
edge.source-square { source-arrow-shape: square; }
edge.target-square { target-arrow-shape: square; }
edge.source-circle { source-arrow-shape: circle; }
edge.target-circle { target-arrow-shape: circle; }
edge.source-diamond { source-arrow-shape: diamond; }
edge.target-diamond { target-arrow-shape: diamond; }
edge.source-chevron { source-arrow-shape: chevron; }
edge.target-chevron { target-arrow-shape: chevron; }
edge.source-none { source-arrow-shape: none; }
edge.target-none { target-arrow-shape: none; }
node.border-solid { border-style: solid; }
node.border-dashed { border-style: dashed; }
node.border-dotted { border-style: dotted; }
node.border-double { border-style: double; }
node.border-none { border-width: 0px; }
.text-sm { font-size: 7.5px; }
.text-lg { font-size: 15px; }
.text-xl { font-size: 20px; }
node[w] { width: data(w); }
node[h] { height: data(h); }
node[src] { background-image: data(src); background-fit: cover; border-width: 0px; text-valign: bottom; text-margin-y: 5px; }`);
  });

  test("returns the right theme result", () => {
    expect(cyStyleToString(theme as any)).toBe(``);
  });
});
