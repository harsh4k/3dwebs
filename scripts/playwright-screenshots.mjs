import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

await mkdir("scripts/out", { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/work", { waitUntil: "networkidle" });
await page.screenshot({ path: "scripts/out/work-grid.png", fullPage: true });
await page.goto("http://localhost:3000/work?case=abbott-smartpack", { waitUntil: "networkidle" });
await page.locator("dialog").waitFor({ state: "visible" });
await page.screenshot({ path: "scripts/out/work-case.png" });
await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "scripts/out/home-hero.png" });
console.log("screenshots written to scripts/out");
await browser.close();
