import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
async function ready(page) {
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("Comparison ready");
}
for (const width of [1440, 768, 360])
  test(`real simulator and responsive layout at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [],
      requests = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => requests.push(r.url()));
    await ready(page);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("turn");
    await expect(page.locator("#metric-rows tr")).toHaveCount(3);
    await expect(page.locator("#evidence-table tbody tr")).toHaveCount(5);
    await page.locator("#tick").focus();
    await page.locator("#tick").press("End");
    await expect(page.locator("#tick-count")).toHaveText("239 / 239");
    await page.getByLabel("Controller on the map").selectOption("fixed");
    await expect(page.locator("#map-desc")).toContainText("Fixed timer");
    await page.screenshot({
      path: info.outputPath(`phase-${width}.png`),
      fullPage: true,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    expect(
      requests.every(
        (u) =>
          u.startsWith(new URL(page.url()).origin) || u.startsWith("blob:"),
      ),
    ).toBe(true);
  });
test("receipt matches active run with conservation", async ({ page }) => {
  await ready(page);
  await page.getByLabel("What is happening?").selectOption("saturated");
  await page.getByLabel("Traffic seed").fill("10001");
  await page.getByRole("button", { name: "Run comparison" }).click();
  await expect(page.getByRole("status")).toContainText("Comparison ready");
  await expect(page.locator("#active-run")).toContainText("10001");
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download run receipt" }).click();
  const data = JSON.parse(await readFile(await (await dl).path(), "utf8"));
  expect(data.experiment.scenario).toBe("saturated");
  expect(data.experiment.tapeHash).toMatch(/^[a-f0-9]{64}$/);
  for (const m of Object.values(data.metrics)) {
    expect(m.arrived).toBe(m.served + m.dropped + m.remaining);
    expect(m.dropped).toBeGreaterThan(0);
  }
  for (const r of Object.values(data.traces))
    expect(r.frames.every((f) => !f.allRed || f.served === 0)).toBe(true);
});
test("pending form does not relabel completed export", async ({ page }) => {
  await ready(page);
  await page.getByLabel("What is happening?").selectOption("incident");
  const dl = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download comparison notes" }).click();
  const text = await readFile(await (await dl).path(), "utf8");
  expect(text).toContain("Balanced flow");
  expect(text).not.toContain("Scenario: Reduced discharge");
});
test("invalid seed retains prior result", async ({ page }) => {
  await ready(page);
  await page.getByLabel("Traffic seed").fill("-1");
  await page.getByRole("button", { name: "Run comparison" }).click();
  await expect(page.getByRole("status")).toContainText("whole-number seed");
  await expect(page.locator("#active-run")).toContainText("seed 123");
});
test("share URL restores scenario, seed and focus", async ({ page }) => {
  await page.goto("/?scenario=tidal&seed=987&controller=queue");
  await expect(page.getByRole("status")).toContainText("Comparison ready");
  await expect(page.locator("#active-run")).toContainText("987");
  await expect(page.getByLabel("Controller on the map")).toHaveValue("queue");
});
test("replay pauses and resets", async ({ page }) => {
  await ready(page);
  await page.getByRole("button", { name: "Play replay", exact: true }).click();
  await expect.poll(() => page.locator("#tick").inputValue()).not.toBe("0");
  await page.getByRole("button", { name: "Pause replay" }).click();
  const tick = await page.locator("#tick").inputValue();
  await page.waitForTimeout(400);
  expect(await page.locator("#tick").inputValue()).toBe(tick);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator("#tick")).toHaveValue("0");
});
test("tampered policy fails checksum without fabricated results", async ({
  page,
}) => {
  await page.route("**/evidence/policy.json", (r) => r.fulfill({ json: {} }));
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("could not be loaded");
  await expect(page.locator("#results")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Run comparison" }),
  ).toBeDisabled();
});
test("failed evidence degrades explicitly", async ({ page }) => {
  await page.route("**/evidence/evaluation.json", (r) =>
    r.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("could not be loaded");
  await expect(page.locator("#results")).toBeHidden();
});

test("website source identity matches released commit", async ({ request }) => {
  const r = await request.get("/release.json");
  expect(r.ok()).toBe(true);
  const release = await r.json();
  if (process.env.RELEASE_SHA) {
    expect(release.source).toBe(process.env.RELEASE_SHA);
    expect(release.dirty).toBe(false);
  }
  expect(release.tree).toMatch(/^[a-f0-9]{40}$/);
});
