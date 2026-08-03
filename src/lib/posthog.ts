export type PostHogStats = {
  viewsToday: number;
  views7d: number;
  visitors7d: number;
  peakDay: number;
  updatedAt: string;
};

type QueryRow = unknown[];
type QueryResponse = { results?: QueryRow[] };

type PostHogConfig = {
  apiHost: string;
  projectId: string;
  personalApiKey: string;
};

function getConfig(): PostHogConfig | null {
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
  const projectId = process.env.POSTHOG_PROJECT_ID?.trim();
  if (!personalApiKey || !projectId) return null;

  return {
    apiHost: (process.env.POSTHOG_API_HOST || 'https://us.posthog.com').replace(/\/$/, ''),
    projectId,
    personalApiKey,
  };
}

export function isPostHogStatsConfigured() {
  return getConfig() !== null;
}

async function runQuery(query: string, name: string): Promise<QueryRow | null> {
  const config = getConfig();
  if (!config) return null;

  const response = await fetch(`${config.apiHost}/api/projects/${encodeURIComponent(config.projectId)}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.personalApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query }, name }),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`PostHog query failed with status ${response.status}`);
  const payload = await response.json() as QueryResponse;
  return payload.results?.[0] || null;
}

function toNumber(value: unknown) {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

export async function getPostHogStats(): Promise<PostHogStats | null> {
  if (!isPostHogStatsConfigured()) return null;

  const overview = await runQuery(
    `SELECT
      countIf(event = '$pageview' AND timestamp >= now() - interval 24 hour),
      countIf(event = '$pageview' AND timestamp >= now() - interval 7 day),
      uniqExactIf(distinct_id, event = '$pageview' AND timestamp >= now() - interval 7 day),
    FROM events`,
    'letsvibecodeit live analytics overview',
  );
  const peak = await runQuery(
    `SELECT count() FROM events
      WHERE event = '$pageview' AND timestamp >= now() - interval 30 day
      GROUP BY toDate(timestamp) ORDER BY count() DESC LIMIT 1`,
    'letsvibecodeit peak daily pageviews',
  );

  return {
    viewsToday: toNumber(overview?.[0]),
    views7d: toNumber(overview?.[1]),
    visitors7d: toNumber(overview?.[2]),
    peakDay: toNumber(peak?.[0]),
    updatedAt: new Date().toISOString(),
  };
}