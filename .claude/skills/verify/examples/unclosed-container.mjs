const markers = (page) =>
  page.evaluate(() =>
    window.monaco.editor
      .getModelMarkers({})
      .map((m) => ({ line: m.startLineNumber, severity: m.severity, message: m.message }))
  );
const WARNING = 4;

export default async ({ page, ff, step, expect }) => {
  step("open the sandbox");
  await ff.open("/");
  await ff.waitForGraph();

  step("type a container; Monaco's auto-inserted } is pushed to the end of the doc");
  await ff.typeDoc("Start\n  Build {\n    Compile\n  Test\n    Done");
  expect(await ff.editorText()).toBe("Start\n  Build {\n    Compile\n  Test\n    Done\n  }");
  const swallowed = await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Done"));
  const build = swallowed.nodes.find((n) => n.label === "Build");
  expect(swallowed.nodes.find((n) => n.label === "Test").parent).toBe(build.id);
  ff.note({ parents: swallowed.nodes.map((n) => [n.label, n.parent]) });

  step("a warning marker sits on the { line and the graph still renders");
  await expect.poll(() => markers(page)).toEqual([
    expect.objectContaining({ line: 2, severity: WARNING }),
  ]);
  ff.note({ markers: await markers(page) });
  expect(await page.locator(".monaco-editor .squiggly-error").count()).toBe(0);
  await ff.shot("warning");

  step("hovering the squiggle shows the message");
  const squiggle = await page.locator(".monaco-editor .squiggly-warning").first().boundingBox();
  await page.mouse.move(squiggle.x + squiggle.width / 2, squiggle.y + squiggle.height / 2);
  await expect(page.locator(".monaco-editor .monaco-hover").first()).toContainText("Container");
  ff.note({ hover: await page.locator(".monaco-editor .monaco-hover").first().textContent() });
  await ff.shot("hover");

  step("move the } up under the container's last child: the warning clears");
  await page.locator(".monaco-editor .view-lines").first().click();
  await page.keyboard.press("ControlOrMeta+End");
  await page.keyboard.press("Alt+ArrowUp");
  await page.keyboard.press("Alt+ArrowUp");
  expect(await ff.editorText()).toBe("Start\n  Build {\n    Compile\n  }\n  Test\n    Done");
  await expect.poll(() => markers(page)).toEqual([]);
  const fixed = await ff.waitForGraph(
    (g) => g.nodes.find((n) => n.label === "Test")?.parent === null
  );
  expect(fixed.nodes.find((n) => n.label === "Compile").parent).toBe(build.id);

  step("delete the } line entirely: the never-closed warning appears on the { line");
  await page.keyboard.press("ControlOrMeta+Shift+KeyK");
  expect(await ff.editorText()).toBe("Start\n  Build {\n    Compile\n  Test\n    Done");
  await expect.poll(() => markers(page)).toEqual([
    expect.objectContaining({ line: 2, severity: WARNING }),
  ]);
  ff.note({ markers: await markers(page) });
  await ff.waitForGraph((g) => g.nodes.some((n) => n.label === "Done"));

  step("undo restores the closing brace and the warning clears");
  await page.keyboard.press("ControlOrMeta+z");
  expect(await ff.editorText()).toBe("Start\n  Build {\n    Compile\n  }\n  Test\n    Done");
  await expect.poll(() => markers(page)).toEqual([]);
  await ff.waitForGraph((g) => g.nodes.find((n) => n.label === "Test")?.parent === null);
  await page.waitForTimeout(1000);
  await ff.shot("closed");

  for (const [doc, inside, outside] of [
    ["Group {\nB\nC\n}\nD", { B: "Group", C: "Group" }, "D"],
    ["Outer {\n  Inner {\n  x\n  }\n}\nY", { Inner: "Outer", x: "Inner" }, "Y"],
  ]) {
    step(`children flush with a correctly closed { line get no warning: ${JSON.stringify(doc)}`);
    await ff.pasteDoc(doc);
    const dismiss = page.getByRole("button", { name: "Dismiss" });
    if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
    await expect.poll(() => ff.editorText()).toBe(doc);
    const g = await ff.waitForGraph((g) => g.nodes.some((n) => n.label === outside));
    const label = Object.fromEntries(g.nodes.map((n) => [n.id, n.label]));
    const parentOf = (name) => label[g.nodes.find((n) => n.label === name).parent] ?? null;
    for (const [child, parent] of Object.entries(inside)) expect(parentOf(child)).toBe(parent);
    expect(parentOf(outside)).toBe(null);
    await page.waitForTimeout(1000);
    expect(await markers(page)).toEqual([]);
    ff.note({ doc, markers: await markers(page) });
    await ff.shot(`flush-${outside}`);
  }
};
