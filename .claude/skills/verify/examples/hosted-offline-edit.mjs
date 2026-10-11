const TEXT = "Plan\n  Build\n    Review";
const LAYOUT = { Plan: { x: 0, y: 0 }, Build: { x: 220, y: 140 }, Review: { x: 440, y: 280 } };
const MAP = Object.fromEntries(Object.entries(LAYOUT).map(([label, p], i) => [`n${i + 1}`, { ...p, label }]));
const DOC = `${TEXT}\n=====\n${JSON.stringify({ nodePositions: MAP })}\n=====`;
const DBL = 250;

const textOf = (chart) => chart.split("=====")[0].trim();
const positions = (page) =>
  page.evaluate(() => Object.fromEntries(window.__cy.nodes().map((n) => [n.data("label"), { x: n.position().x, y: n.position().y }])));

async function nodePoint(page, ff, label) {
  const box = await ff.canvas().boundingBox();
  const p = await page.evaluate((l) => window.__cy.nodes().filter((n) => n.data("label") === l)[0]?.renderedPosition(), label);
  if (!p) throw new Error(`no node ${label}`);
  return { x: box.x + p.x, y: box.y + p.y };
}
async function clickBackground(page, ff) {
  const box = await ff.canvas().boundingBox();
  await page.waitForTimeout(DBL + 150);
  await page.mouse.click(box.x + box.width - 5, box.y + box.height - 5);
}
async function drag(page, ff, label, dx, dy) {
  await clickBackground(page, ff);
  const from = await nodePoint(page, ff, label);
  await page.waitForTimeout(DBL + 150);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(from.x + (dx * i) / 8, from.y + (dy * i) / 8);
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
  await page.waitForTimeout(600);
}
async function typeAtLineEnd(page, lineText, s) {
  await page.locator(".monaco-editor .view-line", { hasText: lineText }).first().click();
  await page.keyboard.press("End");
  await page.keyboard.type(s);
}

