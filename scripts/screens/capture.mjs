// Captures product screenshots for the marketing pages from the real app UI,
// with every /api call answered from fictional fixtures (no backend needed).
//
//   npm run build && npm start      # in one terminal
//   npm run screens                 # all shots
//   npm run screens -- dashboard    # selected shots
//   npm run screens -- --discover   # list the API calls each shot makes
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { USER, findFixture } from './fixtures.mjs';
import { SHOTS } from './shots.mjs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const args = process.argv.slice(2);
const discover = args.includes('--discover');
const only = args.filter((arg) => !arg.startsWith('--'));
const shots = only.length ? SHOTS.filter((shot) => only.includes(shot.name)) : SHOTS;
const SCREENS_DIR = 'src/assets/screens';
const OG_DIR = 'src/assets/og';

await mkdir(SCREENS_DIR, { recursive: true });
await mkdir(OG_DIR, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
  reducedMotion: 'reduce',
  locale: 'en-US',
  timezoneId: 'America/New_York',
});
await context.clock.setFixedTime(new Date('2026-10-20T14:30:00Z'));
await context.addInitScript((user) => {
  localStorage.setItem('reachconvert_user', JSON.stringify(user));
}, USER);

const origin = new URL(BASE_URL).origin;
let calls = [];
const unmatched = new Set();

// Answer every /api path on any host, so the app's ECS failover can never
// reach a real backend, and drop everything else that leaves the local app.
await context.route('**/*', async (route) => {
  const request = route.request();
  const url = new URL(request.url());
  if (url.pathname.startsWith('/api/')) {
    const key = `${request.method()} ${url.pathname}${url.search}`;
    calls.push(key);
    let body = null;
    try {
      body = request.postDataJSON();
    } catch {}
    const hit = findFixture(request.method(), url.pathname, url.searchParams, body);
    if (!hit) {
      unmatched.add(key);
      return route.fulfill({ status: 404, json: { message: 'No fixture' } });
    }
    return route.fulfill({ status: hit.status ?? 200, json: hit.body });
  }
  if (url.origin !== origin) return route.abort();
  return route.continue();
});

for (const shot of shots) {
  calls = [];
  const page = await context.newPage();
  await page.goto(BASE_URL + shot.path, { waitUntil: 'networkidle' });
  if (shot.ready) await page.getByText(shot.ready, { exact: false }).first().waitFor({ timeout: 15000 });
  if (shot.act) await shot.act(page);
  await page.waitForTimeout(800);

  if (discover) {
    console.log(`\n${shot.name} (${shot.path})\n  ${[...new Set(calls)].join('\n  ')}`);
  } else {
    const png = shot.clip ? await page.locator(shot.clip).screenshot() : await page.screenshot();
    await sharp(png).webp({ quality: 82 }).toFile(join(SCREENS_DIR, `${shot.name}.webp`));
    await sharp(png).resize({ width: 1200 }).jpeg({ quality: 82, mozjpeg: true }).toFile(join(OG_DIR, `${shot.name}.jpg`));
    console.log(`saved ${shot.name}`);
  }
  await page.close();
}

await browser.close();

if (unmatched.size) {
  console.error(`\nUnmatched API calls (add fixtures for these):\n  ${[...unmatched].join('\n  ')}`);
  process.exitCode = 1;
}
