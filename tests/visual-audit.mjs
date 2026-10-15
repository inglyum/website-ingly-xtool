#!/usr/bin/env node
/**
 * INGLY browser-based responsive visual audit.
 * Run locally after `npm install --no-save playwright` and
 * `npx playwright install chromium`, with the dev server on port 8080.
 * Artifacts are evidence, not a claim of real-device certification.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.env.INGLY_TEST_URL || 'http://127.0.0.1:8080';
const out = process.env.INGLY_VISUAL_OUTPUT || 'artifacts/visual-audit';
const routes = [
  { name: 'home', path: '/' },
  { name: 'shop', path: '/shop/' },
  { name: 'personalizza', path: '/personalizza/' },
  { name: 'macchine', path: '/macchine/' },
  { name: 'admin', path: '/admin.html' },
  { name: 'admin-media', path: '/admin.html' },
  { name: 'product-with-photo', path: '/product/1/' },
  { name: 'product-without-photo', path: '/product/9/' },
];
const widths = [320, 390, 768, 1440];
const modes = ['dark', 'light'];
const findings = [];
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  for (const route of routes) {
    for (const width of widths) {
      for (const mode of modes) {
        const context = await browser.newContext({
          viewport: { width, height: width < 600 ? 780 : 900 },
          reducedMotion: 'reduce',
          deviceScaleFactor: 1,
          locale: 'it-IT',
        });
        await context.addInitScript(value => {
          try { localStorage.setItem('ingly_mode', value); } catch {}
        }, mode);
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        let status;
        try {
          const response = await page.goto(root + route.path, { waitUntil: 'domcontentloaded', timeout: 25000 });
          status = response?.status();
          // The introductory laser loader lasts longer than 900ms. A screenshot
          // of that overlay is NOT a valid visual audit of Home or Shop.
          const skip=page.locator('#atelierLoaderSkip');
          if(await skip.count() && await skip.isVisible()){
            await skip.click({timeout:3500});
            await page.waitForFunction(()=>{
              const loader=document.getElementById('loader');
              return !loader || loader.hidden || getComputedStyle(loader).display==='none';
            },undefined,{timeout:8000});
          }
          await page.waitForTimeout(250);
          if (route.name === 'admin-media') {
            await page.waitForFunction(() => !!window.PHOTO_QUEUE &&
              !!document.querySelector('#v-dash.on .dcard'), undefined, {timeout:15000});
            await page.evaluate(() => go('media'));
            await page.waitForFunction(() => !!document.querySelector('#v-media.on') &&
              !!document.querySelector('#mPhotoQueue .photo-queue-row'), undefined, {timeout:10000});
          }
          if (route.name.startsWith('product-')) {
            await page.waitForFunction(() => !!document.querySelector('#page-product.active') &&
              !!document.querySelector('#ppName')?.textContent?.trim(), undefined, { timeout: 12000 });
          }
          const metrics = await page.evaluate(() => {
            const nav = document.querySelector('#nav .nav-in');
            const navRect = nav?.getBoundingClientRect();
            const wordmark = document.querySelector('#nav .brand-wordmark');
            const burger = document.querySelector('#nav .burger');
            const title = document.querySelector('#page-macchine > .phero > h1.h2');
            const titleRect = title?.getBoundingClientRect();
            const visible = el => !!el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
            return {
              pathname: location.pathname,
              loaderVisible: (()=>{const x=document.getElementById('loader');return !!x&&!x.hidden&&getComputedStyle(x).display!=='none'&&getComputedStyle(x).visibility!=='hidden'})(),
              mode: document.documentElement.getAttribute('data-mode'),
              viewport: window.innerWidth,
              documentWidth: document.documentElement.scrollWidth,
              navWidth: navRect?.width ?? null,
              navLeft: navRect?.left ?? null,
              navRight: navRect?.right ?? null,
              wordmarkLoaded: wordmark ? wordmark.complete && wordmark.naturalWidth > 0 : null,
              wordmarks: document.querySelectorAll('#nav .brand-lockup img').length,
              burgerVisible: visible(burger) && burger.getBoundingClientRect().width > 0,
              titleRight: visible(title) ? titleRect?.right : null,
              titleLeft: visible(title) ? titleRect?.left : null,
              titleVisible: visible(title),
              productImages: document.querySelectorAll('#ppArt img.pimgph').length,
              productImageSrc: document.querySelector('#ppArt img.pimgph')?.getAttribute('src') ?? null,
              productMissingLabel: !!document.querySelector('#ppArt .pp-photo-label'),
              productGalleryArrowsVisible: Array.from(document.querySelectorAll('#page-product .gal-arrow')).some(visible),
              adminMediaVisible: !!document.querySelector('#v-media.on'),
              adminPhotoQueueRows: document.querySelectorAll('#mPhotoQueue .photo-queue-row').length,
              adminPhotoStats: document.querySelector('#mPhotoStats')?.textContent?.slice(0,180)||'',

              overflowCandidates: Array.from(document.body.querySelectorAll('*'))
                .filter(el => {
                  const rect = el.getBoundingClientRect();
                  const css = getComputedStyle(el);
                  return rect.width > 0 && rect.right > window.innerWidth + 3 &&
                    css.display !== 'none' && css.visibility !== 'hidden' &&
                    css.position !== 'fixed';
                })
                .slice(0, 12)
                .map(el => {
                  const rect = el.getBoundingClientRect();
                  return { tag: el.tagName.toLowerCase(), id: el.id,
                    className: typeof el.className === 'string' ? el.className.slice(0, 90) : '',
                    left: Math.round(rect.left), right: Math.round(rect.right),
                    width: Math.round(rect.width), minWidth: getComputedStyle(el).minWidth };
                }),
            };
          });
          const problems = [];
          if (!status || status >= 400) problems.push('HTTP ' + status);
          if(metrics.loaderVisible)problems.push('intro loader still covering page after skip');
          if (metrics.mode !== mode) problems.push('theme mismatch: ' + metrics.mode);
          if (!route.name.startsWith('admin')) {
            if (metrics.navWidth === null || metrics.navWidth < width * 0.75)
              problems.push('navbar compressed/absent: width ' + metrics.navWidth);
            if (metrics.wordmarks !== 1) problems.push('header wordmark count ' + metrics.wordmarks);
            if (metrics.wordmarkLoaded !== true) problems.push('header wordmark did not load');
            if (width <= 390 && !metrics.burgerVisible) problems.push('mobile menu button not visible');
          }
          if (route.name === 'macchine' && metrics.titleVisible &&
              (metrics.titleLeft < -2 || metrics.titleRight > width + 2))
            problems.push('machine heading clipped horizontally');
          if (route.name === 'admin-media' &&
              (!metrics.adminMediaVisible || metrics.adminPhotoQueueRows === 0 ||
               !metrics.adminPhotoStats.includes('prodotti pubblici')))
            problems.push('admin missing-photo worklist unavailable');
          if (route.name === 'product-with-photo') {
            if (metrics.productImages < 1 || !metrics.productImageSrc || metrics.productMissingLabel)
              problems.push('existing product photograph missing in detail view');
          }
          if (route.name === 'product-without-photo') {
            if (metrics.productImages !== 0 || !metrics.productMissingLabel || metrics.productGalleryArrowsVisible)
              problems.push('unphotographed product uses a broken image or unusable gallery controls');
          }
          if (metrics.documentWidth > width + 6)
            problems.push('horizontal overflow by ' + (metrics.documentWidth - width) + 'px');
          const screenshot = route.name + '-' + width + '-' + mode + '.png';
          await page.screenshot({ path: join(out, screenshot), fullPage: false, animations: 'disabled' });
          findings.push({ route: route.name, width, mode, status, ...metrics, problems, runtimeErrors: errors.slice(0, 5), screenshot });
          console.log((problems.length ? 'WARN ' : 'PASS ') + route.name + ' ' + width + ' ' + mode + (problems.length ? ': ' + problems.join('; ') : ''));
          if (problems.length && metrics.overflowCandidates.length)
            console.log('CULPRITS ' + route.name + ' ' + width + ' ' + mode + ' ' + JSON.stringify(metrics.overflowCandidates));
        } catch (error) {
          findings.push({ route: route.name, width, mode, problems: [String(error)], runtimeErrors: errors });
          console.error('ERROR ' + route.name + ' ' + width + ' ' + mode + ' ' + error);
        } finally {
          await context.close();
        }
      }
    }
  }
} finally {
  await browser.close();
  await writeFile(join(out, 'report.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    root,
    scans: findings.length,
    warnings: findings.filter(f => f.problems.length).length,
    findings,
  }, null, 2));
}
console.log('Visual audit: ' + findings.length + ' scans, ' + findings.filter(f => f.problems.length).length + ' warnings.');
/* Geometric/accessibility smoke tests can now block a regression.
   Real-phone certification and WCAG review remain distinct checks. */
if (process.env.INGLY_VISUAL_STRICT === '1' && findings.some(x => x.problems.length)) {
  console.error('INGLY visual regression detected — see report.json and screenshots.');
  process.exitCode = 1;
}
