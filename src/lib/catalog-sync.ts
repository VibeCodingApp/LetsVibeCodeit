import { CATEGORIES, MOAT_TAGS } from './constants';
import { getAllApps } from './apps';
import { getCatalogSyncSha, saveCatalogSyncSha } from './db';

const API = 'https://api.github.com';
const OWNER = 'canivibecodeit';
const SOURCE_REPO = 'canivibecodeit';
const TARGET_REPO = 'VibeCodingApp/LetsVibeCodeit';

type GitHubTreeEntry = { path: string; type: string; sha: string };
type SyncResult = { sourceSha: string; added: string[]; skipped: { slug: string; reason: string }[]; committed: boolean };

async function github<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('github_token_missing');
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/vnd.github+json');
  headers.set('User-Agent', 'LetsVibeCodeit-catalog-sync');
  headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API}${path}`, { ...init, headers, cache: 'no-store' });
  if (!response.ok) throw new Error(`github_request_failed:${response.status}`);
  return response.json() as Promise<T>;
}

export async function syncExternalApps(): Promise<SyncResult> {
  const ref = await github<{ object: { sha: string } }>(`/repos/${OWNER}/${SOURCE_REPO}/git/ref/heads/main`);
  const sourceSha = ref.object.sha;
  const previousSha = await getCatalogSyncSha();
  if (previousSha === sourceSha) return { sourceSha, added: [], skipped: [], committed: false };

  const tree = await github<{ tree: GitHubTreeEntry[] }>(`/repos/${OWNER}/${SOURCE_REPO}/git/trees/${sourceSha}?recursive=1`);
  const localSlugs = new Set(getAllApps().map(app => app.slug));
  const candidates = tree.tree.filter(entry => entry.type === 'blob' && /^data\/apps\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(entry.path));
  const additions: { slug: string; content: string }[] = [];
  const skipped: { slug: string; reason: string }[] = [];

  for (const entry of candidates) {
    const slug = entry.path.slice('data/apps/'.length, -'.json'.length);
    if (localSlugs.has(slug)) continue;
    const blob = await github<{ content: string }>(`/repos/${OWNER}/${SOURCE_REPO}/git/blobs/${entry.sha}`);
    const content = Buffer.from(blob.content.replace(/\s/g, ''), 'base64').toString('utf8');
    try {
      const app = JSON.parse(content) as Record<string, unknown>;
      validateApp(app, slug);
      additions.push({ slug, content: `${JSON.stringify(app, null, 2)}\n` });
    } catch (error) {
      skipped.push({ slug, reason: error instanceof Error ? error.message : 'invalid_app' });
    }
  }

  if (additions.length) await commitAdditions(sourceSha, additions);
  await saveCatalogSyncSha(sourceSha);
  return { sourceSha, added: additions.map(item => item.slug), skipped, committed: additions.length > 0 };
}

function validateApp(app: Record<string, unknown>, slug: string): void {
  const required = ['slug', 'name', 'domain', 'category', 'tagline', 'priceMonthly', 'pricing', 'verdict', 'verdictConfidence', 'verdictSummary', 'coreLoopDIY', 'diyTimeEstimate', 'requirements', 'whatYouLose', 'moatTags', 'moatNotes', 'whyPeopleStillPay', 'priorArt', 'relatedSlugs', 'pagePriority', 'verifiedOneShot', 'notes', 'prompt'];
  const missing = required.find(key => !(key in app));
  if (missing) throw new Error(`missing_${missing}`);
  if (app.slug !== slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('slug_mismatch');
  if (typeof app.name !== 'string' || typeof app.domain !== 'string' || typeof app.tagline !== 'string') throw new Error('invalid_text_fields');
  if (typeof app.category !== 'string' || !(app.category in CATEGORIES)) throw new Error(`invalid_category_${String(app.category)}`);
  if (app.verdict !== 'yes' && app.verdict !== 'kinda' && app.verdict !== 'no') throw new Error('invalid_verdict');
  if (!Array.isArray(app.requirements) || !Array.isArray(app.whatYouLose) || !Array.isArray(app.moatTags) || !Array.isArray(app.priorArt) || !Array.isArray(app.relatedSlugs)) throw new Error('invalid_lists');
  if (app.moatTags.some(tag => typeof tag !== 'string' || !(tag in MOAT_TAGS))) throw new Error('invalid_moat_tag');
  if (typeof app.prompt !== 'string' && app.prompt !== null) throw new Error('invalid_prompt');
  if (/(sk_live_|ghp_|postgres(?:ql)?:\/\/|BEGIN (?:RSA|OPENSSH) PRIVATE KEY)/i.test(JSON.stringify(app))) throw new Error('credential_like_content');
}

async function commitAdditions(sourceSha: string, additions: { slug: string; content: string }[]): Promise<void> {
  const head = await github<{ object: { sha: string } }>(`/repos/${TARGET_REPO}/git/ref/heads/main`);
  const commit = await github<{ sha: string; tree: { sha: string } }>(`/repos/${TARGET_REPO}/git/commits/${head.object.sha}`);
  const historyFile = await github<{ content: string }>(`/repos/${TARGET_REPO}/contents/data/catalog-history.json?ref=main`);
  const history = JSON.parse(Buffer.from(historyFile.content.replace(/\s/g, ''), 'base64').toString('utf8')) as { baselineDate: string; apps: Record<string, string> };
  const addedAt = new Date().toISOString();
  additions.forEach(item => { history.apps[item.slug] = addedAt; });
  const tree = await github<{ sha: string }>(`/repos/${TARGET_REPO}/git/trees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_tree: commit.tree.sha, tree: [...additions.map(item => ({ path: `data/apps/${item.slug}.json`, mode: '100644', type: 'blob', content: item.content })), { path: 'data/catalog-history.json', mode: '100644', type: 'blob', content: `${JSON.stringify(history, null, 2)}\n` }] }),
  });
  const created = await github<{ sha: string }>(`/repos/${TARGET_REPO}/git/commits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: `chore(catalog): sync ${additions.length} community app${additions.length === 1 ? '' : 's'} from upstream`, tree: tree.sha, parents: [head.object.sha] }),
  });
  await github(`/repos/${TARGET_REPO}/git/refs/heads/main`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sha: created.sha, force: false }) });
  void sourceSha;
}
