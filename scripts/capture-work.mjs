/**
 * capture-work.mjs — Tier-A work imagery capture.
 *
 *   node scripts/capture-work.mjs                 # all Tier-A entries
 *   node scripts/capture-work.mjs --slug=palava   # one entry
 *   node scripts/capture-work.mjs --list          # show the manifest
 *
 * ⚠️ TIER A ONLY. Tier B is deliberately excluded: for large brands the site
 * live today is almost certainly a later redesign by another agency, and
 * presenting that capture as Coffee Digital's work is a misrepresentation.
 * See pages/work.md → Asset tiers and TBD.md → B3.
 *
 * Output: public/work/<slug>/<slug>-<desktop|mobile>.png
 * Then run scripts/optimise-images.mjs to produce AVIF/WebP derivatives.
 */
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// Playwright is resolved from the npx cache — this machine has no local
// install. Launch uses channel:'chrome' because the cached build expects a
// headless-shell that isn't downloaded. See hand-off.md → Gotchas.
const PW = process.env.PLAYWRIGHT_PATH ?? "playwright";
const { chromium } = await import(PW).then((m) => m.default ?? m);

/** Tier A only — verified live 2026-08-17. */
const TIER_A = [
  { slug: "abbott-smartpack",     url: "https://abbottsmartpack.in/" },
  { slug: "making-india-heart-strong", url: "https://makingindiaheartstrong.com/" },
  { slug: "synergycom",           url: "https://www.synergycom.com/" },
  { slug: "enrituals",            url: "http://coffeedigital.in/enrituals-merge/001-Home-Page.html" },
  { slug: "pronto-insurance",     url: "https://www.prontoinsurance.com/" },
  { slug: "uncle-sams-kitchen",   url: "https://www.unclesamskitchen.com/" },
  { slug: "electrotherm",         url: "http://www.electrotherm.com/" },
  { slug: "motorola",             url: "http://coffeedigital.in/moto/" },
  { slug: "lodha-palava",         url: "https://www.palava.in/" },
  { slug: "fevicol-design-ideas", url: "https://www.fevicoldesignideas.com/" },
  { slug: "indiabulls-foundation", url: "https://www.indiabullsfoundation.com/" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, dpr: 2 },
  { name: "mobile",  width: 390,  height: 844, dpr: 2 },
];

const OUT_ROOT = "public/work";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--slug="))?.split("=")[1];

if (args.includes("--list")) {
  console.log(`Tier A — ${TIER_A.length} entries`);
  for (const t of TIER_A) console.log(`  ${t.slug.padEnd(28)} ${t.url}`);
  process.exit(0);
}

const targets = only ? TIER_A.filter((t) => t.slug === only) : TIER_A;
if (!targets.length) {
  console.error(`No Tier-A entry matching --slug=${only}. Run --list to see them.`);
  process.exit(1);
}

const browser = await chromium.launch({ channel: "chrome" });
let ok = 0;
let failed = [];

for (const { slug, url } of targets) {
  const dir = join(OUT_ROOT, slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.dpr,
      isMobile: vp.name === "mobile",
      hasTouch: vp.name === "mobile",
    });
    const page = await ctx.newPage();
    try {
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      } catch {
        // networkidle never settles on sites with polling or long-lived
        // connections — fall back rather than lose the capture entirely.
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      }
      await sleep(2500);

      // Walk the page before capturing. Scroll-animated sites keep elements
      // hidden until their trigger fires, so a naive screenshot records the
      // pre-animation state. Return to top before shooting.
      await page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y < h; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 55));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 700));
      });

      const file = join(dir, `${slug}-${vp.name}.png`);
      await page.screenshot({ path: file });
      console.log(`  ✓ ${slug} ${vp.name}`);
      ok++;
    } catch (err) {
      console.error(`  ✗ ${slug} ${vp.name} — ${err.message}`);
      failed.push(`${slug}/${vp.name}`);
    } finally {
      await ctx.close();
    }
  }
}

await browser.close();

console.log(`\n${ok} captured, ${failed.length} failed`);
if (failed.length) {
  console.log(`failed: ${failed.join(", ")}`);
  console.log(`A dead Tier-A URL means the tier is wrong — recheck it against pages/work.md.`);
  process.exit(1);
}
console.log(`Next: node scripts/optimise-images.mjs`);
