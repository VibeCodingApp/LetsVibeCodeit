const LIST_TIMEOUT_MS = 8000;

const PROXY_LIST_URLS = [
  'https://cdn.jsdelivr.net/gh/proxyscrape/free-proxy-list@main/proxies/protocols/https/data.json',
  'https://cdn.jsdelivr.net/gh/proxyscrape/free-proxy-list@main/proxies/protocols/https/data.txt',
  'https://cdn.jsdelivr.net/gh/proxyscrape/free-proxy-list@main/proxies/all/data.json',
  'https://cdn.jsdelivr.net/gh/proxyscrape/free-proxy-list@main/proxies/all/data.txt',
];

export function isValidIpv4(ip) {
  const parts = ip.split('.');
  return parts.length === 4 && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

export function parseTxtProxies(text) {
  const entries = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(/^(?:https?:\/\/)?(\d{1,3}(?:\.\d{1,3}){3}):(\d{2,5})$/);
    if (match && isValidIpv4(match[1])) entries.push({ ip: match[1], port: Number(match[2]) });
  }
  return entries;
}

export async function fetchProxyList(proxyFile) {
  if (proxyFile) {
    const { readFileSync } = await import('node:fs');
    return parseTxtProxies(readFileSync(proxyFile, 'utf8'));
  }
  for (const url of PROXY_LIST_URLS) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(LIST_TIMEOUT_MS) });
      if (!response.ok) continue;
      const text = await response.text();
      let entries = [];
      if (url.endsWith('.json')) {
        try {
          const data = JSON.parse(text);
          entries = Array.isArray(data)
            ? data
                .filter(p => p && typeof p.ip === 'string' && Number.isInteger(p.port) && isValidIpv4(p.ip))
                .map(p => ({ ip: p.ip, port: p.port }))
            : [];
        } catch {
          entries = [];
        }
      } else {
        entries = parseTxtProxies(text);
      }
      if (entries.length > 0) return entries;
    } catch {
      // try next source
    }
  }
  return [];
}
