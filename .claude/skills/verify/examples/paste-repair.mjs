// Sandbox paste: a pasted line is escaped only when it is broken where it lands.
export default async ({ page, ff, step, expect }) => {
  const paste = async (text) => {
    await page.evaluate((t) => navigator.clipboard.writeText(t), text);
    await page.keyboard.press("ControlOrMeta+v");
  };

  step("paste an edge label onto an indented line under a parent");
  await ff.open("/");
  await ff.typeDoc("Parent\n  ");
  await paste("Test: test .test");
  await expect.poll(() => ff.editorText()).toBe("Parent\n  Test: test .test");
  const g = await ff.waitForGraph((g) => g.edges.length === 1);
  expect(g.edges[0]).toMatchObject({ source: "Parent", target: "test", label: "Test" });
  await ff.shot("edge-label-pasted", ff.canvas());

  step("an orphan edge label pasted at the top level is still escaped");
  await ff.typeDoc("");
  await paste("Test: test");
  await expect.poll(() => ff.editorText()).toBe("Test\\: test");

  step("a pre-existing error elsewhere does not get the paste escaped");
  await ff.typeDoc("Orphan: x\nParent\n  ");
  await paste("Test: test");
  await expect.poll(() => ff.editorText()).toBe("Orphan: x\nParent\n  Test: test");

  step("parens pasted under a parent are still escaped");
  await ff.typeDoc("Parent\n  ");
  await paste("call (foo)");
  await expect.poll(() => ff.editorText()).toBe("Parent\n  call \\(foo\\)");
};
