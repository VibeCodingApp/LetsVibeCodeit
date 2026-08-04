const KEY = 'lv:voted';

function readMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function getLocalVote(slug: string): string | null {
  return readMap()[slug] ?? null;
}

export function setLocalVote(slug: string, verdict: 'yes' | 'kinda' | 'no') {
  if (typeof window === 'undefined') return;
  try {
    const map = readMap();
    map[slug] = verdict;
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {}
}

export function getLocalVoteDeltas(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [slug, verdict] of Object.entries(readMap())) {
    if (verdict === 'yes') out[slug] = 1;
  }
  return out;
}