export default async ({ page, context, ff, step, expect }) => {
  const failures = [];
  const check = async (name, fn) => {
    step(name);
    try {
      await fn();
    } catch (e) {
      failures.push(name);
      ff.note({ failed: name, error: String(e.message).split("\n").slice(0, 8).join(" | ") });
      await ff.shot(`failed-${failures.length}`, page.locator("body")).catch(() => {});
    }
  };

  await ff.login("pro");
  const patches = [];
  page.on("request", (r) => {
    if (r.url().includes("/rest/v1/user_charts") && r.method() === "PATCH") patches.push({ url: r.url(), body: r.postData() ?? "" });
  });
  const patchesTo = (id) => patches.filter((p) => p.url.includes(`id=eq.${id}`));
  const stored = async (id) => textOf((await ff.supabase(`user_charts?id=eq.${id}&select=chart`)).body[0].chart);
  const editor = async () => (await ff.editorText()).trimEnd();
  const notSaved = page.getByRole("img", { name: "Changes not saved" });
  const userId = await page.evaluate(() => {
    const k = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
    return JSON.parse(localStorage.getItem(k)).user.id;
  });
  const createChart = async (suffix) => {
    const res = await ff.supabase("user_charts", {
      method: "POST",
      body: JSON.stringify({ name: ff.chartName(suffix), chart: DOC, user_id: userId }),
    });
    if (res.status !== 201) throw new Error(`create ${suffix}: ${res.status}`);
    return res.body[0].id;
  };
  const open = async (id) => {
    await page.goto(`/u/${id}`);
    await ff.waitForEditor();
    await page.waitForFunction(() => window.__cy && window.__cy.nodes().some((n) => n.data("label").startsWith("Review")));
    await page.waitForTimeout(1500);
  };

  await check("slow load: a duplicate load of the open chart arriving after the user typed does not replace the typing", async () => {
    const id = await createChart("slow-load");
    const loads = (url) => url.pathname.endsWith("/rest/v1/user_charts") && url.searchParams.get("id") === `eq.${id}` && url.searchParams.has("select");
    let seen = 0;
    await page.route(loads, async (route) => {
      seen++;
      if (seen === 1) return route.continue();
      const response = await route.fetch();
      await page.waitForTimeout(5000);
      await route.fulfill({ response });
    });
    await page.goto(`/u/${id}`);
    await ff.waitForEditor();
    await page.waitForFunction(() => window.__cy && window.__cy.nodes().length === 3);
    await page.getByTestId("pro-link").waitFor({ state: "detached" });
    await typeAtLineEnd(page, "Plan", "E");
    await page.waitForTimeout(1500);
    const typed = await editor();
    await page.waitForTimeout(4500);
    await page.unroute(loads);
    const want = TEXT.replace("Plan", "PlanE");
    ff.note({ slowLoad: { loads: seen, typed, editor: await editor(), stored: await stored(id) } });
    expect(typed, "the typing landed before the late load").toBe(want);
    expect(await editor(), "editor keeps the typing").toBe(want);
    await expect.poll(() => stored(id), { message: "stored row has the typing" }).toBe(want);
  });

  await check("reconnect with nothing unsaved: no PATCH, and Cmd+Z still undoes the drag made before the reconnect", async () => {
    const id = await createChart("reconnect");
    await open(id);
    await drag(page, ff, "Build", 0, 90);
    await page.waitForTimeout(2500);
    const n = patchesTo(id).length;
    await context.setOffline(true);
    await page.waitForTimeout(800);
    await context.setOffline(false);
    await page.waitForTimeout(3500);
    expect(patchesTo(id).length - n, "PATCHes sent by reconnecting").toBe(0);
    await clickBackground(page, ff);
    await page.keyboard.press("Meta+z");
    await expect.poll(() => positions(page), { message: "Cmd+Z after reconnect undoes the drag" }).toEqual(LAYOUT);
  });

  await check("offline edit: kept through reconnect, flagged as not saved while offline, saved exactly once back online", async () => {
    const id = await createChart("offline");
    await open(id);
    await context.setOffline(true);
    await page.waitForTimeout(500);
    await typeAtLineEnd(page, "Plan", "OFF");
    await page.waitForTimeout(2500);
    const want = TEXT.replace("Plan", "PlanOFF");
    const offline = { editor: await editor(), notSavedShown: await notSaved.isVisible() };
    await ff.shot("offline-not-saved", page.locator("body"));
    const n = patchesTo(id).length;
    await context.setOffline(false);
    await page.waitForTimeout(4500);
    const after = patchesTo(id).slice(n);
    const facts = { offline, editor: await editor(), stored: await stored(id), patchesAfterReconnect: after.length };
    ff.note({ offlineEdit: facts });
    expect(offline.notSavedShown, "indicator says not saved while the save is failing").toBe(true);
    expect(facts.editor, "editor keeps the offline edit after reconnect").toBe(want);
    expect(facts.stored, "stored row has exactly the offline edit").toBe(want);
    expect(after.length, "one PATCH once back online").toBe(1);
    expect(textOf(JSON.parse(after[0].body).chart)).toBe(want);
    await expect(notSaved).toHaveCount(0);
  });

  await check("blip: a PATCH that fails with no offline event is flagged, and the next edit saves exactly what was typed", async () => {
    const id = await createChart("blip");
    await open(id);
    const writes = (url) => url.pathname.endsWith("/rest/v1/user_charts") && url.searchParams.get("id") === `eq.${id}`;
    await page.route(writes, (route) => (route.request().method() === "PATCH" ? route.abort("internetdisconnected") : route.continue()));
    await typeAtLineEnd(page, "Review", "X");
    await expect(notSaved, "indicator says not saved after the failed PATCH").toBeVisible({ timeout: 5000 });
    await page.unroute(writes);
    const n = patchesTo(id).length;
    await typeAtLineEnd(page, "ReviewX", "Y");
    const want = TEXT.replace("Review", "ReviewXY");
    await expect.poll(() => stored(id), { message: "next edit saves both edits" }).toBe(want);
    await page.waitForTimeout(1500);
    expect(patchesTo(id).length - n, "one PATCH for the next edit").toBe(1);
    expect(await editor()).toBe(want);
    await expect(notSaved).toHaveCount(0);
  });

  await check("online edit: exactly one PATCH per debounce, with exactly the typed text", async () => {
    const id = await createChart("online");
    await open(id);
    const n = patchesTo(id).length;
    await typeAtLineEnd(page, "Build", "Q");
    await page.waitForTimeout(2500);
    const sent = patchesTo(id).slice(n);
    const want = TEXT.replace("Build", "BuildQ");
    expect(sent.length, "PATCHes for one pause in typing").toBe(1);
    expect(textOf(JSON.parse(sent[0].body).chart)).toBe(want);
    expect(await stored(id)).toBe(want);
    await expect(notSaved).toHaveCount(0);
  });

  if (failures.length) throw new Error(`${failures.length} check(s) failed: ${failures.join("; ")}`);
};
