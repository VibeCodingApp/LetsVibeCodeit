import { connect as tcpConnect } from 'node:net';
import { chromium } from 'playwright';
import { fetchProxyList } from './proxy-list.mjs';

const DEFAULT_BASE_URL = 'https://letsvibecodeit.vercel.app';
const DEFAULT_SESSIONS = 10;
const DEFAULT_CONCURRENCY = 4;
const DEFAULT_MIN_PAGES = 3;
const DEFAULT_MAX_PAGES = 6;
const DEFAULT_PROBE = 30;
const NAV_TIMEOUT_MS = 25000;
const CAPTURE_WAIT_MS = 8000;
const PROBE_TIMEOUT_MS = 6000;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

const LOCALES = ['en-US', 'en-GB', 'es-ES', 'es-MX', 'de-DE', 'fr-FR', 'pt-BR'];
const TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/Madrid',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'America/Mexico_City',
  'America/Sao_Paulo',
];
const FALLBACK_PATHS = ['/categories', '/stats', '/sponsor', '/moats', '/vibecode-this-site'];

function readArg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : Number(process.argv[index + 1]);
}

function readStringArg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function probeProxy(proxy, targetHost, targetPort) {
  return new Promise(resolve => {
    const socket = tcpConnect({ host: proxy.ip, port: proxy.port });
    let buffer = '';
    const finish = ok => {
      clearTimeout(timer);
      socket.destroy();
      resolve(ok);
    };
    const timer = setTimeout(() => finish(false), PROBE_TIMEOUT_MS);
    socket.on('error', () => finish(false));
    socket.on('connect', () => {
      socket.write(`CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\nHost: ${targetHost}:${targetPort}\r\n\r\n`);
    });
    socket.on('data', chunk => {
      buffer += chunk.toString('latin1');
      if (buffer.includes('\r\n\r\n')) finish(buffer.includes(' 200 '));
    });
  });
}

async function probeProxies(proxies, probeCount, targetHost) {
  const candidates = shuffle(proxies).slice(0, probeCount);
  const results = await Promise.all(candidates.map(proxy => probeProxy(proxy, targetHost, 443)));
  const live = candidates.filter((proxy, index) => results[index]);
  console.log(`probe=${candidates.length} live=${live.length}`);
  return live.length > 0 ? live : proxies;
}

async function collectInternalLinks(page) {
  return page.$$eval('a[href]', anchors =>
    anchors
      .map(anchor => anchor.getAttribute('href'))
      .filter(href => href && href.startsWith('/') && href.length > 1 && !href.startsWith('/#'))
      .map(href => href.split('?')[0].split('#')[0])
      .filter((href, index, all) => all.indexOf(href) === index),
  );
}

