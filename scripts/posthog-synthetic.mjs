import { connect as tcpConnect } from 'node:net';
import { connect as tlsConnect } from 'node:tls';
import { fetchProxyList } from './proxy-list.mjs';

const DEFAULT_HOST = 'https://us.i.posthog.com';
const DEFAULT_BATCH_SIZE = 500;
const DEFAULT_CONCURRENCY = 2;
const DEFAULT_PROXY_CAP = 25;
const PROXY_TIMEOUT_MS = 10000;

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

function makeEvents(users, pageviews, runId, ips) {
  const base = Math.floor(pageviews / users);
  const remainder = pageviews % users;
  const events = [];

  for (let userIndex = 0; userIndex < users; userIndex += 1) {
    const userPages = base + (userIndex < remainder ? 1 : 0);
    for (let pageIndex = 0; pageIndex < userPages; pageIndex += 1) {
      const properties = {
        distinct_id: `synthetic-${runId}-${userIndex + 1}`,
        synthetic_test: true,
        test_run: runId,
        path: ['/', '/categories', '/stats', '/sponsor'][pageIndex % 4],
        page_index: pageIndex + 1,
        user_index: userIndex + 1,
        source: 'posthog-synthetic-script',
      };
      if (ips.length > 0) {
        properties.$ip = ips[(userIndex + pageIndex) % ips.length].ip;
      }
      events.push({
        event: 'synthetic_pageview',
        properties,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return events;
}

async function sendBatch(host, token, batch) {
  const response = await fetch(`${host.replace(/\/$/, '')}/batch/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: token, batch }),
  });

  if (!response.ok) {
    throw new Error(`PostHog capture failed: HTTP ${response.status}`);
  }
}

function postViaProxy(proxy, hostname, payload) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let handshake = '';
    const socket = tcpConnect({ host: proxy.ip, port: proxy.port });
    const fail = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      reject(error);
    };

    const timer = setTimeout(
      () => fail(new Error(`proxy timeout ${proxy.ip}:${proxy.port}`)),
      PROXY_TIMEOUT_MS,
    );
    socket.setTimeout(PROXY_TIMEOUT_MS, () => fail(new Error(`proxy timeout ${proxy.ip}:${proxy.port}`)));
    socket.on('error', fail);

    socket.on('connect', () => {
      socket.write(`CONNECT ${hostname}:443 HTTP/1.1\r\nHost: ${hostname}:443\r\n\r\n`);
    });

    socket.on('data', chunk => {
      if (settled) return;
      handshake += chunk.toString('latin1');
      const headerEnd = handshake.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;
      if (!handshake.slice(0, headerEnd).includes(' 200 ')) {
        fail(new Error(`CONNECT rejected by ${proxy.ip}:${proxy.port}: ${handshake.split('\r\n')[0]}`));
        return;
      }
      settled = true;
      clearTimeout(timer);
      socket.setTimeout(0);
      socket.removeAllListeners('data');
      socket.removeAllListeners('error');
      socket.removeAllListeners('timeout');

      const tls = tlsConnect({ socket, servername: hostname }, () => {
        const body = JSON.stringify(payload);
        tls.write(
          `POST /batch/ HTTP/1.1\r\nHost: ${hostname}\r\nContent-Type: application/json\r\n` +
            `Content-Length: ${Buffer.byteLength(body)}\r\nConnection: close\r\n\r\n${body}`,
        );
      });

      let response = '';
      tls.on('data', data => {
        response += data.toString('latin1');
      });
      tls.on('error', error => reject(error));
      tls.on('end', () => {
        if (/^HTTP\/1\.[01] 2\d\d/.test(response)) {
          resolve();
        } else {
          reject(new Error(`capture via proxy ${proxy.ip}:${proxy.port} failed: ${response.split('\r\n')[0]}`));
        }
      });
    });
  });
}

async function main() {
  const users = readArg('--users', 16000);
  const pageviews = readArg('--pageviews', 70000);
  const batchSize = readArg('--batch-size', DEFAULT_BATCH_SIZE);
  const concurrency = readArg('--concurrency', DEFAULT_CONCURRENCY);
  const proxyMode = readStringArg('--proxy-mode', 'ip');
  const proxyCap = readArg('--proxy-cap', DEFAULT_PROXY_CAP);
  const proxyFile = readStringArg('--proxy-file', '');
  const host = process.env.POSTHOG_CAPTURE_HOST || DEFAULT_HOST;
  const token = process.env.POSTHOG_PROJECT_TOKEN || process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const runId = process.env.POSTHOG_TEST_RUN || `run-${Date.now()}`;
  const send = hasFlag('--send');

  if (!token) throw new Error('Set POSTHOG_PROJECT_TOKEN or NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN first.');
  if (!Number.isInteger(users) || users < 1) throw new Error('--users must be a positive integer.');
  if (!Number.isInteger(pageviews) || pageviews < users) throw new Error('--pageviews must be >= --users.');
  if (!['ip', 'route', 'off'].includes(proxyMode)) {
    throw new Error("--proxy-mode must be 'ip', 'route' or 'off'.");
  }
  if (!Number.isInteger(proxyCap) || proxyCap < 1) throw new Error('--proxy-cap must be a positive integer.');

  const proxies = proxyMode === 'off' ? [] : await fetchProxyList(proxyFile);
  if (proxyMode === 'route' && proxies.length === 0) {
    throw new Error('--proxy-mode route needs proxies; could not fetch the free proxy list. Use --proxy-file or retry.');
  }

  const ips = proxyMode === 'ip' ? proxies : [];
  const events = makeEvents(users, pageviews, runId, ips);

  const plan = [];
  if (proxyMode === 'route') {
    const routed = events.slice(0, Math.min(proxyCap, events.length));
    const rest = events.slice(routed.length);
    routed.forEach((event, index) => plan.push({ events: [event], proxy: proxies[index % proxies.length] }));
    for (let index = 0; index < rest.length; index += batchSize) {
      plan.push({ events: rest.slice(index, index + batchSize), proxy: null });
    }
    console.log(
      `run=${runId} users=${users} pageviews=${pageviews} proxy_mode=route proxy_list=${proxies.length} ` +
        `routed=${routed.length} direct=${rest.length}`,
    );
  } else {
    for (let index = 0; index < events.length; index += batchSize) {
      plan.push({ events: events.slice(index, index + batchSize), proxy: null });
    }
    console.log(
      `run=${runId} users=${users} pageviews=${pageviews} proxy_mode=${proxyMode} proxy_list=${proxies.length} batches=${plan.length}`,
    );
  }

  if (!send) {
    console.log('dry_run=true; add --send to publish synthetic_pageview events');
    return;
  }

  const hostname = host.replace(/^https?:\/\//, '');
  let cursor = 0;
  let failed = 0;
  let retryProxyCursor = 0;

  async function worker() {
    while (cursor < plan.length) {
      const item = plan[cursor];
      cursor += 1;
      const payload = { api_key: token, batch: item.events };
      try {
        if (item.proxy) {
          await postViaProxy(item.proxy, hostname, payload);
        } else {
          await sendBatch(host, token, item.events);
        }
      } catch (error) {
        try {
          const retryProxy = proxies[retryProxyCursor % proxies.length];
          retryProxyCursor += 1;
          if (item.proxy) {
            await postViaProxy(retryProxy, hostname, payload);
          } else {
            await sendBatch(host, token, item.events);
          }
        } catch {
          failed += 1;
          if (failed <= 3) console.log(`  send_error=${error instanceof Error ? error.message : error}`);
        }
      }
      process.stdout.write(`sent=${cursor}/${plan.length} failed=${failed}\r`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, plan.length) }, worker));
  console.log(`\ncomplete=true run=${runId} failed=${failed}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
