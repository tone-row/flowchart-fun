import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DRIVE = path.join(HERE, "../scripts/drive.mjs");

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
    child.on("close", (code) => {
      const evidence = out.match(/^evidence: (.+)$/m)?.[1];
      const result = evidence && JSON.parse(readFileSync(path.join(HERE, "../../../..", evidence, "result.json"), "utf8"));
      resolve({ code, summary: out.split("\n").filter((l) => /^(PASS|FAIL|evidence)/.test(l)), charts: result?.charts });
    });
  });

export default async ({ page, ff, step, expect }) => {
  const OWN_NAME = ff.chartName("bystander");
  const THROWN_NAME = ff.chartName("thrown");
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
  const chartIds = async (filter) => (await ff.supabase(`user_charts?${filter}&select=id`)).body.map((r) => r.id);
  const idsNamed = (name) => chartIds(`name=eq.${encodeURIComponent(name)}`);

  await ff.login("pro");
  const userId = await page.evaluate(() => {
    const k = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k));
    return JSON.parse(localStorage.getItem(k)).user.id;
  });

  try {
    step("create this drive's own chart");
    const res = await ff.supabase("user_charts", {
      method: "POST",
      body: JSON.stringify({ name: OWN_NAME, chart: "Held\n  Open", user_id: userId }),
    });
    expect(res.status).toBe(201);
    const ownId = res.body[0].id;
    ff.note({ ownId, OWN_NAME });

    await check("examples/hosted-chart.mjs runs alongside and passes; this drive's chart survives it", async () => {
      const other = await runDrive(path.join(HERE, "hosted-chart.mjs"), port);
      ff.note({ hostedChart: other.summary, charts: other.charts });
      expect(other.code, "hosted-chart.mjs exit code").toBe(0);
      expect(await idsNamed(OWN_NAME), "this drive's chart after the other drive's cleanup").toEqual([ownId]);
      expect(other.charts.created, "charts the other drive created").toHaveLength(1);
      expect(other.charts.deleted, "the other drive deleted exactly what it created").toEqual(other.charts.created);
      expect(await chartIds(`id=in.(${other.charts.created})`), "the other drive's chart after its run").toEqual([]);
    });

    await check("a drive that throws right after creating a chart leaves no chart behind", async () => {
      const file = path.join(ff.out, "throw-after-create.mjs");
      writeFileSync(file, throwingDrive(THROWN_NAME));
      const thrown = await runDrive(file, port);
      ff.note({ thrown: thrown.summary, charts: thrown.charts });
      expect(thrown.code, "the throwing drive fails").toBe(1);
      expect(thrown.charts.created, "charts the throwing drive created").toHaveLength(1);
      expect(thrown.charts.deleted, "the harness deleted it although the drive threw").toEqual(thrown.charts.created);
      expect(await idsNamed(THROWN_NAME), "charts left by the drive that threw").toEqual([]);
    });
  } finally {
    const leftovers = await idsNamed(THROWN_NAME);
    if (leftovers.length) await ff.supabase(`user_charts?id=in.(${leftovers})`, { method: "DELETE" });
  }

  if (failures.length) throw new Error(`${failures.length} check(s) failed: ${failures.join("; ")}`);
};