async function runSession(browser, proxy, runId, baseUrl, minPages, maxPages) {
  const context = await browser.newContext({
    proxy: proxy ? { server: `http://${proxy.ip}:${proxy.port}` } : undefined,
    userAgent: pick(USER_AGENTS),
    viewport: { width: randomInt(1280, 1920), height: randomInt(800, 1080) },
    locale: pick(LOCALES),
    timezoneId: pick(TIMEZONES),
    colorScheme: pick(['light', 'dark']),
  });

  try {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    const page = await context.newPage();
    let captureOk = false;
    page.on('response', response => {
      const url = response.url();
      if (
        (url.includes('/e/') || url.includes('/batch/') || url.includes('/s/')) &&
        url.includes('posthog') &&
        response.ok()
      ) {
        captureOk = true;
      }
    });

    const entry = `${baseUrl}?ph_synthetic=1&ph_run=${runId}`;
    await page.goto(entry, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
    await page.waitForFunction(() => typeof window.posthog === 'object', { timeout: 10000 });
    await page.waitForTimeout(randomInt(1500, 3500));

    const visited = new Set(['/']);
    const pagesToVisit = randomInt(minPages, maxPages);

    for (let index = 0; index < pagesToVisit; index += 1) {
      const links = await collectInternalLinks(page);
      const unvisited = links.filter(href => !visited.has(href));
      let href;
      if (unvisited.length > 0) {
        href = pick(unvisited);
      } else {
        const fallback = FALLBACK_PATHS.filter(path => !visited.has(path));
        if (fallback.length === 0) break;
        href = pick(fallback);
      }
      visited.add(href);
      await page.goto(new URL(href, baseUrl).toString(), {
        waitUntil: 'domcontentloaded',
        timeout: NAV_TIMEOUT_MS,
      });
      await page.waitForTimeout(randomInt(700, 2400));
      await page.mouse.wheel(0, randomInt(300, 1400));
      await page.waitForTimeout(randomInt(300, 1000));
    }

    const deadline = Date.now() + CAPTURE_WAIT_MS;
    while (!captureOk && Date.now() < deadline) {
      await page.waitForTimeout(500);
    }
    if (!captureOk) throw new Error('no PostHog capture response (proxy blocked analytics)');
  } finally {
    await context.close().catch(() => {});
  }
}

async function main() {
  const sessions = readArg('--sessions', DEFAULT_SESSIONS);
  const concurrency = readArg('--concurrency', DEFAULT_CONCURRENCY);
  const minPages = readArg('--min-pages', DEFAULT_MIN_PAGES);
  const maxPages = readArg('--max-pages', DEFAULT_MAX_PAGES);
  const proxyMode = readStringArg('--proxy-mode', 'route');
  const proxyFile = readStringArg('--proxy-file', '');
  const probeCount = readArg('--probe', DEFAULT_PROBE);
  const baseUrl = (readStringArg('--base-url', DEFAULT_BASE_URL) || DEFAULT_BASE_URL).replace(/\/+$/, '');
  const runId = process.env.POSTHOG_TEST_RUN || `browser-${Date.now()}`;
  const headed = hasFlag('--headed');

  if (!Number.isInteger(sessions) || sessions < 1) throw new Error('--sessions must be a positive integer.');
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error('--concurrency must be a positive integer.');
  if (!Number.isInteger(minPages) || minPages < 1 || minPages > maxPages) {
    throw new Error('--min-pages must be a positive integer <= --max-pages.');
  }
  if (!Number.isInteger(maxPages) || maxPages < minPages) {
    throw new Error('--max-pages must be >= --min-pages.');
  }
  if (!['route', 'off'].includes(proxyMode)) throw new Error("--proxy-mode must be 'route' or 'off'.");

  const proxies = proxyMode === 'route' ? await fetchProxyList(proxyFile) : [];
  if (proxyMode === 'route' && proxies.length === 0) {
    throw new Error('--proxy-mode route needs proxies; could not fetch the free proxy list. Use --proxy-file or retry.');
  }
  if (!Number.isInteger(probeCount) || probeCount < 0) throw new Error('--probe must be a non-negative integer.');
  const liveProxies =
    proxyMode === 'route' && probeCount > 0 ? await probeProxies(proxies, probeCount, new URL(baseUrl).host) : proxies;

  const browser = await chromium.launch({ headless: !headed });
  let cursor = 0;
  let ok = 0;
  let failed = 0;

  async function worker() {
    while (cursor < sessions) {
      const sessionIndex = cursor;
      cursor += 1;
      let success = false;
      for (let attempt = 0; attempt < 3 && !success; attempt += 1) {
        const proxy = liveProxies.length > 0 ? pick(liveProxies) : null;
        try {
          await runSession(browser, proxy, runId, baseUrl, minPages, maxPages);
          success = true;
        } catch (error) {
          if (attempt === 2) {
            console.log(`  session_error(${sessionIndex + 1})=${error instanceof Error ? error.message : error}`);
          }
        }
      }
      if (success) ok += 1;
      else failed += 1;
      process.stdout.write(`sessions=${ok + failed}/${sessions} ok=${ok} failed=${failed}\r`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, sessions) }, worker));
  await browser.close();
  console.log(
    `\ncomplete=true run=${runId} sessions_ok=${ok} sessions_failed=${failed} proxy_list=${proxies.length} live_proxies=${liveProxies.length} base_url=${baseUrl}`,
  );
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
