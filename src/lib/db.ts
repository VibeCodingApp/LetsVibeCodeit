import { createPool } from '@vercel/postgres';
import type { SponsorPlacement } from './sponsors';

const pool = createPool({ connectionString: process.env.POSTGRES_URL });

export interface SponsorRow {
  id: number;
  session_id: string;
  plan: string;
  slot_id: string;
  name: string;
  description: string;
  website: string;
  creative_mode: string;
  banner_base64: string;
  icon_base64: string;
  marquee_icon_base64: string;
  marquee_text: string;
  activated_at: number;
  expires_at: number;
  created_at: string;
}

function toPlacement(row: SponsorRow): SponsorPlacement {
  const isBanner = row.creative_mode === 'banner';
  const facturRailOverride = row.name.toLowerCase() === 'facturapp' && row.slot_id === 'left-1';
  return {
    sessionId: row.session_id,
    plan: row.plan as SponsorPlacement['plan'],
    slotId: row.slot_id,
    name: row.name,
    description: row.description,
    website: row.website,
    iconUrl: isBanner ? '' : dataUri(row.icon_base64),
    marqueeIconUrl: isBanner ? dataUri(row.marquee_icon_base64) : dataUri(row.icon_base64),
    marqueeText: row.marquee_text || row.name,
    bannerUrl: isBanner ? (facturRailOverride ? '/bannerfacturapp.png' : dataUri(row.banner_base64)) : '',
    creativeMode: (facturRailOverride || row.creative_mode === 'banner' ? 'banner' : 'icon-text') as 'banner' | 'icon-text',
    expiresAt: row.expires_at,
  };
}

function dataUri(base64: string): string {
  return base64 ? `data:image/webp;base64,${base64}` : '';
}

export async function insertPlacement(data: {
  sessionId: string;
  plan: string;
  slotId: string;
  name: string;
  description: string;
  website: string;
  creativeMode: string;
  bannerBase64: string;
  iconBase64: string;
  marqueeIconBase64: string;
  marqueeText: string;
  expiresAt: number;
}): Promise<void> {
  const activatedAt = Date.now();
  await pool.query(
    `INSERT INTO sponsor_placements (session_id, plan, slot_id, name, description, website, creative_mode, banner_base64, icon_base64, marquee_icon_base64, marquee_text, activated_at, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [data.sessionId, data.plan, data.slotId, data.name, data.description, data.website, data.creativeMode, data.bannerBase64, data.iconBase64, data.marqueeIconBase64, data.marqueeText, activatedAt, data.expiresAt],
  );
}

export async function getActivePlacements(): Promise<SponsorPlacement[]> {
  const result = await pool.query<SponsorRow>(
    'SELECT * FROM sponsor_placements WHERE expires_at > $1 ORDER BY activated_at DESC',
    [Date.now()],
  );
  const placements = result.rows.map(toPlacement);
  const factur = result.rows.find(row => row.name.toLowerCase() === 'facturapp' && row.slot_id === 'left-1');
  if (factur && factur.activated_at + 7 * 24 * 60 * 60 * 1000 > Date.now() && factur.expires_at > Date.now()) {
    placements.push({
      ...toPlacement(factur),
      sessionId: `${factur.session_id}:in-list-1`,
      plan: 'inList',
      slotId: 'in-list-1',
      bannerUrl: '/inlistfacturapp.png',
      creativeMode: 'banner',
      expiresAt: Math.min(factur.expires_at, factur.activated_at + 7 * 24 * 60 * 60 * 1000),
    });
  }
  return placements;
}

export async function isSlotReserved(slotId: string): Promise<boolean> {
  const result = await pool.query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM sponsor_placements WHERE slot_id = $1 AND expires_at > $2) AS exists',
    [slotId, Date.now()],
  );
  if (result.rows[0]?.exists) return true;
  if (slotId !== 'in-list-1') return false;
  const factur = await pool.query<{ activated_at: number; expires_at: number }>(
    `SELECT activated_at, expires_at FROM sponsor_placements WHERE LOWER(name) = 'facturapp' AND slot_id = 'left-1' ORDER BY activated_at DESC LIMIT 1`,
  );
  const row = factur.rows[0];
  return Boolean(row && row.expires_at > Date.now() && row.activated_at + 7 * 24 * 60 * 60 * 1000 > Date.now());
}

export async function getCatalogSyncSha(source = 'canivibecodeit/canivibecodeit'): Promise<string> {
  await pool.query('CREATE TABLE IF NOT EXISTS catalog_sync_state (source TEXT PRIMARY KEY, source_sha TEXT NOT NULL, checked_at BIGINT NOT NULL)');
  const result = await pool.query<{ source_sha: string }>('SELECT source_sha FROM catalog_sync_state WHERE source = $1', [source]);
  return result.rows[0]?.source_sha || '';
}

export async function saveCatalogSyncSha(sourceSha: string, source = 'canivibecodeit/canivibecodeit'): Promise<void> {
  await pool.query(
    `INSERT INTO catalog_sync_state (source, source_sha, checked_at) VALUES ($1,$2,$3)
     ON CONFLICT (source) DO UPDATE SET source_sha = EXCLUDED.source_sha, checked_at = EXCLUDED.checked_at`,
    [source, sourceSha, Date.now()],
  );
}
