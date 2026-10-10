// Two agents drive the pro test account at once. This drive holds a chart of its own while
// examples/hosted-chart.mjs runs as a separate drive (own process, own browser context), then
// runs a drive that throws right after creating a chart. Its own chart must survive the other
// drive's cleanup, and the drive that threw must leave no chart behind.
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRIVE = path.join(HERE, "../scripts/drive.mjs");
const STAMP = Date.now();
const OWN_NAME = `verify ${STAMP} bystander`;
const THROWN_NAME = `cleanup-probe ${STAMP} thrown`;

const throwingDrive = (name) => `
export default async ({ page, ff }) => {
  await ff.login("pro");
  await page.getByTestId("new-chart-link").click();
  await page.getByLabel("Name Chart").fill(${JSON.stringify(name)});
  await page.getByRole("button", { name: "Create" }).click();
  await page.waitForURL(/\\/u\\/\\d+$/);
  throw new Error("deliberate failure right after creating a chart");
};
`;

const runDrive = (file, port) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [DRIVE, file, "--port", port], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => resolve({ code, out }));
  });

export default async ({ page, ff, step, expect }) => {
  const port = new URL(ff.base).port;
  const failures = [];
  const check = async (name, fn) => {
    step(name);
    try {
      await fn();
    } catch (e) {
      failures.push(name);
      ff.note({ failed: name, error: String(e.message).split("\n").slice(0, 4).join(" | ") });
    }
  };
  const idsNamed = async (name) =>
    ((await ff.supabase(`user_charts?name=eq.${encodeURIComponent(name)}&select=id`)).body ?? []).map((r) => r.id);

  await ff.login("pro");
  const userId = await page.evaluate(() => {
    const k = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
    return JSON.parse(localStorage.getItem(k)).user.id;
  });

  let ownId;
  try {
    step("create this drive's own chart");
    const res = await ff.supabase("user_charts", {
      method: "POST",
      body: JSON.stringify({ name: OWN_NAME, chart: "Held\n  Open", user_id: userId }),
    });
    expect(res.status).toBe(201);
    ownId = res.body[0].id;
    ff.note({ ownId, OWN_NAME });

    const swept = (await ff.supabase("user_charts?name=like.verify%20*&select=id")).body.map((r) => r.id);
    if (swept.some((id) => id !== ownId))
      throw new Error(`refusing to run: other 'verify *' charts exist (${swept.join(",")}) and hosted-chart.mjs would sweep them`);

    await check("examples/hosted-chart.mjs runs alongside and passes; this drive's chart survives it", async () => {
      const other = await runDrive(path.join(HERE, "hosted-chart.mjs"), port);
      ff.note({ hostedChart: other.out.split("\n").filter((l) => /^(PASS|FAIL|evidence)/.test(l)) });
      expect(other.code, "hosted-chart.mjs exit code").toBe(0);
      expect(await idsNamed(OWN_NAME), "this drive's chart after the other drive's cleanup").toEqual([ownId]);
    });

    await check("a drive that throws right after creating a chart leaves no chart behind", async () => {
      const file = path.join(ff.out, "throw-after-create.mjs");
      writeFileSync(file, throwingDrive(THROWN_NAME));
      const thrown = await runDrive(file, port);
      ff.note({ thrown: thrown.out.split("\n").filter((l) => /^(PASS|FAIL|evidence)/.test(l)) });
      expect(thrown.code, "the throwing drive fails").toBe(1);
      expect(await idsNamed(THROWN_NAME), "charts left by the drive that threw").toEqual([]);
    });
  } finally {
    const leftovers = [...(ownId ? [ownId] : []), ...(await idsNamed(THROWN_NAME))];
    if (leftovers.length) await ff.supabase(`user_charts?id=in.(${leftovers.join(",")})`, { method: "DELETE" });
  }

  if (failures.length) throw new Error(`${failures.length} check(s) failed: ${failures.join("; ")}`);
};
