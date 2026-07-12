#!/usr/bin/env node
/**
 * shot.mjs: the FABLE screenshot self-critique harness.
 *
 * Renders a real page in headless Chrome and captures what your eyes need to
 * judge it: desktop AND mobile, scrolled to top / mid / bottom, plus console
 * errors and the document height. The point is not to automate taste; it is to
 * put honest rendered pixels in front of you so you can critique like a hostile
 * art director, then fix and add one upgrade. Run it at least three times per page.
 *
 * SETUP (one time, in the project):
 *   npm i -D puppeteer
 *
 * SERVE the site on a known port (static, no build step needed):
 *   npx serve . -l 4179       # or: python3 -m http.server 4179
 *
 * RUN (do both widths every pass):
 *   node scripts/shot.mjs http://localhost:4179/        shots/home 1440x900
 *   node scripts/shot.mjs http://localhost:4179/        shots/home 390x844
 *   node scripts/shot.mjs http://localhost:4179/degrees shots/deg  1440x900 6000
 *
 * ARGS:
 *   url         required. The page to render.
 *   outPrefix   required. Path prefix for the PNGs (dirs are created).
 *   size        optional "WxH", default 1440x900. Width <= 500 turns on mobile emulation.
 *   settleMs    optional, default 4000. Extra wait after load so WebGL/video settle.
 *               (Heavy 3D scenes render one frame then start their loop ~1.5s in; give them room.)
 *
 * OUTPUT: writes <outPrefix>-<W>x<H>-{top,mid,bottom}.png and prints one JSON line:
 *   {"out":"shots/home","size":"1440x900","docHeight":3834,"errors":[]}
 * A non-empty "errors" array or an unexpected docHeight (e.g. a one-viewport page
 * that should be tall, or a horizontally scrolling one) is a finding to fix.
 *
 * Exit code is non-zero if the page threw console/page errors, so you can gate CI on it.
 */

import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import puppeteer from 'puppeteer';

const [url, outPrefix, sizeArg = '1440x900', settleArg] = process.argv.slice(2);

if (!url || !outPrefix) {
  console.error('Usage: node scripts/shot.mjs <url> <outPrefix> [WxH] [settleMs]');
  process.exit(2);
}

const [w, h] = sizeArg.split('x').map(Number);
if (!w || !h) { console.error(`Bad size "${sizeArg}", expected WxH like 1440x900`); process.exit(2); }
const settleMs = Number(settleArg ?? 4000);
const isMobile = w <= 500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  await mkdir(dirname(outPrefix), { recursive: true }).catch(() => {});

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile, hasTouch: isMobile });

  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => {
    // ignore benign favicon misses; report the rest
    if (!/favicon/.test(r.url())) errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText ?? ''}`);
  });

  // networkidle2 is the stable choice; a looping video can keep networkidle0 from ever firing.
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch {
    // fall back to a plain load if idle never settles (e.g. autoplay loop)
    await page.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(() => {});
  }

  // Let WebGL settle and any render-one-frame-then-loop scene warm up.
  await sleep(settleMs);

  const metrics = await page.evaluate(() => ({
    docHeight: document.documentElement.scrollHeight,
    docWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));

  // Horizontal overflow is a hard failure; surface it as an error line.
  if (metrics.docWidth > metrics.innerWidth + 1) {
    errors.push(`overflow-x: scrollWidth ${metrics.docWidth} > innerWidth ${metrics.innerWidth}`);
  }

  const maxScroll = Math.max(0, metrics.docHeight - h);
  const stops = [
    ['top', 0],
    ['mid', Math.round(maxScroll / 2)],
    ['bottom', maxScroll],
  ];

  const tag = `${w}x${h}`;
  for (const [name, y] of stops) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await sleep(650); // let scroll-driven effects and lazy content react
    await page.screenshot({ path: `${outPrefix}-${tag}-${name}.png` });
  }

  await browser.close();

  console.log(JSON.stringify({ out: outPrefix, size: tag, docHeight: metrics.docHeight, errors }));
  process.exit(errors.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
